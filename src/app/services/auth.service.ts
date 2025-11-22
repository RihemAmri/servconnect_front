import { Injectable } from '@angular/core';
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
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('expiration');
    this.authStatus.next(false);
    clearTimeout(this.tokenTimer);
    this.currentUserSubject.next(null);
    this.router.navigate(['/login']);
  }

  // ==========================
  // 🟢 AUTO LOGIN
  // ==========================
  autoLogin() {
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
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}




}
