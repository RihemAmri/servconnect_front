import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { Subscription, fromEvent } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit, OnDestroy {

  isScrolled = false;
  isMobileMenuOpen = false;

  isLoggedIn = false;
  userRole: string | null = null;
  userName: string | null = null;
  notificationsCount = 3;

  private subs: Subscription[] = [];

  private auth = inject(AuthService);
  private router = inject(Router);

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
        return;
      }

      this.userRole = user.role;
      console.log(user.prenom, user.nom);

     this.userName = `${user.prenom || ''} ${user.nom || ''}`.trim();

      console.log("Nom calculé :", this.userName);
    })
  );

  // Scroll listener
  this.subs.push(
    fromEvent(window, 'scroll').subscribe(() => {
      this.isScrolled = window.scrollY > 10;
    })
  );
}


  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
  }

  logout() {
    this.auth.logout();
    this.closeMobileMenu();
  }
}
