import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-upcoming-services',
  imports: [CommonModule],
  templateUrl: './upcoming-services.component.html',
  styleUrls: ['./upcoming-services.component.scss']  // correction ici
})
export class UpcomingServicesComponent {
  selectedService: any = null;
  showPopup: boolean = false; // pour afficher la popup

  // Structure adaptée aux colonnes de ton tableau
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


  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  goBack() {
    this.router.navigate(['/my-services']);
  }

  openMap(service: any) {
    this.selectedService = service;
    this.showPopup = true;
  }

  closePopup() {
    this.selectedService = null;
    this.showPopup = false;
  }

  get googleMapUrl(): SafeResourceUrl {
    if (!this.selectedService) return '';
    const query = encodeURIComponent(this.selectedService.address);
    const url = `https://www.google.com/maps?q=${query}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  validate(service: any) {
    // Ici tu peux mettre ton code de validation
    console.log('Service validé:', service);
  }
}
