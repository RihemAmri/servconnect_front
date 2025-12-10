import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

interface ClientBooking {
  _id: string;
  provider: {
    _id: string;
    metier: string;
    user: {
      _id: string;
      nom: string;
      prenom: string;
      email: string;
      telephone?: string;
      photo?: string;
    };
  };
  date: string;
  time?: string;
  service: string;
  cause: string;
  location: {
    address: string;
    lat: number;
    lng: number;
  };
  attachments: string[];
  proposedPrice?: number;
  estimatedDuration?: number;
  providerNotes?: string;
  status: 'pending' | 'accepted' | 'refused' | 'paid' | 'completed' | 'cancelled';
  refusalReason?: string;
  createdAt: string;
  acceptedAt?: string;
  completedAt?: string;
}

interface Stats {
  total: number;
  pending: number;
  accepted: number;
  paid: number;
  completed: number;
  refused: number;
}

@Component({
  selector: 'app-mes-reservations',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './mes-reservations.component.html',
  styleUrls: ['./mes-reservations.component.scss']
})
export class MesReservationsComponent implements OnInit {
  bookings: ClientBooking[] = [];
  filteredBookings: ClientBooking[] = [];
  stats: Stats = {
    total: 0,
    pending: 0,
    accepted: 0,
    paid: 0,
    completed: 0,
    refused: 0
  };
  
  isLoading = true;
  selectedFilter: string = 'all';
  clientId: string = '';

  constructor(
    private http: HttpClient,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user._id) {
      this.clientId = user._id;
      this.loadBookings();
    } else {
      this.router.navigate(['/login']);
    }
  }

  loadBookings() {
    this.isLoading = true;
    this.http
      .get<{ success: boolean; data: ClientBooking[]; stats: Stats }>(
        `${environment.apiUrl}/api/bookings/client/${this.clientId}`
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.bookings = response.data;
            this.stats = response.stats;
            this.applyFilter();
          }
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur chargement réservations:', error);
          this.isLoading = false;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger vos réservations'
          });
        }
      });
  }

  applyFilter() {
    if (this.selectedFilter === 'all') {
      this.filteredBookings = [...this.bookings];
    } else {
      this.filteredBookings = this.bookings.filter(b => b.status === this.selectedFilter);
    }
  }

  filterBy(status: string) {
    this.selectedFilter = status;
    this.applyFilter();
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente',
      accepted: 'Acceptée',
      refused: 'Refusée',
      paid: 'Payée',
      completed: 'Terminée',
      cancelled: 'Annulée'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return `status-${status}`;
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

  formatTime(time?: string): string {
    return time || 'Non spécifié';
  }

  getProviderPhoto(booking: ClientBooking): string {
    if (booking.provider?.user?.photo) {
      return booking.provider.user.photo;
    }
    return 'https://via.placeholder.com/80?text=' + 
      (booking.provider?.user?.prenom?.charAt(0) || 'P') +
      (booking.provider?.user?.nom?.charAt(0) || 'S');
  }

  viewReservationDetails(booking: ClientBooking) {
    this.router.navigate(['/reservation-details', booking._id]);
  }

  proceedToPayment(booking: ClientBooking) {
    this.router.navigate(['/paiement', booking._id]);
  }

  cancelBooking(booking: ClientBooking) {
    Swal.fire({
      title: 'Annuler la réservation ?',
      text: 'Cette action est irréversible.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non, garder'
    }).then((result) => {
      if (result.isConfirmed) {
        this.http
          .put<{ success: boolean }>(`${environment.apiUrl}/api/bookings/${booking._id}/cancel`, {
            clientId: this.clientId
          })
          .subscribe({
            next: (response) => {
              if (response.success) {
                Swal.fire({
                  icon: 'success',
                  title: 'Réservation annulée',
                  text: 'Votre réservation a été annulée avec succès.',
                  timer: 2000,
                  showConfirmButton: false
                });
                this.loadBookings();
              }
            },
            error: (error) => {
              console.error('Erreur annulation:', error);
              Swal.fire({
                icon: 'error',
                title: 'Erreur',
                text: error.error?.message || 'Impossible d\'annuler la réservation'
              });
            }
          });
      }
    });
  }

  leaveReview(booking: ClientBooking) {
    Swal.fire({
      title: 'Laisser un avis',
      html: `
        <div style="text-align: left; margin-bottom: 15px;">
          <label style="font-weight: 600; margin-bottom: 8px; display: block;">Note :</label>
          <div id="star-rating" style="font-size: 2rem; cursor: pointer;">
            <span data-value="1">☆</span>
            <span data-value="2">☆</span>
            <span data-value="3">☆</span>
            <span data-value="4">☆</span>
            <span data-value="5">☆</span>
          </div>
        </div>
        <div style="text-align: left;">
          <label style="font-weight: 600; margin-bottom: 8px; display: block;">Commentaire :</label>
          <textarea id="review-comment" class="swal2-textarea" placeholder="Décrivez votre expérience..." style="min-height: 100px;"></textarea>
        </div>
      `,
      showCancelButton: true,
      confirmButtonColor: '#025ddd',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Envoyer',
      cancelButtonText: 'Annuler',
      didOpen: () => {
        const stars = document.querySelectorAll('#star-rating span');
        let selectedRating = 0;
        
        stars.forEach((star, index) => {
          star.addEventListener('click', () => {
            selectedRating = index + 1;
            stars.forEach((s, i) => {
              (s as HTMLElement).textContent = i < selectedRating ? '★' : '☆';
              (s as HTMLElement).style.color = i < selectedRating ? '#F59E0B' : '#9CA3AF';
            });
          });
          
          star.addEventListener('mouseenter', () => {
            stars.forEach((s, i) => {
              (s as HTMLElement).style.color = i <= index ? '#F59E0B' : '#9CA3AF';
            });
          });
          
          star.addEventListener('mouseleave', () => {
            stars.forEach((s, i) => {
              (s as HTMLElement).style.color = i < selectedRating ? '#F59E0B' : '#9CA3AF';
            });
          });
        });
        
        (window as any).getSelectedRating = () => selectedRating;
      },
      preConfirm: () => {
        const rating = (window as any).getSelectedRating();
        const comment = (document.getElementById('review-comment') as HTMLTextAreaElement).value;
        
        if (!rating || rating < 1) {
          Swal.showValidationMessage('Veuillez sélectionner une note');
          return false;
        }
        
        return { rating, comment };
      }
    }).then((result) => {
      if (result.isConfirmed && result.value) {
        this.submitReview(booking._id, result.value.rating, result.value.comment);
      }
    });
  }

  submitReview(bookingId: string, rating: number, comment: string) {
    this.http
      .post<{ success: boolean }>(`${environment.apiUrl}/api/bookings/${bookingId}/review`, {
        rating,
        comment,
        clientId: this.clientId
      })
      .subscribe({
        next: (response) => {
          if (response.success) {
            Swal.fire({
              icon: 'success',
              title: 'Merci !',
              text: 'Votre avis a été enregistré avec succès.',
              timer: 2000,
              showConfirmButton: false
            });
            this.loadBookings();
          }
        },
        error: (error) => {
          console.error('Erreur avis:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.error?.message || 'Impossible d\'envoyer votre avis'
          });
        }
      });
  }
}
