/* import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

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

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  // ✅ Données centralisées
  private allUsersSubject = new BehaviorSubject<User[]>([
    {
      _id: '1',
      nom: 'Ben Ali',
      prenom: 'Omar',
      email: 'omar.benali@email.com',
      telephone: '+216 98 123 456',
      adresse: 'Tunis, La Marsa',
      role: 'client',
      photo: 'https://i.pravatar.cc/150?img=12',
      dateInscription: new Date('2024-01-15'),
      isSuspended: false
    },
    {
      _id: '2',
      nom: 'Trabelsi',
      prenom: 'Leila',
      email: 'leila.trabelsi@email.com',
      telephone: '+216 22 456 789',
      adresse: 'Sfax, Centre Ville',
      role: 'prestataire',
      photo: 'https://i.pravatar.cc/150?img=5',
      dateInscription: new Date('2024-02-20'),
      isSuspended: false
    },
    {
      _id: '3',
      nom: 'Khediri',
      prenom: 'Mohamed',
      email: 'mohamed.khediri@email.com',
      telephone: '+216 55 789 012',
      adresse: 'Sousse, Kantaoui',
      role: 'prestataire',
      photo: 'https://i.pravatar.cc/150?img=33',
      dateInscription: new Date('2024-03-10'),
      isSuspended: false
    },
    {
      _id: '4',
      nom: 'Amari',
      prenom: 'Fatma',
      email: 'fatma.amari@email.com',
      telephone: '+216 20 345 678',
      adresse: 'Tunis, Carthage',
      role: 'client',
      photo: 'https://i.pravatar.cc/150?img=9',
      dateInscription: new Date('2024-01-25'),
      isSuspended: true
    },
    {
      _id: '5',
      nom: 'Gharbi',
      prenom: 'Youssef',
      email: 'youssef.gharbi@email.com',
      telephone: '+216 99 876 543',
      adresse: 'Monastir, Centre',
      role: 'prestataire',
      photo: 'https://i.pravatar.cc/150?img=15',
      dateInscription: new Date('2024-02-05'),
      isSuspended: false
    },
    {
      _id: '6',
      nom: 'Souissi',
      prenom: 'Ines',
      email: 'ines.souissi@email.com',
      telephone: '+216 54 321 098',
      adresse: 'Tunis, Lac 2',
      role: 'client',
      photo: 'https://i.pravatar.cc/150?img=10',
      dateInscription: new Date('2024-03-15'),
      isSuspended: false
    },
    {
      _id: '7',
      nom: 'Admin',
      prenom: 'Super',
      email: 'admin@khidma.tn',
      telephone: '+216 71 123 456',
      adresse: 'Tunis, Centre',
      role: 'admin',
      photo: 'https://i.pravatar.cc/150?img=60',
      dateInscription: new Date('2023-12-01'),
      isSuspended: false
    },
    {
      _id: '8',
      nom: 'Mejri',
      prenom: 'Samia',
      email: 'samia.mejri@email.com',
      telephone: '+216 26 654 321',
      adresse: 'Nabeul, Hammamet',
      role: 'prestataire',
      photo: 'https://i.pravatar.cc/150?img=20',
      dateInscription: new Date('2024-01-30'),
      isSuspended: false
    },
    {
      _id: '9',
      nom: 'Chakroun',
      prenom: 'Ali',
      email: 'ali.chakroun@email.com',
      telephone: '+216 21 987 654',
      adresse: 'Bizerte, Corniche',
      role: 'client',
      photo: 'https://i.pravatar.cc/150?img=51',
      dateInscription: new Date('2024-02-14'),
      isSuspended: false
    },
    {
      _id: '10',
      nom: 'Hamdi',
      prenom: 'Nour',
      email: 'nour.hamdi@email.com',
      telephone: '+216 58 111 222',
      adresse: 'Ariana, Raoued',
      role: 'client',
      photo: 'https://i.pravatar.cc/150?img=25',
      dateInscription: new Date('2024-03-20'),
      isSuspended: false
    },
    {
      _id: '11',
      nom: 'Saidi',
      prenom: 'Karim',
      email: 'karim.saidi@email.com',
      telephone: '+216 97 444 555',
      adresse: 'Sfax, Route de Tunis',
      role: 'prestataire',
      photo: 'https://i.pravatar.cc/150?img=68',
      dateInscription: new Date('2024-01-10'),
      isSuspended: false
    },
    {
      _id: '12',
      nom: 'Mansouri',
      prenom: 'Salma',
      email: 'salma.mansouri@email.com',
      telephone: '+216 23 666 777',
      adresse: 'Tunis, Menzah',
      role: 'client',
      photo: 'https://i.pravatar.cc/150?img=47',
      dateInscription: new Date('2024-02-28'),
      isSuspended: false
    }
  ]);

  allUsers$ = this.allUsersSubject.asObservable();

  
   // 📥 Récupérer tous les utilisateurs
   
  getUsers(): Observable<User[]> {
    return this.allUsers$;
  }

  
   // 👁️ Récupérer un utilisateur par ID
   
  getUserById(id: string): User | undefined {
    return this.allUsersSubject.value.find(u => u._id === id);
  }

  
   // 🚫 Suspendre un utilisateur
   
  suspendUser(id: string): void {
    const users = this.allUsersSubject.value;
    const userIndex = users.findIndex(u => u._id === id);
    if (userIndex !== -1) {
      users[userIndex].isSuspended = true;
      this.allUsersSubject.next([...users]);
    }
  }

 
   // ✏️ Mettre à jour un utilisateur
   
  updateUser(id: string, updates: Partial<User>): void {
    const users = this.allUsersSubject.value;
    const userIndex = users.findIndex(u => u._id === id);
    if (userIndex !== -1) {
      users[userIndex] = { ...users[userIndex], ...updates };
      this.allUsersSubject.next([...users]);
    }
  }

  
   // 🗑️ Supprimer un utilisateur
   
  deleteUser(id: string): void {
    const users = this.allUsersSubject.value.filter(u => u._id !== id);
    this.allUsersSubject.next(users);
  }
} */



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