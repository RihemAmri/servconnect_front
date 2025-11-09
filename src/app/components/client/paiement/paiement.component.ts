import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-paiement',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './paiement.component.html',
  styleUrls: ['./paiement.component.scss']
})
export class PaiementComponent {
  // Payment method selection
  selectedMethod: string = 'card';

  // Card payment form
  cardName: string = '';
  cardNumber: string = '';
  cardExpiry: string = '';
  cardCvv: string = '';
  saveCard: boolean = false;

  // Sobflous payment
  phoneNumber: string = '';

  // D17 payment
  d17Code: string = '';

  // Promo code
  promoCode: string = '';
  promoApplied: boolean = false;

  selectMethod(method: string) {
    this.selectedMethod = method;
  }

  generateD17Code() {
    // Generate random 8-digit code
    this.d17Code = Math.floor(10000000 + Math.random() * 90000000).toString();
  }

  applyPromo() {
    if (this.promoCode.toUpperCase() === 'FIRST10') {
      this.promoApplied = true;
      // Apply discount logic here
    }
  }

  processPayment() {
    console.log('Processing payment with method:', this.selectedMethod);
    // Payment processing logic here
    alert(`Paiement en cours avec ${this.selectedMethod}...`);
  }
}