import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

interface Location {
  address: string;
  lat: number;
  lng: number;
}

interface Client {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  photo?: string;
}

interface Booking {
  _id: string;
  client: Client;
  provider: any;
  date: Date | string;
  time?: string;
  service: string;
  cause: string;
  urgency?: string;
  location?: Location;
  attachments?: string[];
  proposedPrice?: number;
  estimatedDuration?: number;
  providerNotes?: string;
  status: 'pending' | 'accepted' | 'paid' | 'completed' | 'refused' | 'cancelled';
  paymentStatus?: string;
  createdAt: Date;
  acceptedAt?: Date;
  completedAt?: Date;
  refusalReason?: string;
}

@Component({
  selector: 'app-gestionbook',
  imports: [CommonModule, FormsModule],
  templateUrl: './gestionbook.component.html',
  styleUrl: './gestionbook.component.scss'
})
export class GestionbookComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);

  booking: Booking | null = null;
  loading = true;
  bookingId: string = '';

  // Form fields pour Accept
  proposedPrice: number = 0;
  estimatedDuration: number = 0;
  providerNotes: string = '';

  // Form field pour Refuse
  refusalReason: string = '';

  // Image modal
  selectedImage: string | null = null;

  providerId: string = '';

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user._id) {
      this.http.get<any>(`${environment.apiUrl}/api/providers/${user._id}`)
        .subscribe({
          next: (response) => {
            if (response.provider && response.provider._id) {
              this.providerId = response.provider._id;
              console.log('✅ GestionBook - Provider ID:', this.providerId);
            }
          },
          error: (err) => console.error('Error getting provider profile:', err)
        });
    }
    
    this.route.params.subscribe(params => {
      this.bookingId = params['id'];
      if (this.bookingId) {
        this.loadBooking();
      }
    });
  }

  loadBooking() {
    this.loading = true;
    
    this.http.get<any>(`${environment.apiUrl}/api/bookings/${this.bookingId}`)
      .subscribe({
        next: (response) => {
          this.booking = response.data;
          this.loading = false;
          console.log('Réservation chargée:', this.booking);
          console.log('Client photo:', this.booking?.client?.photo);
        },
        error: (error) => {
          console.error('Erreur chargement réservation:', error);
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger cette réservation'
          }).then(() => {
            this.router.navigate(['/my-services']);
          });
        }
      });
  }

  acceptBooking() {
    if (!this.proposedPrice || !this.estimatedDuration) {
      Swal.fire({
        icon: 'warning',
        title: 'Informations manquantes',
        text: 'Veuillez renseigner le prix et la durée estimée'
      });
      return;
    }

    Swal.fire({
      title: 'Confirmer l\'acceptation ?',
      html: `
        <div style="text-align: left; padding: 1rem;">
          <p><strong>Prix proposé:</strong> ${this.proposedPrice} DT</p>
          <p><strong>Durée estimée:</strong> ${this.estimatedDuration} min</p>
          ${this.providerNotes ? `<p><strong>Notes:</strong> ${this.providerNotes}</p>` : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, accepter',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.put<any>(`${environment.apiUrl}/api/bookings/${this.bookingId}/accept`, {
          price: this.proposedPrice,
          estimatedDuration: this.estimatedDuration,
          notes: this.providerNotes,
          providerId: this.providerId
        }).subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Réservation acceptée !',
              text: 'Le client sera notifié de votre proposition',
              timer: 2000
            }).then(() => {
              this.router.navigate(['/my-services']);
            });
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.error?.message || 'Impossible d\'accepter cette réservation'
            });
          }
        });
      }
    });
  }

  refuseBooking() {
    Swal.fire({
      title: 'Refuser cette réservation ?',
      input: 'textarea',
      inputLabel: 'Raison du refus (optionnel)',
      inputPlaceholder: 'Expliquez pourquoi vous refusez...',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, refuser',
      cancelButtonText: 'Annuler'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.put<any>(`${environment.apiUrl}/api/bookings/${this.bookingId}/refuse`, {
          refuseReason: result.value || '',
          providerId: this.providerId
        }).subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Réservation refusée',
              text: 'Le client en sera informé',
              timer: 2000
            }).then(() => {
              this.router.navigate(['/my-services']);
            });
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.error?.message || 'Impossible de refuser cette réservation'
            });
          }
        });
      }
    });
  }

  cancelBooking() {
    Swal.fire({
      title: 'Annuler cette réservation ?',
      text: 'Cette action est irréversible',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        // TODO: Implement cancel endpoint
        Swal.fire('Annulé !', 'La réservation a été annulée', 'success').then(() => {
          this.router.navigate(['/my-services']);
        });
      }
    });
  }

  markAsCompleted() {
    Swal.fire({
      title: 'Marquer comme terminé ?',
      text: 'Confirmez-vous que ce service est terminé ?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, terminé',
      cancelButtonText: 'Non'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http.put<any>(`${environment.apiUrl}/api/bookings/${this.bookingId}/complete`, {
          providerId: this.providerId
        }).subscribe({
          next: (response) => {
            Swal.fire({
              icon: 'success',
              title: 'Service terminé !',
              text: 'Félicitations pour ce service accompli',
              timer: 2000
            }).then(() => {
              this.router.navigate(['/my-services']);
            });
          },
          error: (error) => {
            Swal.fire({
              icon: 'error',
              title: 'Erreur',
              text: error.error?.message || 'Impossible de marquer comme terminé'
            });
          }
        });
      }
    });
  }

  goBack() {
    this.router.navigate(['/my-services']);
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'pending': 'En attente',
      'accepted': 'Accepté',
      'paid': 'Payé',
      'completed': 'Terminé',
      'refused': 'Refusé',
      'cancelled': 'Annulé'
    };
    return labels[status] || status;
  }

  viewOnMap() {
    if (this.booking?.location) {
      const url = `https://www.openstreetmap.org/?mlat=${this.booking.location.lat}&mlon=${this.booking.location.lng}#map=15/${this.booking.location.lat}/${this.booking.location.lng}`;
      window.open(url, '_blank');
    }
  }

  contactClient() {
    if (this.booking?.client) {
      Swal.fire({
        title: 'Contacter le client',
        html: `
          <div style="text-align: left; padding: 1rem;">
            <p><strong>Email:</strong> <a href="mailto:${this.booking.client.email}">${this.booking.client.email}</a></p>
            ${this.booking.client.telephone ? `<p><strong>Téléphone:</strong> <a href="tel:${this.booking.client.telephone}">${this.booking.client.telephone}</a></p>` : ''}
          </div>
        `,
        confirmButtonText: 'Fermer'
      });
    }
  }

  openImageModal(imageUrl: string) {
    this.selectedImage = imageUrl;
  }

  closeImageModal() {
    this.selectedImage = null;
  }
}
