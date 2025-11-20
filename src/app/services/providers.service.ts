/* import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface ProviderDocument {
  type: 'CIN' | 'certificat' | 'diplome';
  url: string;
  nom: string;
}

export interface Provider {
  _id: string;
  userId: string; // Référence à User
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  photo?: string;
  
  // Informations professionnelles
  metier: string;
  specialites: string[];
  ville: string;
  adresse: string;
  description: string;
  experience: number; // en années
  
  // Tarifs
  tarifHoraire?: number;
  tarifMission?: number;
  
  // Documents
  cin: string; // URL de la photo CIN
  documents: ProviderDocument[]; // Certificats, diplômes
  
  // Statut
  statut: 'en_attente' | 'actif' | 'suspendu' | 'refuse';
  motifRefus?: string;
  
  // Statistiques
  noteGenerale: number;
  nombreAvis: number;
  nombreMissions: number;
  tauxReponse: number; // en pourcentage
  
  // Boost
//   isBoosted: boolean;
  //boostExpiration?: Date; 
  
  // Dates
  dateInscription: Date;
  dateValidation?: Date;
  derniereMission?: Date;
}

@Injectable({
  providedIn: 'root'
})
export class ProvidersService {
  
  private providersSubject = new BehaviorSubject<Provider[]>([
    {
      _id: 'prov1',
      userId: '2',
      nom: 'Trabelsi',
      prenom: 'Leila',
      email: 'leila.trabelsi@email.com',
      telephone: '+216 22 456 789',
      photo: 'https://i.pravatar.cc/150?img=5',
      metier: 'Plombier',
      specialites: ['Installation sanitaire', 'Réparation fuite', 'Débouchage'],
      ville: 'Sfax',
      adresse: 'Sfax, Centre Ville',
      description: 'Plombière professionnelle avec 8 ans d\'expérience. Spécialisée dans l\'installation et la réparation.',
      experience: 8,
      tarifHoraire: 35,
      tarifMission: 80,
      cin: 'https://via.placeholder.com/400x250/3b82f6/ffffff?text=CIN+Recto',
      documents: [
        { type: 'certificat', url: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Certificat+Professionnel', nom: 'Certificat Plomberie' },
        { type: 'diplome', url: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Diplôme', nom: 'Diplôme CAP Plomberie' }
      ],
      statut: 'actif',
      noteGenerale: 4.7,
      nombreAvis: 23,
      nombreMissions: 45,
      tauxReponse: 92,
      //isBoosted: true,
      //boostExpiration: new Date('2025-01-15'),
      dateInscription: new Date('2024-02-20'),
      dateValidation: new Date('2024-02-22'),
      derniereMission: new Date('2024-11-10')
    },
    {
      _id: 'prov2',
      userId: '3',
      nom: 'Khediri',
      prenom: 'Mohamed',
      email: 'mohamed.khediri@email.com',
      telephone: '+216 55 789 012',
      photo: 'https://i.pravatar.cc/150?img=33',
      metier: 'Électricien',
      specialites: ['Installation électrique', 'Dépannage', 'Tableau électrique'],
      ville: 'Sousse',
      adresse: 'Sousse, Kantaoui',
      description: 'Électricien qualifié, intervention rapide 7j/7.',
      experience: 5,
      tarifHoraire: 40,
      tarifMission: 100,
      cin: 'https://via.placeholder.com/400x250/3b82f6/ffffff?text=CIN+Recto',
      documents: [
        { type: 'certificat', url: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Habilitation+Électrique', nom: 'Habilitation électrique' }
      ],
      statut: 'en_attente',
      noteGenerale: 0,
      nombreAvis: 0,
      nombreMissions: 0,
      tauxReponse: 0,
      //isBoosted: false,
      dateInscription: new Date('2024-11-10')
    },
    {
      _id: 'prov3',
      userId: '5',
      nom: 'Gharbi',
      prenom: 'Youssef',
      email: 'youssef.gharbi@email.com',
      telephone: '+216 99 876 543',
      photo: 'https://i.pravatar.cc/150?img=15',
      metier: 'Menuisier',
      specialites: ['Menuiserie sur mesure', 'Rénovation', 'Ébénisterie'],
      ville: 'Monastir',
      adresse: 'Monastir, Centre',
      description: 'Création de meubles sur mesure, travail soigné.',
      experience: 10,
      tarifHoraire: 45,
      tarifMission: 150,
      cin: 'https://via.placeholder.com/400x250/3b82f6/ffffff?text=CIN+Recto',
      documents: [
        { type: 'diplome', url: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=CAP+Menuiserie', nom: 'CAP Menuiserie' },
        { type: 'certificat', url: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Attestation+Expérience', nom: 'Attestation 10 ans' }
      ],
      statut: 'actif',
      noteGenerale: 4.9,
      nombreAvis: 45,
      nombreMissions: 78,
      tauxReponse: 95,
      //isBoosted: false,
      dateInscription: new Date('2024-02-05'),
      dateValidation: new Date('2024-02-07'),
      derniereMission: new Date('2024-11-12')
    },
    {
      _id: 'prov4',
      userId: '8',
      nom: 'Mejri',
      prenom: 'Samia',
      email: 'samia.mejri@email.com',
      telephone: '+216 26 654 321',
      photo: 'https://i.pravatar.cc/150?img=20',
      metier: 'Femme de ménage',
      specialites: ['Ménage à domicile', 'Repassage', 'Nettoyage professionnel'],
      ville: 'Nabeul',
      adresse: 'Nabeul, Hammamet',
      description: 'Service de ménage professionnel, sérieuse et ponctuelle.',
      experience: 3,
      tarifHoraire: 15,
      cin: 'https://via.placeholder.com/400x250/3b82f6/ffffff?text=CIN+Recto',
      documents: [],
      statut: 'suspendu',
      motifRefus: 'Plaintes multiples de clients',
      noteGenerale: 3.2,
      nombreAvis: 12,
      nombreMissions: 25,
      tauxReponse: 70,
      //isBoosted: false,
      dateInscription: new Date('2024-01-30'),
      dateValidation: new Date('2024-02-02'),
      derniereMission: new Date('2024-10-20')
    },
    {
      _id: 'prov5',
      userId: '11',
      nom: 'Saidi',
      prenom: 'Karim',
      email: 'karim.saidi@email.com',
      telephone: '+216 97 444 555',
      photo: 'https://i.pravatar.cc/150?img=68',
      metier: 'Jardinier',
      specialites: ['Entretien jardin', 'Taille arbres', 'Plantation'],
      ville: 'Sfax',
      adresse: 'Sfax, Route de Tunis',
      description: 'Jardinier expérimenté, entretien complet de votre jardin.',
      experience: 7,
      tarifHoraire: 25,
      tarifMission: 60,
      cin: 'https://via.placeholder.com/400x250/3b82f6/ffffff?text=CIN+Recto',
      documents: [
        { type: 'certificat', url: 'https://via.placeholder.com/400x300/10b981/ffffff?text=Formation+Horticulture', nom: 'Formation horticulture' }
      ],
      statut: 'en_attente',
      noteGenerale: 0,
      nombreAvis: 0,
      nombreMissions: 0,
      tauxReponse: 0,
      //isBoosted: false,
      dateInscription: new Date('2024-11-12')
    },
    {
      _id: 'prov6',
      userId: '13',
      nom: 'Ben Salem',
      prenom: 'Rania',
      email: 'rania.bensalem@email.com',
      telephone: '+216 24 333 444',
      photo: 'https://i.pravatar.cc/150?img=45',
      metier: 'Maquilleuse',
      specialites: ['Maquillage mariage', 'Maquillage soirée', 'Coiffure'],
      ville: 'Tunis',
      adresse: 'Tunis, La Marsa',
      description: 'Maquilleuse professionnelle pour tous vos événements.',
      experience: 4,
      tarifMission: 120,
      cin: 'https://via.placeholder.com/400x250/3b82f6/ffffff?text=CIN+Recto',
      documents: [
        { type: 'diplome', url: 'https://via.placeholder.com/400x300/8b5cf6/ffffff?text=Diplôme+Esthétique', nom: 'Diplôme esthétique' }
      ],
      statut: 'refuse',
      motifRefus: 'Documents incomplets - CIN non valide',
      noteGenerale: 0,
      nombreAvis: 0,
      nombreMissions: 0,
      tauxReponse: 0,
      //isBoosted: false,
      dateInscription: new Date('2024-11-08')
    }
  ]);

  providers$ = this.providersSubject.asObservable();

  getProviders(): Observable<Provider[]> {
    return this.providers$;
  }

  getProviderById(id: string): Provider | undefined {
    return this.providersSubject.value.find(p => p._id === id);
  }

  validateProvider(id: string): void {
    const providers = this.providersSubject.value;
    const index = providers.findIndex(p => p._id === id);
    if (index !== -1) {
      providers[index].statut = 'actif';
      providers[index].dateValidation = new Date();
      this.providersSubject.next([...providers]);
    }
  }

  refuseProvider(id: string, motif: string): void {
    const providers = this.providersSubject.value;
    const index = providers.findIndex(p => p._id === id);
    if (index !== -1) {
      providers[index].statut = 'refuse';
      providers[index].motifRefus = motif;
      this.providersSubject.next([...providers]);
    }
  }

  suspendProvider(id: string, motif: string): void {
    const providers = this.providersSubject.value;
    const index = providers.findIndex(p => p._id === id);
    if (index !== -1) {
      providers[index].statut = 'suspendu';
      providers[index].motifRefus = motif;
      this.providersSubject.next([...providers]);
    }
  }

  activateProvider(id: string): void {
    const providers = this.providersSubject.value;
    const index = providers.findIndex(p => p._id === id);
    if (index !== -1) {
      providers[index].statut = 'actif';
      providers[index].motifRefus = undefined;
      this.providersSubject.next([...providers]);
    } 
  }*/

 /*  boostProvider(id: string, days: number): void {
    const providers = this.providersSubject.value;
    const index = providers.findIndex(p => p._id === id);
    if (index !== -1) {
      providers[index].isBoosted = true;
      const expiration = new Date();
      expiration.setDate(expiration.getDate() + days);
      providers[index].boostExpiration = expiration;
      this.providersSubject.next([...providers]);
    }
  } */

/*   deleteProvider(id: string): void {
    const providers = this.providersSubject.value.filter(p => p._id !== id);
    this.providersSubject.next(providers);
  }
} */


  import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ProviderDocument {
  type: 'CIN' | 'certificat' | 'diplome';
  url: string;
  nom: string;
}

export interface Provider {
  _id: string;
  userId: string;
  nom: string;
  prenom: string;
  email: string;
  telephone: string;
  photo?: string;
  metier: string;
  specialites: string[];
  ville: string;
  adresse: string;
  description: string;
  experience: number;
  tarifHoraire?: number;
  tarifMission?: number;
  cin?: string;
  documents?: ProviderDocument[];
  statut?: 'en_attente' | 'actif' | 'suspendu' | 'refuse';
  motifRefus?: string;
  noteGenerale?: number;
  nombreAvis?: number;
  nombreMissions?: number;
  tauxReponse?: number;
  dateInscription?: string;
  dateValidation?: string;
  derniereMission?: string;
}

/**
 * Service providers connecté au backend.
 * Adapte baseUrl si ton backend expose un chemin différent.
 * Mock providers précédents laissés en commentaire ci-dessous.
 */
@Injectable({ providedIn: 'root' })
export class ProvidersService {
  private baseUrl = '/api/providers'; // adapte si nécessaire

  constructor(private http: HttpClient) {}

  // Mock local (commenté)
  /*
  private mockProviders: Provider[] = [
    {
      _id: 'prov1',
      userId: '2',
      nom: 'Trabelsi',
      prenom: 'Leila',
      email: 'leila.trabelsi@email.com',
      telephone: '+216 22 456 789',
      photo: 'https://i.pravatar.cc/150?img=5',
      metier: 'Plombier',
      specialites: ['Installation sanitaire', 'Réparation fuite', 'Débouchage'],
      ville: 'Sfax',
      adresse: 'Sfax, Centre Ville',
      description: 'Plombière professionnelle avec 8 ans d\'expérience.',
      experience: 8,
      tarifHoraire: 35,
      tarifMission: 80,
      cin: '',
      documents: [],
      statut: 'actif',
      noteGenerale: 4.7,
      nombreAvis: 23,
      nombreMissions: 45,
      tauxReponse: 92,
      dateInscription: new Date('2024-02-20').toISOString(),
      dateValidation: new Date('2024-02-22').toISOString()
    },
    // ...
  ];
  */

  getProviders(): Observable<Provider[]> {
    return this.http.get<Provider[]>(`${this.baseUrl}`);
  }

  getProviderById(id: string): Observable<Provider> {
    return this.http.get<Provider>(`${this.baseUrl}/${id}`);
  }

  validateProvider(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/validate`, {});
  }

  refuseProvider(id: string, motif: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/refuse`, { motif });
  }

  suspendProvider(id: string, motif: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/suspend`, { motif });
  }

  activateProvider(id: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/${id}/activate`, {});
  }

  deleteProvider(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }
}