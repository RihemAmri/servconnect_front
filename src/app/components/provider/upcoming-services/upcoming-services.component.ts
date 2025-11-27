import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upcoming-services',
  imports: [CommonModule],
  templateUrl: './upcoming-services.component.html',
  styleUrls: ['./upcoming-services.component.scss']
})
export class UpcomingServicesComponent {
 upcomingServices = [
  {
    customerName: 'Client B',
    address: 'Ariana',
    pieces: 5,
    date: new Date('2025-11-07'),
    droneCount: 2,
    serviceTime: '14:00',
    price: 120
  },
  {
    customerName: 'Client C',
    address: 'La Marsa',
    pieces: 3,
    date: new Date('2025-11-10'),
    droneCount: 1,
    serviceTime: '09:30',
    price: 80
  },
  {
    customerName: 'Client D',
    address: 'Bardo',
    pieces: 2,
    date: new Date('2025-11-11'),
    droneCount: 1,
    serviceTime: '16:45',
    price: 60
  },
  {
    customerName: 'Client E',
    address: 'Sousse',
    pieces: 8,
    date: new Date('2025-11-13'),
    droneCount: 3,
    serviceTime: '08:30',
    price: 200
  }
];


  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/my-services']);
  }

  calculateTotal(): number {
    return this.upcomingServices.reduce((sum, service) => sum + service.price, 0);
  }

  getTotalDrones(): number {
    return this.upcomingServices.reduce((sum, service) => sum + service.droneCount, 0);
  }

  getTotalPieces(): number {
    return this.upcomingServices.reduce((sum, service) => sum + service.pieces, 0);
  }

  openMap(service: any) {
    const address = encodeURIComponent(service.address);
    const mapUrl = `https://www.google.com/maps?q=${address}&output=embed`;
    
    Swal.fire({
      title: `📍 ${service.address}`,
      html: `
        <div style="width: 100%; height: 400px; border-radius: 12px; overflow: hidden;">
          <iframe
            width="100%"
            height="100%"
            style="border:0;"
            src="${mapUrl}"
            allowfullscreen
            loading="lazy"
          ></iframe>
        </div>
      `,
      width: '800px',
      showCloseButton: true,
      showConfirmButton: false,
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        title: 'text-xl font-bold text-gray-800',
        closeButton: 'text-gray-500 hover:text-gray-700'
      }
    });
  }

  validate(service: any) {
    Swal.fire({
      title: '✅ Confirmer le service',
      html: `
        <div style="text-align: left; padding: 1rem;">
          <div style="background: #f0f9ff; padding: 1rem; border-radius: 12px; margin-bottom: 1rem;">
            <p style="margin: 0; color: #0369a1; font-weight: 600;">
              <i class="fas fa-user"></i> ${service.customerName}
            </p>
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; font-size: 0.9rem;">
            <div>
              <strong style="color: #64748b;">📍 Adresse:</strong><br>
              <span>${service.address}</span>
            </div>
            <div>
              <strong style="color: #64748b;">📅 Date:</strong><br>
              <span>${new Date(service.date).toLocaleDateString('fr-FR')}</span>
            </div>
            <div>
              <strong style="color: #64748b;">⏰ Heure:</strong><br>
              <span>${service.serviceTime}</span>
            </div>
            <div>
              <strong style="color: #64748b;">💰 Prix:</strong><br>
              <span>${service.price} dt</span>
            </div>
          </div>
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Valider',
      cancelButtonText: 'Annuler',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#94a3b8',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        confirmButton: 'rounded-xl px-6 py-3 font-semibold',
        cancelButton: 'rounded-xl px-6 py-3 font-semibold'
      }
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          title: 'Validé!',
          text: 'Le service a été confirmé avec succès',
          icon: 'success',
          timer: 2000,
          showConfirmButton: false,
          customClass: {
            popup: 'rounded-2xl shadow-2xl'
          }
        });
        console.log('Service validé:', service);
      }
    });
  }
}
