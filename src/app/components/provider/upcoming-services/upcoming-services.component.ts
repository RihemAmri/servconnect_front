import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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
  provider: string;
  date: Date;
  time?: string;
  service: string;
  cause: string;
  location?: Location;
  attachments?: string[];
  proposedPrice?: number;
  estimatedDuration?: number;
  providerNotes?: string;
  status: 'pending' | 'accepted' | 'paid' | 'completed' | 'refused';
  paymentStatus?: string;
  createdAt: Date;
  acceptedAt?: Date;
}

@Component({
  selector: 'app-upcoming-services',
  imports: [CommonModule],
  templateUrl: './upcoming-services.component.html',
  styleUrls: ['./upcoming-services.component.scss']
})
export class UpcomingServicesComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  upcomingServices: Booking[] = [];
  loading = true;
  providerId: string = '';

  ngOnInit() {
    const user = this.authService.getCurrentUser();
    if (user && user._id) {
      this.http.get<any>(`${environment.apiUrl}/api/providers/${user._id}`)
        .subscribe({
          next: (response) => {
            if (response.provider && response.provider._id) {
              this.providerId = response.provider._id;
              console.log('✅ UpcomingServices - Provider ID:', this.providerId);
              this.loadUpcomingServices();
            }
          },
          error: (err) => {
            console.error('Error getting provider profile:', err);
            this.loading = false;
          }
        });
    }
  }

  loadUpcomingServices() {
    this.loading = true;
    
    this.http.get<any>(`${environment.apiUrl}/api/bookings/provider/${this.providerId}/upcoming`)
      .subscribe({
        next: (response) => {
          this.upcomingServices = response.data || [];
          this.loading = false;
          console.log('Services chargés:', this.upcomingServices);
        },
        error: (error) => {
          console.error('Erreur chargement services:', error);
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger les services à venir',
            confirmButtonColor: '#667eea'
          });
        }
      });
  }

  // Helper Methods
  getClientName(client: Client | string): string {
    if (typeof client === 'string') return 'Client';
    return `${client.prenom || ''} ${client.nom || ''}`.trim() || 'Client';
  }

  getClientPhoto(client: Client | string): string {
    if (typeof client === 'string') return 'assets/default-avatar.png';
    return client.photo || 'assets/default-avatar.png';
  }

  formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getStatusLabel(status: string): string {
    const labels: any = {
      'accepted': 'En attente de paiement',
      'paid': 'Payé - Confirmé',
      'pending': 'En attente',
      'completed': 'Terminé',
      'refused': 'Refusé'
    };
    return labels[status] || status;
  }

  getStatusClass(status: string): string {
    return status;
  }

  isUrgent(date: Date | string): boolean {
    const serviceDate = new Date(date);
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(23, 59, 59, 999);
    
    return serviceDate <= tomorrow;
  }

  calculateTotalRevenue(): number {
    return this.upcomingServices.reduce((sum, service) => 
      sum + (service.proposedPrice || 0), 0
    );
  }

  calculateTotalDuration(): number {
    const totalMinutes = this.upcomingServices.reduce((sum, service) => 
      sum + (service.estimatedDuration || 0), 0
    );
    return Math.round(totalMinutes / 60 * 10) / 10; // Conversion en heures
  }

  // Actions
  viewOnMap(service: Booking) {
    if (!service.location) {
      Swal.fire({
        icon: 'warning',
        title: 'Localisation indisponible',
        text: 'Aucune localisation n\'a été fournie pour ce service',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    const { lat, lng, address } = service.location;
    const mapUrl = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}&zoom=15`;
    
    Swal.fire({
      title: `📍 ${address}`,
      html: `
        <div style="width: 100%; height: 400px; border-radius: 12px; overflow: hidden; margin-top: 1rem;">
          <iframe
            width="100%"
            height="100%"
            style="border:0;"
            src="https://www.openstreetmap.org/export/embed.html?bbox=${lng-0.01},${lat-0.01},${lng+0.01},${lat+0.01}&layer=mapnik&marker=${lat},${lng}"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
        <div style="margin-top: 1rem;">
          <a href="${mapUrl}" target="_blank" style="color: #667eea; font-weight: 600;">
            🗺️ Ouvrir dans OpenStreetMap
          </a>
        </div>
      `,
      width: '800px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-2xl shadow-2xl'
      }
    });
  }

  contactClient(client: Client | string) {
    if (typeof client === 'string') {
      Swal.fire({
        icon: 'warning',
        title: 'Information indisponible',
        text: 'Impossible de contacter le client',
        confirmButtonColor: '#667eea'
      });
      return;
    }

    Swal.fire({
      title: `Contacter ${this.getClientName(client)}`,
      html: `
        <div style="text-align: left; padding: 1rem;">
          <div style="display: flex; flex-direction: column; gap: 1rem;">
            ${client.telephone ? `
              <a href="tel:${client.telephone}" 
                 style="display: flex; align-items: center; gap: 12px; padding: 14px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; border-radius: 12px; text-decoration: none; font-weight: 600;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
                📞 Appeler: ${client.telephone}
              </a>
            ` : ''}
            
            ${client.email ? `
              <a href="mailto:${client.email}" 
                 style="display: flex; align-items: center; gap: 12px; padding: 14px; background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%); color: white; border-radius: 12px; text-decoration: none; font-weight: 600;">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
                📧 Email: ${client.email}
              </a>
            ` : ''}
          </div>
        </div>
      `,
      width: '500px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-2xl shadow-2xl'
      }
    });
  }

  markAsCompleted(service: Booking) {
    Swal.fire({
      title: '✅ Marquer comme terminé',
      html: `
        <div style="text-align: left; padding: 1rem;">
          <p style="margin-bottom: 1rem; color: #64748b;">
            Confirmez-vous que le service pour <strong>${this.getClientName(service.client)}</strong> a été effectué ?
          </p>
          <div style="background: #f8fafc; padding: 14px; border-radius: 12px; border-left: 4px solid #10b981;">
            <p style="margin: 0; font-size: 0.9rem; color: #475569;">
              <strong>Service:</strong> ${service.service}<br>
              <strong>Prix:</strong> ${service.proposedPrice || 0} DT<br>
              <strong>Date:</strong> ${this.formatDate(service.date)}
            </p>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✅ Confirmer',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#94a3b8',
      customClass: {
        popup: 'rounded-2xl shadow-2xl'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        this.completeService(service._id);
      }
    });
  }

  completeService(bookingId: string) {
    this.http.put(`${environment.apiUrl}/api/bookings/${bookingId}/complete`, {
      providerId: this.providerId,
      completionNotes: 'Service effectué avec succès'
    }).subscribe({
      next: (response) => {
        Swal.fire({
          icon: 'success',
          title: 'Service terminé!',
          text: 'Le service a été marqué comme terminé avec succès',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-2xl shadow-2xl'
          }
        });
        this.loadUpcomingServices(); // Recharger la liste
      },
      error: (error) => {
        console.error('Erreur:', error);
        Swal.fire({
          icon: 'error',
          title: 'Erreur',
          text: 'Impossible de marquer le service comme terminé',
          confirmButtonColor: '#ef4444'
        });
      }
    });
  }

  openPhotoModal(photoUrl: string) {
    Swal.fire({
      imageUrl: photoUrl,
      imageAlt: 'Photo du problème',
      showCloseButton: true,
      showConfirmButton: false,
      width: 'auto',
      customClass: {
        popup: 'rounded-2xl shadow-2xl'
      }
    });
  }

  goBack() {
    this.router.navigate(['/provider/my-services']);
  }
}
