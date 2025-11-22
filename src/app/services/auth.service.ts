import { Injectable } from '@angular/core';
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
    this.router.navigate(['/login']);
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
      this.authStatus.next(true);
      this.autoLogout(expiresIn);
    } else {
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
}
