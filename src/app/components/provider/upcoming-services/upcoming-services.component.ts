import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-upcoming-services',
  imports: [CommonModule],
  templateUrl: './upcoming-services.component.html',
  styleUrl: './upcoming-services.component.scss'
})
export class UpcomingServicesComponent {
    selectedService: any = null;
   upcomingServices = [
    {
      title: 'Installation - Client B',
      date: '2025-11-07',
      time: '14:00',
      client: 'Client B',
      location: 'Ariana',
      image: 'homelogo.png'
    },
    {
      title: 'Consultation - Client C',
      date: '2025-11-10',
      time: '09:30',
      client: 'Client C',
      location: 'La Marsa',
      image: 'homelogo.png'
    }
  ];

  constructor(private router: Router, private sanitizer: DomSanitizer) {}

  goBack() {
    this.router.navigate(['/my-services']);
  }
    openMap(service: any) {
    this.selectedService = service;
  }

  closeMap() {
    this.selectedService = null;
  }

  getMapUrl(service: any): SafeResourceUrl {
    const query = encodeURIComponent(service.location);
    const url = `https://www.google.com/maps?q=${query}&output=embed`;
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }
}
