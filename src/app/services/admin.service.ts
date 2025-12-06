import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role: 'client' | 'prestataire' | 'admin';
  photo?: string;
  dateInscription: Date;
  isSuspended?: boolean;
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}

export interface UserDetails {
  user: User;
  provider?: any;
  // reservations?: any[];
  // avis?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/admin'; 

  /**
   * 📋 Récupérer la liste des utilisateurs avec filtres
   */
  getUsers(filters: {
    search?: string;
    role?: string;
    page?: number;
    limit?: number;
  }): Observable<UsersResponse> {
    let params = new HttpParams();
    
    if (filters.search) params = params.set('search', filters.search);
    if (filters.role) params = params.set('role', filters.role);
    if (filters.page) params = params.set('page', filters.page.toString());
    if (filters.limit) params = params.set('limit', filters.limit.toString());

    return this.http.get<UsersResponse>(`${this.apiUrl}/users`, { params });
  }

  /**
   * 👁️ Récupérer les détails d'un utilisateur
   */
  getUserDetails(id: string): Observable<UserDetails> {
    return this.http.get<UserDetails>(`${this.apiUrl}/users/${id}`);
  }

  /**
   * ✏️ Modifier un utilisateur
   */
  updateUser(id: string, data: Partial<User>): Observable<any> {
    return this.http.put(`${this.apiUrl}/users/${id}`, data);
  }

  /**
   * 🚫 Suspendre un utilisateur
   */
  suspendUser(id: string): Observable<any> {
    return this.http.patch(`${this.apiUrl}/users/${id}/suspend`, {});
  }

  /**
   * 🗑️ Supprimer un utilisateur
   */
  deleteUser(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/users/${id}`);
  }
}