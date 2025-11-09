import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss']
})
export class FooterComponent {
  showBackToTop = false;

  @HostListener('window:scroll')
  onWindowScroll() {
    this.showBackToTop = window.pageYOffset > 500;
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  onSubscribe(event: Event): void {
    event.preventDefault();
    const email = (event.target as HTMLFormElement).querySelector('input')?.value;
    if (email) {
      alert(`Inscription confirmée pour : ${email}`);
    }
  }
}