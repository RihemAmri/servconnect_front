import { Component, OnInit, AfterViewInit, PLATFORM_ID, Inject } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import Swal from 'sweetalert2';
import { environment } from '../../../../environments/environment';
import { AuthService } from '../../../services/auth.service';

interface ReservationDetails {
  _id: string;
  provider: {
    _id: string;
    metier: string;
    noteGenerale: number;
    nombreAvis: number;
    user: {
      _id: string;
      nom: string;
      prenom: string;
      email: string;
      telephone?: string;
      photo?: string;
    };
  };
  client: {
    _id: string;
    nom: string;
    prenom: string;
    email: string;
    telephone?: string;
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
  paymentStatus?: string;
}

@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reservation-details.component.html',
  styleUrls: ['./reservation-details.component.scss']
})
export class ReservationDetailsComponent implements OnInit, AfterViewInit {
  reservation: ReservationDetails | null = null;
  isLoading = true;
  clientId: string = '';
  private map: any = null;
  private L: any = null;
  private isBrowser: boolean;

  constructor(
    private http: HttpClient,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user._id) {
      this.clientId = user._id;
      const reservationId = this.route.snapshot.paramMap.get('id');
      if (reservationId) {
        this.loadReservation(reservationId);
      } else {
        this.router.navigate(['/mes-reservations']);
      }
    } else {
      this.router.navigate(['/login']);
    }
  }

  ngAfterViewInit() {
    // Map will be initialized after reservation is loaded
  }

  loadReservation(id: string) {
    this.isLoading = true;
    this.http
      .get<{ success: boolean; data: ReservationDetails }>(
        `${environment.apiUrl}/api/bookings/${id}`
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.reservation = response.data;
            setTimeout(() => this.initializeMap(), 100);
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

  async initializeMap() {
    if (!this.isBrowser) return;
    if (!this.reservation?.location?.lat || !this.reservation?.location?.lng) return;
    
    const mapContainer = document.getElementById('detail-map');
    if (!mapContainer) return;

    // Dynamically import Leaflet only in browser
    if (!this.L) {
      this.L = await import('leaflet');
    }

    if (this.map) {
      this.map.remove();
    }

    this.map = this.L.map('detail-map').setView(
      [this.reservation.location.lat, this.reservation.location.lng],
      15
    );

    this.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap'
    }).addTo(this.map);

    const customIcon = this.L.divIcon({
      html: `<div style="background: linear-gradient(135deg, #025ddd, #0047b3); width: 40px; height: 40px; border-radius: 50% 50% 50% 0; transform: rotate(-45deg); display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 15px rgba(2,93,221,0.4);">
        <svg style="transform: rotate(45deg); width: 20px; height: 20px; color: white;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>`,
      className: 'custom-marker',
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });

    this.L.marker([this.reservation.location.lat, this.reservation.location.lng], { icon: customIcon })
      .addTo(this.map)
      .bindPopup(`<strong>${this.reservation.location.address}</strong>`);
  }

  getStatusLabel(status: string): string {
    const labels: { [key: string]: string } = {
      pending: 'En attente de confirmation',
      accepted: 'Acceptée - En attente de paiement',
      refused: 'Refusée',
      paid: 'Payée - En attente du service',
      completed: 'Service terminé',
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

  formatDateTime(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getProviderPhoto(): string {
    if (this.reservation?.provider?.user?.photo) {
      return this.reservation.provider.user.photo;
    }
    return 'https://via.placeholder.com/100?text=' + 
      (this.reservation?.provider?.user?.prenom?.charAt(0) || 'P') +
      (this.reservation?.provider?.user?.nom?.charAt(0) || 'S');
  }

  proceedToPayment() {
    if (this.reservation) {
      this.router.navigate(['/paiement', this.reservation._id]);
    }
  }

  cancelReservation() {
    if (!this.reservation) return;

    Swal.fire({
      title: 'Annuler la réservation ?',
      text: 'Cette action est irréversible. Le prestataire sera notifié.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, annuler',
      cancelButtonText: 'Non, garder'
    }).then((result) => {
      if (result.isConfirmed && this.reservation) {
        this.http
          .put<{ success: boolean }>(`${environment.apiUrl}/api/bookings/${this.reservation._id}/cancel`, {
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
                }).then(() => {
                  this.router.navigate(['/mes-reservations']);
                });
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

  contactProvider() {
    if (this.reservation?.provider?.user?.telephone) {
      window.open(`tel:${this.reservation.provider.user.telephone}`, '_blank');
    } else if (this.reservation?.provider?.user?.email) {
      window.open(`mailto:${this.reservation.provider.user.email}`, '_blank');
    }
  }

  goBack() {
    this.router.navigate(['/mes-reservations']);
  }
}
