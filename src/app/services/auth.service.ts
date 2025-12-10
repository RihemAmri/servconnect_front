/* import { Injectable } from '@angular/core';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/users'; 
  private currentUserSubject = new BehaviorSubject<any>(null);
currentUser$ = this.currentUserSubject.asObservable();
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private authStatus = new BehaviorSubject<boolean>(false);
  private tokenTimer: any;

  constructor(private http: HttpClient, private router: Router) {}

  // ==========================
  // 🟢 INSCRIPTIONS
  // ==========================
  registerClient(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, formData);
  }

  registerProvider(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/register-provider`, formData);
  }

  // ==========================
  // 🟢 LOGIN
  // ==========================
  login(email: string, password: string) {
    return this.http.post<{ user: any; token: string }>(
      `${this.baseUrl}/login`,
      { email, motDePasse: password }
    ).pipe(
      tap((res) => {
        if (!this.isBrowser) return;
        const expiresIn = 24 * 60 * 60 * 1000; // 1 jour en ms
        const expirationDate = new Date(new Date().getTime() + expiresIn);

        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('expiration', expirationDate.toISOString());
this.currentUserSubject.next(res.user); // on émet l'utilisateur
        this.authStatus.next(true);
        this.autoLogout(expiresIn);
      })
    );
  }

  // ==========================
  // 🟢 LOGOUT
  // ==========================
  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiration');
    }

    this.authStatus.next(false);
    clearTimeout(this.tokenTimer);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

// Ajoute cette méthode dans AuthService
setAuthStatus(isLoggedIn: boolean): void {
  this.authStatus.next(isLoggedIn);
}
  // ==========================
  // 🟢 AUTO LOGIN
  // ==========================
  autoLogin() {
    if (!this.isBrowser) return; // ⛔ SSR ne lit pas localStorage
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    const expiration = localStorage.getItem('expiration');

    if (!token || !user || !expiration) return;

    const expiresIn = new Date(expiration).getTime() - new Date().getTime();

    if (expiresIn > 0) {
  const user = JSON.parse(localStorage.getItem('user')!);
  this.currentUserSubject.next(user);
  this.authStatus.next(true);
  this.autoLogout(expiresIn);
}else {
      this.logout();
    }
  }

  // ==========================
  // 🕒 AUTO LOGOUT
  // ==========================
  private autoLogout(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration); // duration en ms
  }

  // ==========================
  // 🟢 OBSERVER AUTH
  // ==========================
  getAuthStatus(): Observable<boolean> {
    return this.authStatus.asObservable();
  }

  isLoggedIn(): boolean {
    return this.authStatus.value;
  }

   getToken(): string | null {
    return localStorage.getItem('token');
  }

getUserRole(): string | null {
  const user = localStorage.getItem('user');
  if (user) {
    const parsed = JSON.parse(user);
    return parsed.role || null; // supposant que ton backend renvoie { role: 'client' | 'provider' | 'admin' }
  }
  return null;
}

getCurrentUser(): any {
  if (typeof window !== 'undefined') {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
  return null; // côté serveur, renvoie null
}





  forgotPassword(email: string) {
  return this.http.post(`${this.baseUrl}/forgot-password`, { email });
}

resetPassword(token: string, motDePasse: string) {
  return this.http.post(`${this.baseUrl}/reset-password/${token}`, { motDePasse });
}

}
 */


import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  private baseUrl = 'http://localhost:5000/api/users';

  // Signals principaux (remplacent les BehaviorSubject)
  currentUser = signal<any>(null);                // utilisateur courant
  isAuthenticated = signal<boolean>(false);       // état de connexion

  // Computed : rôle de l'utilisateur (facile à utiliser dans les templates)
  userRole = computed(() => this.currentUser()?.role || null);

  // Computed : token (lecture seule)
  token = computed(() => {
    if (!this.isBrowser) return null;
    return localStorage.getItem('token');
  });

  private tokenTimer: any;

  constructor() {
    // Auto-login au démarrage du service (exécuté une seule fois)
    this.autoLogin();

    // Optionnel : effet pour loguer ou réagir à un changement d'utilisateur
    effect(() => {
      const user = this.currentUser();
      if (user) {
        console.log('Utilisateur connecté :', user.email);
      }
    });
  }

  // ==========================
  // 🟢 INSCRIPTION
  // ==========================
  registerClient(formData: FormData) {
    return this.http.post(`${this.baseUrl}/register`, formData);
  }

  registerProvider(formData: FormData) {
    return this.http.post(`${this.baseUrl}/register-provider`, formData);
  }

  // ==========================
  // 🟢 LOGIN
  // ==========================
  login(email: string, password: string) {
    return this.http.post<{ user: any; token: string }>(
      `${this.baseUrl}/login`,
      { email, motDePasse: password }
    ).pipe(
      tap((res) => {
        if (!this.isBrowser) return;

        const expiresIn = 24 * 60 * 60 * 1000; // 1 jour
        const expirationDate = new Date(Date.now() + expiresIn);

        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        localStorage.setItem('expiration', expirationDate.toISOString());

        // Mise à jour des signals → tout le reste suit automatiquement
        this.currentUser.set(res.user);
        this.isAuthenticated.set(true);

        this.autoLogout(expiresIn);
      })
    );
  }

  // ==========================
  // 🟢 LOGOUT
  // ==========================
  logout() {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('expiration');
    }

    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    clearTimeout(this.tokenTimer);
    this.router.navigate(['/login']);
  }

  // ==========================
  // 🟢 AUTO LOGIN
  // ==========================
  public autoLogin() {
    if (!this.isBrowser) return;

    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    const expirationStr = localStorage.getItem('expiration');

    if (!token || !userStr || !expirationStr) return;

    const expiresIn = new Date(expirationStr).getTime() - Date.now();

    if (expiresIn > 0) {
      const user = JSON.parse(userStr);
      this.currentUser.set(user);
      this.isAuthenticated.set(true);
      this.autoLogout(expiresIn);
    } else {
      this.logout(); // token expiré → déconnexion
    }
  }

  // ==========================
  // 🕒 AUTO LOGOUT
  // ==========================
  private autoLogout(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration);
  }

  // ==========================
  // 🟢 MÉTHODES UTILITAIRES (simplifiées grâce aux signals)
  // ==========================
  getCurrentUser() {
    return this.currentUser();
  }

  getUserRole() {
    return this.userRole(); // computed, toujours à jour
  }

  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  // ==========================
  // 🟢 MOT DE PASSE OUBLIÉ / RESET
  // ==========================
  forgotPassword(email: string) {
    return this.http.post(`${this.baseUrl}/forgot-password`, { email });
  }

  resetPassword(token: string, motDePasse: string) {
    return this.http.post(`${this.baseUrl}/reset-password/${token}`, { motDePasse });
  }
}