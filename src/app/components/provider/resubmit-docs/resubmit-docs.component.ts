import { Component, OnInit, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { MessageService } from 'primeng/api';

import { 
  ProvidersService, 
  DocumentStatus, 
  DocumentsStatusResponse 
} from '../../../services/providers.service';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-resubmit-docs',
  standalone: true, // ✅ standalone: true
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    ToastModule,
    FileUploadModule
  ],
  providers: [MessageService],
  templateUrl: './resubmit-docs.component.html',
  styleUrl: './resubmit-docs.component.scss'
})
export class ResubmitDocsComponent implements OnInit { // ✅ implements OnInit
  
  @ViewChild('certificationsInput') certificationsInput!: ElementRef<HTMLInputElement>;
  @ViewChild('documentsInput') documentsInput!: ElementRef<HTMLInputElement>;

  private documentsService = inject(ProvidersService); // ✅ ProvidersService
  private authService = inject(AuthService);
  private messageService = inject(MessageService);

  providerId: string = '';
  isVerified: boolean = false;
  documents: DocumentStatus[] = [];
  stats = {
    total: 0,
    pending: 0,
    verified: 0,
    rejected: 0
  };

  loading = false;
  uploading = false;

  // Fichiers sélectionnés
  certificationsFiles: File[] = [];
  documentsFiles: File[] = [];

  ngOnInit() {
    this.loadDocumentsStatus();
  }

  loadDocumentsStatus() {
    this.loading = true;
    this.documentsService.getMyDocumentsStatus().subscribe({
      next: (response: DocumentsStatusResponse) => {
        this.providerId = response.provider._id;
        this.isVerified = response.provider.isVerified;
        this.documents = response.provider.verificationDocuments;
        this.stats = response.provider.stats;
        this.loading = false;
        console.log('📄 Documents chargés:', response);
      },
      error: (error) => {
        console.error('❌ Erreur chargement documents:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger vos documents'
        });
        this.loading = false;
      }
    });
  }

  onCertificationsSelected(event: any) {
    this.certificationsFiles = Array.from(event.target.files);
    console.log(`📄 ${this.certificationsFiles.length} certification(s) sélectionnée(s)`);
  }

  onDocumentsSelected(event: any) {
    this.documentsFiles = Array.from(event.target.files);
    console.log(`📄 ${this.documentsFiles.length} document(s) sélectionné(s)`);
  }

  removeCertification(index: number) {
    this.certificationsFiles.splice(index, 1);
  }

  removeDocument(index: number) {
    this.documentsFiles.splice(index, 1);
  }

  resubmitDocuments() {
    if (this.certificationsFiles.length === 0 && this.documentsFiles.length === 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Aucun fichier',
        detail: 'Veuillez sélectionner au moins un document'
      });
      return;
    }

    const formData = new FormData();

    // Ajouter les certificats
    this.certificationsFiles.forEach(f => {
      formData.append('certifications', f);
      console.log(`📄 Ajout certificat: ${f.name}`);
    });

    // Ajouter les documents
    this.documentsFiles.forEach(f => {
      formData.append('documents', f);
      console.log(`📄 Ajout document: ${f.name}`);
    });

    this.uploading = true;

    console.log(`🚀 Envoi vers: /api/providers/${this.providerId}/resubmit-documents`);

    this.documentsService.resubmitDocuments(this.providerId, formData).subscribe({
      next: (response) => {
        console.log('✅ Documents re-soumis:', response);
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: 'Vos documents ont été envoyés pour vérification'
        });

        // Réinitialiser
        this.certificationsFiles = [];
        this.documentsFiles = [];
        if (this.certificationsInput) this.certificationsInput.nativeElement.value = '';
        if (this.documentsInput) this.documentsInput.nativeElement.value = '';

        // Recharger
        this.loadDocumentsStatus();
        this.uploading = false;
      },
      error: (error) => {
        console.error('❌ Erreur re-soumission:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: error.error?.message || 'Impossible d\'envoyer les documents'
        });
        this.uploading = false;
      }
    });
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warn';
      case 'rejected': return 'danger';
      default: return 'warn';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'verified': return 'Vérifié';
      case 'pending': return 'En attente';
      case 'rejected': return 'Rejeté';
      default: return status;
    }
  }

  getDocumentTypeLabel(type: string): string {
    switch (type) {
      case 'id': return 'Pièce d\'identité';
      case 'certificate': return 'Certificat';
      case 'license': return 'Licence';
      case 'other': return 'Autre document';
      default: return type;
    }
  }

  openDocument(url: string) {
    window.open(url, '_blank');
  }
}