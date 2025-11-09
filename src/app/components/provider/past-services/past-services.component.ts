import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-past-services',
  imports: [CommonModule],
  templateUrl: './past-services.component.html',
  styleUrl: './past-services.component.scss'
})
export class PastServicesComponent {
    pastServices = [
    {
      title: 'Réparation - Client A',
      date: '2025-11-05',
      client: 'Client A',
      duration: '1h30',
      location: 'Tunis Centre',
      image: '/homelogo.png'
    },
    {
      title: 'Maintenance - Client D',
      date: '2025-10-30',
      client: 'Client D',
      duration: '2h00',
      location: 'La Marsa',
      image: '/homelogo.png'
    }
  ];

  constructor(private router: Router) {}

  goBack() {
    this.router.navigate(['/my-services']);
  }
}
