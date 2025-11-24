import { Component, OnInit, OnDestroy, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription, fromEvent } from 'rxjs';

import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule],
  providers: [MessageService],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private messageService = inject(MessageService);

  // États de l'interface
  isScrolled = false;
  isMobileMenuOpen = false;
  isDropdownOpen = false;
  isUserMenuOpen = false;

  // Authentification
  isLoggedIn = false;
  userRole: string | null = null;
  userName: string | null = null;
  notificationsCount = 0;

  private subs: Subscription[] = [];
  private platformId = inject(PLATFORM_ID);

  private auth = inject(AuthService);
  private router = inject(Router);

  isClientInitialized = false;

  ngOnInit(): void {
    // Auto login
    this.auth.autoLogin();

    // Auth status (IMPORTANT)
    this.subs.push(
      this.auth.getAuthStatus().subscribe(status => {
        this.isLoggedIn = status;
        console.log("Login Status:", status);
      })
    );

    // Current user
    this.subs.push(
      this.auth.currentUser$.subscribe(user => {
        console.log("User:", user);

        if (!user) {
          this.userRole = null;
          this.userName = null;
          this.notificationsCount = 0;
          return;
        }

        this.userRole = user.role;
        this.userName = `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur';

        // Simuler des notifications (à remplacer par votre logique)
        this.notificationsCount = this.getNotificationsCount(user.role);

        console.log("Nom calculé:", this.userName);
        console.log("Rôle:", this.userRole);
      })
    );

    // Vérifier si on est dans le navigateur avant d'accéder à window/document
    if (isPlatformBrowser(this.platformId)) {
      this.isClientInitialized = true;
      // Scroll listener
      this.subs.push(
        fromEvent(window, 'scroll').subscribe(() => {
          this.isScrolled = window.scrollY > 10;
        })
      );

      // Click listener pour fermer les dropdowns
      this.subs.push(
        fromEvent(document, 'click').subscribe((event: Event) => {
          const target = event.target as HTMLElement;
          
          // Fermer le dropdown "Plus" si on clique à l'extérieur
          if (!target.closest('.nav-dropdown')) {
            this.isDropdownOpen = false;
          }

          // Fermer le menu utilisateur si on clique à l'extérieur
          if (!target.closest('.user-menu')) {
            this.isUserMenuOpen = false;
          }
        })
      );
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
    
    // Réactiver le scroll du body seulement si on est dans le navigateur
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Toggle du menu mobile
   */
  toggleMobileMenu(): void {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    
    // Fermer les autres menus
    if (this.isMobileMenuOpen) {
      this.isDropdownOpen = false;
      this.isUserMenuOpen = false;
    }
    
    // Gérer le scroll du body
    this.toggleBodyScroll();
  }

  /**
   * Fermer le menu mobile
   */
  closeMobileMenu(): void {
    this.isMobileMenuOpen = false;
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Toggle du dropdown "Plus" (pour prestataire)
   */
  toggleDropdown(): void {
    this.isDropdownOpen = !this.isDropdownOpen;
    
    // Fermer les autres menus
    if (this.isDropdownOpen) {
      this.isUserMenuOpen = false;
      this.isMobileMenuOpen = false;
    }
  }

  /**
   * Fermer le dropdown "Plus"
   */
  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  /**
   * Toggle du menu utilisateur
   */
  toggleUserMenu(): void {
    this.isUserMenuOpen = !this.isUserMenuOpen;
    
    // Fermer les autres menus
    if (this.isUserMenuOpen) {
      this.isDropdownOpen = false;
      this.isMobileMenuOpen = false;
    }
  }

  /**
   * Fermer le menu utilisateur
   */
  closeUserMenu(): void {
    this.isUserMenuOpen = false;
  }

  /**
   * Fermer tous les menus (appelé par l'overlay)
   */
  closeAllMenus(): void {
    this.isMobileMenuOpen = false;
    this.isDropdownOpen = false;
    this.isUserMenuOpen = false;
    
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = '';
    }
  }

  /**
   * Gérer le scroll du body (empêcher le scroll quand menu mobile ouvert)
   */
  private toggleBodyScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.isMobileMenuOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    }
  }

  /**
   * Obtenir le nombre de notifications selon le rôle
   * À remplacer par votre logique de notifications
   */
  private getNotificationsCount(role: string | null): number {
    // Exemple de logique
    if (role === 'prestataire') {
      // Récupérer les nouvelles réservations, messages, etc.
      return 5; // Exemple
    } else if (role === 'client') {
      // Récupérer les confirmations, rappels, etc.
      return 2; // Exemple
    } else if (role === 'admin') {
      // Récupérer les alertes admin
      return 10; // Exemple
    }
    return 0;
  }

  /**
   * Déconnexion
   */
  logout(): void {
    // Fermer tous les menus
    this.closeAllMenus();
    
    // Déconnexion via le service
    this.auth.logout();
    
    // Redirection optionnelle
    this.router.navigate(['/']);
    
    console.log("Utilisateur déconnecté");
    this.messageService.add({
      severity: 'success', // Type de notification (success, info, warn, error)
      summary: 'Déconnexion', // Titre du toast
      detail: 'Utilisateur déconnecté', // Le message souhaité
      life: 1000 // Durée d'affichage en ms (3 secondes)
    });
  }

  /**
   * Navigation vers une page et fermeture des menus
   */
  navigateAndClose(route: string): void {
    this.closeAllMenus();
    this.router.navigate([route]);
  }

  /**
   * Vérifier si une route est active
   */
  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }

  /**
   * Obtenir l'initiale du nom pour l'avatar
   */
  getUserInitial(): string {
    if (!this.userName) return 'U';
    const names = this.userName.trim().split(' ');
    if (names.length > 1) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return this.userName[0].toUpperCase();
  }

  /**
   * Obtenir la couleur de l'avatar selon le rôle
   */
  getAvatarColor(): string {
    switch (this.userRole) {
      case 'admin':
        return '#dc2626'; // Rouge
      case 'prestataire':
        return '#025ddd'; // Bleu (primary)
      case 'client':
        return '#10b981'; // Vert
      default:
        return '#6b7280'; // Gris
    }
  }
}