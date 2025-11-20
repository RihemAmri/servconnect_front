import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = 'http://localhost:5000/api/users'; 

  constructor(private http: HttpClient) {}

  registerClient(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/register`, formData);
  }

  registerProvider(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/register-provider`, formData);
  }
  
login(email: string, password: string) {
  return this.http.post(`${this.baseUrl}/login`, { email, motDePasse: password });
  }
  
   logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

}
