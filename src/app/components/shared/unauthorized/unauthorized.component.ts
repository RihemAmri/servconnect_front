import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-unauthorized',
  standalone: true, // Ajoutez standalone: true si vous utilisez Angular 15+ pour les composants
  imports: [CommonModule],
  templateUrl: './unauthorized.component.html',
  styleUrl: './unauthorized.component.scss'
})
export class UnauthorizedComponent {
  role: string | null;
  isLogged: boolean;

  constructor(private router: Router, private auth: AuthService) {
    this.role = this.auth.getUserRole();
    this.isLogged = this.auth.isLoggedIn();
  }

  // Maintient une seule méthode pour le retour à l'accueil
  goHome() {
    this.router.navigate(['/']);
  }

  // Redirige vers la page de connexion
  goLogin() {
    this.router.navigate(['/login']);
  }

  // Déconnecte l'utilisateur et le renvoie à l'accueil
  logout() {
    this.auth.logout();
    this.router.navigate(['/']); 
  }

  // Suppression de la méthode goToHome() dupliquée
}