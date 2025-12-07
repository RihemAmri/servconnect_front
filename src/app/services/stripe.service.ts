import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { switchMap, catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';
import { environment } from '../../environments/environment';

// Stripe types
declare var Stripe: any;

interface PaymentIntentResponse {
  success: boolean;
  clientSecret: string;
  paymentIntentId: string;
  amount: number;
  currency: string;
}

interface ConfirmPaymentResponse {
  success: boolean;
  message: string;
  data: any;
}

@Injectable({
  providedIn: 'root'
})
export class StripeService {
  private stripe: any = null;
  private elements: any = null;
  private cardElement: any = null;
  private isBrowser: boolean;

  // 🔑 Clé publique Stripe (mode test)
  private readonly STRIPE_PUBLISHABLE_KEY = 'pk_test_51SbkpwFYoZaFC7Fyx0vkSTI6sOhVd70Jw3DmWUk4hjSmNdHsMrx3VgAjAZQ1zxurA9jMdsTRclCkmir90Epf2y9j00VrwtTimb';

  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  /**
   * Charger le SDK Stripe dynamiquement
   */
  async loadStripe(): Promise<boolean> {
    if (!this.isBrowser) return false;

    if (this.stripe) return true;

    return new Promise((resolve) => {
      // Vérifier si Stripe est déjà chargé
      if ((window as any).Stripe) {
        this.stripe = (window as any).Stripe(this.STRIPE_PUBLISHABLE_KEY);
        resolve(true);
        return;
      }

      // Charger le script Stripe
      const script = document.createElement('script');
      script.src = 'https://js.stripe.com/v3/';
      script.async = true;
      script.onload = () => {
        this.stripe = (window as any).Stripe(this.STRIPE_PUBLISHABLE_KEY);
        resolve(true);
      };
      script.onerror = () => {
        console.error('Erreur lors du chargement de Stripe');
        resolve(false);
      };
      document.head.appendChild(script);
    });
  }

  /**
   * Créer les éléments de carte Stripe
   */
  async createCardElement(containerId: string): Promise<boolean> {
    if (!this.isBrowser) return false;

    const loaded = await this.loadStripe();
    if (!loaded) return false;

    try {
      this.elements = this.stripe.elements({
        locale: 'fr'
      });

      // Style personnalisé pour le champ de carte
      const style = {
        base: {
          color: '#1f2937',
          fontFamily: '"Inter", "Segoe UI", system-ui, sans-serif',
          fontSmoothing: 'antialiased',
          fontSize: '16px',
          '::placeholder': {
            color: '#9ca3af'
          },
          iconColor: '#025ddd'
        },
        invalid: {
          color: '#ef4444',
          iconColor: '#ef4444'
        }
      };

      this.cardElement = this.elements.create('card', {
        style,
        hidePostalCode: true
      });

      const container = document.getElementById(containerId);
      if (container) {
        this.cardElement.mount('#' + containerId);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Erreur création élément carte:', error);
      return false;
    }
  }

  /**
   * Créer un Payment Intent côté serveur
   */
  createPaymentIntent(bookingId: string, amount: number): Observable<PaymentIntentResponse> {
    return this.http.post<PaymentIntentResponse>(
      `${environment.apiUrl}/api/stripe/create-payment-intent`,
      { bookingId, amount }
    );
  }

  /**
   * Confirmer le paiement avec la carte
   */
  async confirmCardPayment(clientSecret: string, cardholderName: string): Promise<{
    success: boolean;
    paymentIntent?: any;
    error?: string;
  }> {
    // 🧪 MODE TEST : Si le clientSecret contient 'test', simuler le succès
    if (clientSecret.includes('_test_') || clientSecret.includes('_secret_test')) {
      console.log('🧪 Mode test Stripe - Paiement simulé');
      return { 
        success: true, 
        paymentIntent: { 
          id: clientSecret.split('_secret')[0],
          status: 'succeeded' 
        } 
      };
    }

    if (!this.stripe || !this.cardElement) {
      return { success: false, error: 'Stripe non initialisé' };
    }

    try {
      const { paymentIntent, error } = await this.stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: this.cardElement,
            billing_details: {
              name: cardholderName
            }
          }
        }
      );

      if (error) {
        return { success: false, error: error.message };
      }

      if (paymentIntent.status === 'succeeded') {
        return { success: true, paymentIntent };
      }

      return { success: false, error: 'Paiement non complété' };
    } catch (err: any) {
      return { success: false, error: err.message || 'Erreur de paiement' };
    }
  }

  /**
   * Confirmer le paiement côté serveur (mettre à jour la réservation)
   */
  confirmPaymentOnServer(paymentIntentId: string, bookingId: string): Observable<ConfirmPaymentResponse> {
    return this.http.post<ConfirmPaymentResponse>(
      `${environment.apiUrl}/api/stripe/confirm-payment`,
      { paymentIntentId, bookingId }
    );
  }

  /**
   * Récupérer les détails d'un paiement
   */
  getPaymentDetails(paymentIntentId: string): Observable<any> {
    return this.http.get(`${environment.apiUrl}/api/stripe/payment/${paymentIntentId}`);
  }

  /**
   * Détruire l'élément de carte
   */
  destroyCardElement(): void {
    if (this.cardElement) {
      this.cardElement.destroy();
      this.cardElement = null;
    }
    this.elements = null;
  }

  /**
   * Écouter les erreurs de carte
   */
  onCardChange(callback: (event: any) => void): void {
    if (this.cardElement) {
      this.cardElement.on('change', callback);
    }
  }

  /**
   * Vérifier si Stripe est prêt
   */
  isReady(): boolean {
    return this.stripe !== null && this.cardElement !== null;
  }
}
