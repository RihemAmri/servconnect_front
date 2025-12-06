


import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface User {
  _id: string;
  nom: string;
  prenom: string;
  email: string;
  telephone?: string;
  adresse?: string;
  role: 'client' | 'prestataire' | 'admin';
  photo?: string;
  dateInscription?: string; // ISO string
  isSuspended?: boolean;
}

/**
 * Service connecté au backend pour gérer les utilisateurs.
 * Les données statiques précédentes sont conservées ci-dessous en commentaire
 * si tu veux repasser en mode "mock" rapidement.
 */
@Injectable({ providedIn: 'root' })
export class UsersService {
  // Ajuste la baseUrl si besoin (ex: environment.apiUrl + '/admin/users')
  private baseUrl = 'http://localhost:5000/api/admin/users'; 


  constructor(private http: HttpClient) {}

  // ---------------------------------------------------------------------------
  // Si tu veux repasser en "mock" local, tu peux conserver le tableau ci-dessous
  // et remplacer les méthodes HTTP par des renvois RxJS. (La donnée est commentée)
  // ---------------------------------------------------------------------------
  /*
  private mockUsers: User[] = [
    { _id: '1', nom: 'Ben Ali', prenom: 'Omar', email: 'omar.benali@email.com', telephone: '+216 98 123 456', adresse: 'Tunis, La Marsa', role: 'client', photo: 'https://i.pravatar.cc/150?img=12', dateInscription: new Date('2024-01-15').toISOString(), isSuspended: false },
    // ... garde ici toutes tes données actuelles ...
  ];
  */

  /**
   * Récupère la liste d'utilisateurs.
   * Le backend retourne { users, total, page, totalPages }.
   * Ici on mappe pour renvoyer directement le tableau users.
   */
  getUsers(params?: { search?: string; role?: string; page?: number; limit?: number }): Observable<User[]> {
    let httpParams = new HttpParams();
    if (params?.search) httpParams = httpParams.set('search', params.search);
    if (params?.role) httpParams = httpParams.set('role', params.role);
    if (params?.page) httpParams = httpParams.set('page', String(params.page));
    if (params?.limit) httpParams = httpParams.set('limit', String(params.limit));

    return this.http
      .get<{ users: User[]; total: number; page: number; totalPages: number }>(`${this.baseUrl}`, { params: httpParams })
      .pipe(map(resp => resp.users));
  }

  /**
   * Récupère un utilisateur par id.
   * Le backend renvoie { user, provider }.
   */
  getUserById(id: string): Observable<{ user: User; provider?: any }> {
    return this.http.get<{ user: User; provider?: any }>(`${this.baseUrl}/${id}`);
  }

  /**
   * Met à jour un utilisateur.
   */
  updateUser(id: string, payload: Partial<User>): Observable<{ message?: string; user?: User }> {
    return this.http.put<{ message?: string; user?: User }>(`${this.baseUrl}/${id}`, payload);
  }

  /**
   * Suspendre un utilisateur.
   */
  suspendUser(id: string): Observable<{ message?: string; user?: User }> {
    return this.http.patch<{ message?: string; user?: User }>(`${this.baseUrl}/${id}/suspend`, {});
  }

  /**
   * Supprimer un utilisateur.
   */
  deleteUser(id: string): Observable<{ message?: string }> {
    return this.http.delete<{ message?: string }>(`${this.baseUrl}/${id}`);
  }
}