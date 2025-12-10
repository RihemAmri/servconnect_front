import { Component, OnInit, OnDestroy, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';
import { StripeService } from '../../../services/stripe.service';

interface BookingDetails {
  _id: string;
  provider: {
    _id: string;
    metier: string;
    user: {
      nom: string;
      prenom: string;
      photo?: string;
    };
  };
  date: string;
  time?: string;
  service: string;
  cause: string;
  location: { address: string };
  proposedPrice: number;
  estimatedDuration?: number;
  providerNotes?: string;
  status: string;
}

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.scss']
})
export class PaiementComponent implements OnInit, OnDestroy, AfterViewInit {
  // Booking data
  booking: BookingDetails | null = null;
  bookingId: string = '';
  clientId: string = '';
  isLoading = true;
  isProcessing = false;

  // Payment method selection
  selectedMethod: string = 'card';

  // Card payment form (pour les autres méthodes)
  cardName: string = '';
  cardNumber: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  saveCard: boolean = false;

  // Stripe
  stripeReady = false;
  stripeError: string = '';
  clientSecret: string = '';
  paymentIntentId: string = '';

  // Sobflous payment
  phoneNumber: string = '';

  // D17 payment
  d17Code: string = '';

  // Promo code
  promoCode: string = '';
  promoApplied: boolean = false;
  promoDiscount: number = 0;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private stripeService: StripeService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user._id) {
      this.clientId = user._id;
      this.bookingId = this.route.snapshot.paramMap.get('id') || '';
      
      if (this.bookingId) {
        this.loadBookingDetails();
      } else {
        this.isLoading = false;
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngAfterViewInit() {
    // Initialiser Stripe après le chargement de la vue
    if (this.selectedMethod === 'card') {
      setTimeout(() => this.initializeStripe(), 500);
    }
  }

  ngOnDestroy() {
    // Nettoyer les éléments Stripe
    this.stripeService.destroyCardElement();
  }

  async initializeStripe() {
    try {
      const success = await this.stripeService.createCardElement('stripe-card-element');
      if (success) {
        this.stripeReady = true;
        
        // Écouter les erreurs de carte
        this.stripeService.onCardChange((event: any) => {
          if (event.error) {
            this.stripeError = event.error.message;
          } else {
            this.stripeError = '';
          }
        });
      }
    } catch (error) {
      console.error('Erreur initialisation Stripe:', error);
    }
  }

  loadBookingDetails() {
    this.http
      .get<{ success: boolean; data: BookingDetails }>(
        `${environment.apiUrl}/api/bookings/${this.bookingId}`
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.booking = response.data;
            
            // Verify the booking is in accepted status
            if (this.booking.status !== 'accepted') {
              Swal.fire({
                icon: 'warning',
                title: 'Réservation non payable',
                text: 'Cette réservation n\'est pas encore acceptée par le prestataire.'
              }).then(() => {
                this.router.navigate(['/mes-reservations']);
              });
            }
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur chargement réservation:', error);
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger les détails de la réservation'
          }).then(() => {
            this.router.navigate(['/mes-reservations']);
          });
        }
      });
  }

  selectMethod(method: string) {
    this.selectedMethod = method;
    
    // Initialiser Stripe si on sélectionne la carte
    if (method === 'card' && !this.stripeReady) {
      setTimeout(() => this.initializeStripe(), 300);
    }
  }

  generateD17Code() {
    this.d17Code = Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  applyPromo() {
    if (this.promoCode.toUpperCase() === 'FIRST10') {
      this.promoApplied = true;
      this.promoDiscount = 10;
      Swal.fire({
        icon: 'success',
        title: 'Code promo appliqué !',
        text: 'Vous bénéficiez de 10% de réduction.',
        timer: 2000,
        showConfirmButton: false
      });
    } else if (this.promoCode.toUpperCase() === 'WELCOME20') {
      this.promoApplied = true;
      this.promoDiscount = 20;
      Swal.fire({
        icon: 'success',
        title: 'Code promo appliqué !',
        text: 'Vous bénéficiez de 20% de réduction.',
        timer: 2000,
        showConfirmButton: false
      });
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Code invalide',
        text: 'Ce code promo n\'est pas valide.'
      });
    }
  }

  getSubtotal(): number {
    return this.booking?.proposedPrice || 0;
  }

  getDiscount(): number {
    if (!this.promoApplied) return 0;
    return (this.getSubtotal() * this.promoDiscount) / 100;
  }

  getServiceFee(): number {
    return Math.round(this.getSubtotal() * 0.05); // 5% service fee
  }

  getTotal(): number {
    return this.getSubtotal() - this.getDiscount() + this.getServiceFee();
  }

  formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  }

  getProviderPhoto(): string {
    if (this.booking?.provider?.user?.photo) {
      return this.booking.provider.user.photo;
    }
    return 'https://via.placeholder.com/60?text=' + 
      (this.booking?.provider?.user?.prenom?.charAt(0) || 'P');
  }

  validateCardForm(): boolean {
    // Validation du nom sur la carte (seul champ manuel)
    if (!this.cardName || this.cardName.trim().length < 2) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Nom requis', 
        text: 'Veuillez entrer le nom tel qu\'il apparaît sur votre carte' 
      });
      return false;
    }

    // Vérifier que Stripe est initialisé
    if (!this.stripeReady) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Erreur', 
        text: 'Le système de paiement n\'est pas encore prêt. Veuillez patienter.' 
      });
      return false;
    }

    // Vérifier s'il y a une erreur Stripe (validation en temps réel par Stripe Card Element)
    if (this.stripeError) {
      Swal.fire({ 
        icon: 'error', 
        title: 'Erreur de carte', 
        text: this.stripeError 
      });
      return false;
    }

    return true;
  }

  // Algorithme de Luhn pour valider le numéro de carte (gardé pour référence)
  luhnCheck(cardNumber: string): boolean {
    let sum = 0;
    let isEven = false;
    
    for (let i = cardNumber.length - 1; i >= 0; i--) {
      let digit = parseInt(cardNumber[i], 10);
      
      if (isEven) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }
      
      sum += digit;
      isEven = !isEven;
    }
    
    return sum % 10 === 0;
  }

  // Détecte le type de carte
  getCardType(): string {
    const cardNumber = this.cardNumber?.replace(/\s/g, '') || '';
    
    if (/^4/.test(cardNumber)) return 'visa';
    if (/^5[1-5]/.test(cardNumber)) return 'mastercard';
    if (/^3[47]/.test(cardNumber)) return 'amex';
    if (/^6(?:011|5)/.test(cardNumber)) return 'discover';
    
    return 'unknown';
  }

  // 📝 Formate le numéro de carte avec des espaces tous les 4 chiffres
  formatCardNumber(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Garder uniquement les chiffres
    
    // Limiter à 16 chiffres
    if (value.length > 16) {
      value = value.substring(0, 16);
    }
    
    // Ajouter des espaces tous les 4 chiffres
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
    
    this.cardNumber = formatted;
    input.value = formatted;
  }

  // 📝 Formate la date d'expiration (MM/AA)
  formatExpiryDate(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Garder uniquement les chiffres
    
    // Limiter à 4 chiffres
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    
    // Ajouter le slash après le mois
    if (value.length >= 2) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    }
    
    this.cardExpiry = value;
    input.value = value;
  }

  // 📝 Formate le CVV (uniquement des chiffres)
  formatCVV(event: Event): void {
    const input = event.target as HTMLInputElement;
    let value = input.value.replace(/\D/g, ''); // Garder uniquement les chiffres
    
    // Limiter à 4 chiffres (pour Amex qui a 4 chiffres)
    if (value.length > 4) {
      value = value.substring(0, 4);
    }
    
    this.cardCvv = value;
    input.value = value;
  }

  validateSobflousForm(): boolean {
    if (!this.phoneNumber || this.phoneNumber.length < 8) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'Veuillez entrer un numéro de téléphone valide' });
      return false;
    }
    return true;
  }

  processPayment() {
    if (!this.booking) {
      Swal.fire({ icon: 'error', title: 'Erreur', text: 'Aucune réservation à payer' });
      return;
    }

    // Pour le paiement par carte, utiliser Stripe
    if (this.selectedMethod === 'card') {
      this.processStripePayment();
      return;
    }

    // Validate form based on other payment methods
    if (this.selectedMethod === 'sobflous' && !this.validateSobflousForm()) return;

    this.isProcessing = true;

    // Simulate payment processing for other methods
    Swal.fire({
      title: 'Traitement en cours...',
      html: 'Veuillez patienter pendant que nous traitons votre paiement.',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Call the backend to process payment
    this.http
      .put<{ success: boolean; message: string }>(
        `${environment.apiUrl}/api/bookings/${this.booking._id}/pay`,
        {
          clientId: this.clientId,
          paymentMethod: this.selectedMethod,
          paymentDetails: {
            amount: this.getTotal(),
            discount: this.getDiscount(),
            serviceFee: this.getServiceFee(),
            promoCode: this.promoApplied ? this.promoCode : null
          }
        }
      )
      .subscribe({
        next: (response) => {
          this.isProcessing = false;
          if (response.success) {
            this.showPaymentSuccess();
          }
        },
        error: (error) => {
          this.isProcessing = false;
          console.error('Erreur paiement:', error);
          Swal.fire({
            icon: 'error',
            title: 'Échec du paiement',
            text: error.error?.message || 'Une erreur est survenue lors du paiement. Veuillez réessayer.'
          });
        }
      });
  }

  async processStripePayment() {
    if (!this.booking) return;

    // Valider le formulaire (nom + vérifier Stripe prêt)
    if (!this.validateCardForm()) {
      return;
    }

    this.isProcessing = true;

    Swal.fire({
      title: 'Traitement en cours...',
      html: 'Connexion sécurisée à Stripe...',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      // Étape 1: Créer un Payment Intent côté serveur
      console.log('💳 Création du Payment Intent...');
      const intentResponse: any = await this.stripeService
        .createPaymentIntent(this.booking._id, this.getTotal())
        .toPromise();

      if (!intentResponse?.success || !intentResponse.clientSecret) {
        throw new Error('Impossible de créer le paiement');
      }

      this.clientSecret = intentResponse.clientSecret;
      this.paymentIntentId = intentResponse.paymentIntentId;
      console.log('✅ Payment Intent créé:', this.paymentIntentId);

      // Étape 2: Confirmer le paiement avec Stripe Card Element
      Swal.update({
        html: 'Traitement du paiement...'
      });

      const result = await this.stripeService.confirmCardPayment(
        this.clientSecret,
        this.cardName
      );

      if (!result.success) {
        throw new Error(result.error || 'Paiement refusé par Stripe');
      }

      console.log('✅ Paiement confirmé par Stripe');

      // Étape 3: Confirmer côté serveur et mettre à jour la réservation
      Swal.update({
        html: 'Confirmation de la réservation...'
      });

      const confirmResponse = await this.stripeService
        .confirmPaymentOnServer(this.paymentIntentId, this.booking._id)
        .toPromise();

      this.isProcessing = false;

      if (confirmResponse?.success) {
        this.showPaymentSuccess();
      } else {
        throw new Error('Erreur lors de la confirmation serveur');
      }

    } catch (error: any) {
      this.isProcessing = false;
      console.error('Erreur Stripe:', error);
      Swal.fire({
        icon: 'error',
        title: 'Échec du paiement',
        text: error.message || 'Une erreur est survenue lors du paiement.'
      });
    }
  }

  showPaymentSuccess() {
    Swal.fire({
      icon: 'success',
      title: 'Paiement réussi ! 🎉',
      html: `
        <div style="text-align: center;">
          <p style="font-size: 1.1rem; margin-bottom: 10px;">Votre réservation est confirmée.</p>
          <p style="color: #6b7280;">Le prestataire a été notifié et vous contactera bientôt.</p>
        </div>
      `,
      confirmButtonColor: '#10b981',
      confirmButtonText: 'Voir mes réservations'
    }).then(() => {
      this.router.navigate(['/mes-reservations']);
    });
  }

  goBack() {
    if (this.booking) {
      this.router.navigate(['/reservation-details', this.booking._id]);
    } else {
      this.router.navigate(['/mes-reservations']);
    }
  }
}