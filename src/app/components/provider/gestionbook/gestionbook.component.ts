import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-gestionbook',
  imports: [CommonModule],
  templateUrl: './gestionbook.component.html',
  styleUrl: './gestionbook.component.scss'
})
export class GestionbookComponent {
      requests = [
    {
      client: 'Client A',
      service: 'Nettoyage à domicile',
      date: '2025-11-10',
      time: '10:00',
      location: 'Ariana, Tunisie',
      comment: 'Besoin urgent pour nettoyage complet.',
      status: 'pending'
    },
    {
      client: 'Client B',
      service: 'Réparation plomberie',
      date: '2025-11-11',
      time: '15:00',
      location: 'La Marsa, Tunisie',
      comment: 'Petite fuite dans la cuisine.',
      status: 'pending'
    }
  ];
  selectedLocation: string | null = null;
  mapUrl: SafeResourceUrl | null = null;

  constructor(private router: Router, private sanitizer: DomSanitizer) {}
  showMap(location: string) {
    const url = `https://www.google.com/maps?q=${encodeURIComponent(location)}&output=embed`;
    this.mapUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
    this.selectedLocation = location;
  }

  closeMap() {
    this.selectedLocation = null;
    this.mapUrl = null;
  }
  acceptRequest(req: any) {
    req.status = 'accepted';

    // ✅ Simulation : ajout dans le calendrier
    const storedServices = JSON.parse(localStorage.getItem('acceptedServices') || '[]');
    storedServices.push(req);
    localStorage.setItem('acceptedServices', JSON.stringify(storedServices));

    // ✅ Suppression de la demande de la liste
    this.requests = this.requests.filter(r => r !== req);

    alert(`Service accepté : ${req.service} (${req.client})`);
  }

  refuseRequest(req: any) {
    req.status = 'refused';
    this.requests = this.requests.filter(r => r !== req);
    alert(`Service refusé : ${req.service} (${req.client})`);
  }
}
