import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface VerificationDocument {
  _id?: string;
  documentType: 'id' | 'certificate' | 'license' | 'other';
  path: string;
  isVerified: boolean;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  uploadedAt: Date;
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
  ville: string;
  adresse: any;
  description: string;
  experience: number;
  certifications?: string[];
  documents?: string[];
  verificationDocuments?: VerificationDocument[];
  statut: 'en_attente' | 'actif' | 'suspendu' | 'refuse';
  noteGenerale?: number;
  nombreAvis?: number;
  nombreMissions?: number;
  dateInscription?: string;
  disponibilite?: any[];
}

// ✅ Alias pour compatibilité
export type DocumentStatus = VerificationDocument;

export interface DocumentsStatusResponse {
  provider: {
    _id: string;
    isVerified: boolean;
    verificationDocuments: DocumentStatus[];
    stats: {
      total: number;
      pending: number;
      verified: number;
      rejected: number;
    };
  };
}

@Injectable({ providedIn: 'root' })
export class ProvidersService {
  private adminBaseUrl = 'http://localhost:5000/api/admin/providers';
  private providerBaseUrl = 'http://localhost:5000/api/providers'; // ✅ AJOUT
  private providersSubject = new BehaviorSubject<Provider[]>([]);
  providers$ = this.providersSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadProviders();
  }

  private loadProviders() {
    this.http.get<Provider[]>(this.adminBaseUrl).subscribe(providers => {
      console.log('📦 Providers chargés:', providers);
      this.providersSubject.next(providers);
    });
  }

  // ==========================================
  // 👨‍💼 MÉTHODES ADMIN
  // ==========================================
  
  getProviders(): Observable<Provider[]> {
    return this.providers$;
  }

  getProviderById(id: string): Observable<Provider> {
    return this.http.get<Provider>(`${this.adminBaseUrl}/${id}`);
  }

  validateProvider(id: string): Observable<any> {
    return this.http.patch(`${this.adminBaseUrl}/${id}/validate`, {}).pipe(
      tap(() => this.loadProviders())
    );
  }

  rejectProvider(id: string, motif: string, documentIds?: string[]): Observable<any> {
    return this.http.patch(`${this.adminBaseUrl}/${id}/reject`, { motif, documentIds }).pipe(
      tap(() => this.loadProviders())
    );
  }

  updateDocumentStatus(
    providerId: string, 
    documentId: string, 
    status: 'verified' | 'rejected', 
    rejectionReason?: string
  ): Observable<any> {
    return this.http.patch(
      `${this.adminBaseUrl}/${providerId}/documents/${documentId}`,
      { status, rejectionReason }
    ).pipe(tap(() => this.loadProviders()));
  }

  deleteProvider(id: string): Observable<any> {
    return this.http.delete(`${this.adminBaseUrl}/${id}`).pipe(
      tap(() => this.loadProviders())
    );
  }

  // ==========================================
  // 👷 MÉTHODES PRESTATAIRE
  // ==========================================

  getMyDocumentsStatus(): Observable<DocumentsStatusResponse> {
    return this.http.get<DocumentsStatusResponse>(`${this.providerBaseUrl}/me/documents-status`);
  }

  resubmitDocuments(providerId: string, formData: FormData): Observable<any> {
    return this.http.post(`${this.providerBaseUrl}/${providerId}/resubmit-documents`, formData);
  }
}