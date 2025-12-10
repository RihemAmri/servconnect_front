import { Component, inject, PLATFORM_ID, computed, signal, effect } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { fromEvent, filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule, ToastModule],
  providers: [MessageService],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent {
  private messageService = inject(MessageService);
  private auth = inject(AuthService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  // Signals pour l’état UI
  isScrolled = signal(false);
  isMobileMenuOpen = signal(false);
  isDropdownOpen = signal(false);
  isUserMenuOpen = signal(false);
  isClientInitialized = signal(false);

  // Signaux dérivés de l’authentification (réactifs)
  isLoggedIn = this.auth.isAuthenticated;           // signal<boolean>
  currentUser = this.auth.currentUser;              // signal<any>
  userRole = this.auth.userRole;                    // computed signal<string | null>
  userName = computed(() => {
    const user = this.currentUser();
    if (!user) return null;
    return `${user.prenom || ''} ${user.nom || ''}`.trim() || 'Utilisateur';
  });

  // Nombre de notifications (exemple statique, tu peux le rendre dynamique)
  notificationsCount = computed(() => {
    const role = this.userRole();
    if (role === 'prestataire') return 5;
    if (role === 'client') return 2;
    if (role === 'admin') return 10;
    return 0;
  });

  constructor() {
    // Auto-login au démarrage (déjà géré dans AuthService, mais on s’assure)
    this.auth.autoLogin();

    // Initialisation côté navigateur uniquement
    if (isPlatformBrowser(this.platformId)) {
      this.isClientInitialized.set(true);

      // Scroll → sticky navbar
      fromEvent(window, 'scroll').subscribe(() => {
        this.isScrolled.set(window.scrollY > 10);
      });

      // Fermeture des menus au clic extérieur
      fromEvent(document, 'click').subscribe((event: Event) => {
        const target = event.target as HTMLElement;
        if (!target.closest('.nav-dropdown')) {
          this.isDropdownOpen.set(false);
        }
        if (!target.closest('.user-menu')) {
          this.isUserMenuOpen.set(false);
        }
      });

      // Fermeture des menus lors de la navigation
      this.router.events.pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => this.closeAllMenus());
    }

    // Effet optionnel : log pour debug
    effect(() => {
      console.log('Utilisateur connecté ?', this.isLoggedIn());
      console.log('Rôle :', this.userRole());
      console.log('Nom :', this.userName());
    });
  }

  // === Méthodes UI ===
  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
    if (this.isMobileMenuOpen()) {
      this.isDropdownOpen.set(false);
      this.isUserMenuOpen.set(false);
    }
    this.toggleBodyScroll();
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
    this.toggleBodyScroll();
  }

  toggleDropdown(): void {
    this.isDropdownOpen.update(v => !v);
    if (this.isDropdownOpen()) {
      this.isUserMenuOpen.set(false);
      this.isMobileMenuOpen.set(false);
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen.set(false);
  }

  toggleUserMenu(): void {
    this.isUserMenuOpen.update(v => !v);
    if (this.isUserMenuOpen()) {
      this.isDropdownOpen.set(false);
      this.isMobileMenuOpen.set(false);
    }
  }

  closeUserMenu(): void {
    this.isUserMenuOpen.set(false);
  }

  closeAllMenus(): void {
    this.isMobileMenuOpen.set(false);
    this.isDropdownOpen.set(false);
    this.isUserMenuOpen.set(false);
    this.toggleBodyScroll();
  }

  private toggleBodyScroll(): void {
    if (isPlatformBrowser(this.platformId)) {
      document.body.style.overflow = this.isMobileMenuOpen() ? 'hidden' : '';
    }
  }

  // === Logout ===
  logout(): void {
    this.closeAllMenus();

    this.messageService.add({
      severity: 'success',
      summary: 'Déconnexion',
      detail: 'Vous avez été déconnecté avec succès',
      life: 2000
    });

    this.auth.logout(); // met à jour les signals automatiquement
    this.router.navigate(['/']);
  }

  // === Utilitaires ===
  getUserInitial(): string {
    const name = this.userName();
    if (!name) return 'U';
    const names = name.trim().split(' ');
    if (names.length > 1) {
      return (names[0][0] + names[1][0]).toUpperCase();
    }
    return name[0].toUpperCase();
  }

  getAvatarColor(): string {
    switch (this.userRole()) {
      case 'admin': return '#dc2626';
      case 'prestataire': return '#025ddd';
      case 'client': return '#10b981';
      default: return '#6b7280';
    }
  }

  navigateAndClose(route: string): void {
    this.closeAllMenus();
    this.router.navigate([route]);
  }

  isRouteActive(route: string): boolean {
    return this.router.url === route;
  }
}