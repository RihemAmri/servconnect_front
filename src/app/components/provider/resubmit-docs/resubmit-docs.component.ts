import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import Swal from 'sweetalert2';

interface VerificationDocument {
  _id: string;
  documentType: 'id' | 'certificate' | 'license' | 'other';
  path: string;
  isVerified: boolean;
  status: 'pending' | 'verified' | 'rejected';
  rejectionReason?: string;
  uploadedAt: string;
}

interface DocumentStats {
  total: number;
  pending: number;
  verified: number;
  rejected: number;
}

interface ProviderDocumentsResponse {
  provider: {
    _id: string;
    isVerified: boolean;
    verificationDocuments: VerificationDocument[];
    stats: DocumentStats;
  };
}

@Component({
  selector: 'app-resubmit-docs',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './resubmit-docs.component.html',
  styleUrl: './resubmit-docs.component.scss'
})
export class ResubmitDocsComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Data
  providerId = '';
  isVerified = false;
  documents: VerificationDocument[] = [];
  stats: DocumentStats = { total: 0, pending: 0, verified: 0, rejected: 0 };

  // UI States
  loading = true;
  uploading = false;
  selectedImage: string | null = null;

// Upload - Track by document type
selectedFiles: { [key: string]: File | null } = {
  id: null,
  certificate: null,
  license: null,
  other: null  // ✅ Ajout du type "other"
};

  // Document types config
// Document types config
documentTypes = [
  { type: 'id', label: "Pièce d'identité", icon: 'fa-id-card', description:  'CIN, Passeport ou Permis de conduire' },
  { type: 'certificate', label: 'Certificat', icon: 'fa-certificate', description: 'Diplôme ou certificat professionnel' },
  { type:  'license', label: 'Licence', icon: 'fa-file-contract', description: 'Licence ou autorisation professionnelle' },
  { type: 'other', label: 'Autre document', icon: 'fa-file-alt', description: 'Tout autre document professionnel' }
];

  ngOnInit() {
    this.loadDocumentsStatus();
  }

  loadDocumentsStatus() {
    this.loading = true;
    
    this.http.get<ProviderDocumentsResponse>(`${environment.apiUrl}/api/providers/me/documents-status`)
      .subscribe({
        next: (response) => {
          console.log('📄 Documents loaded:', response);
          this.providerId = response.provider._id;
          this.isVerified = response.provider.isVerified;
          this.documents = response.provider.verificationDocuments || [];
          this.stats = response.provider.stats;
          this.loading = false;
        },
        error: (error) => {
          console.error('❌ Error loading documents:', error);
          this.loading = false;
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: 'Impossible de charger vos documents',
            confirmButtonColor: '#025ddd'
          });
        }
      });
  }

  // Get document by type
  getDocumentByType(type: string): VerificationDocument | undefined {
    return this.documents.find(d => d.documentType === type);
  }

  // Get status info
  getStatusInfo(status: string): { label: string; class: string; icon: string } {
    switch (status) {
      case 'verified':
        return { label: 'Vérifié', class: 'status-verified', icon: 'fa-check-circle' };
      case 'pending':
        return { label: 'En attente', class: 'status-pending', icon: 'fa-clock' };
      case 'rejected':
        return { label: 'Rejeté', class: 'status-rejected', icon: 'fa-times-circle' };
      default:
        return { label: 'Inconnu', class: 'status-pending', icon: 'fa-question-circle' };
    }
  }

  // Check if document can be uploaded (new or rejected)
  canUpload(type: string): boolean {
    const doc = this.getDocumentByType(type);
    return !doc || doc.status === 'rejected';
  }

  // File selection
  onFileSelected(event: Event, type: string) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFiles[type] = input.files[0];
    }
  }

  removeSelectedFile(type: string) {
    this.selectedFiles[type] = null;
    // Reset input
    const input = document.getElementById(`file-${type}`) as HTMLInputElement;
    if (input) input.value = '';
  }

  // Upload single document
  async uploadDocument(type: string) {
    const file = this.selectedFiles[type];
    if (!file) {
      Swal.fire({
        icon: 'warning',
        title: 'Aucun fichier',
        text: 'Veuillez sélectionner un fichier',
        confirmButtonColor: '#025ddd'
      });
      return;
    }

    const result = await Swal.fire({
      title: 'Confirmer l\'envoi',
      text: `Voulez-vous envoyer ce document (${this.getDocTypeLabel(type)}) ?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#025ddd',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Oui, envoyer',
      cancelButtonText: 'Annuler'
    });

    if (!result.isConfirmed) return;

    this.uploading = true;

    const formData = new FormData();
    formData.append('documentType', type);
    formData.append('document', file);

    this.http.post(`${environment.apiUrl}/api/providers/${this.providerId}/upload-document`, formData)
      .subscribe({
        next: (response) => {
          console.log('✅ Document uploaded:', response);
          Swal.fire({
            icon: 'success',
            title: 'Document envoyé',
            text: 'Votre document a été soumis pour vérification',
            confirmButtonColor: '#025ddd'
          });
          this.selectedFiles[type] = null;
          this.loadDocumentsStatus();
          this.uploading = false;
        },
        error: (error) => {
          console.error('❌ Upload error:', error);
          Swal.fire({
            icon: 'error',
            title: 'Erreur',
            text: error.error?.message || 'Impossible d\'envoyer le document',
            confirmButtonColor: '#025ddd'
          });
          this.uploading = false;
        }
      });
  }

  // View document in modal (only for images)
  viewDocument(url: string) {
    if (this.isPdf(url)) {
      // PDF - ouvrir dans un nouvel onglet
      window.open(url, '_blank');
    } else {
      // Image - afficher dans le modal
      this.selectedImage = url;
    }
  }

  closeImageModal() {
    this.selectedImage = null;
  }

  // Open in new tab
  openDocumentNewTab(url: string) {
    window.open(url, '_blank');
  }

  // Check if URL is PDF
  isPdf(url: string): boolean {
    if (!url) return false;
    const lowerUrl = url.toLowerCase();
    return lowerUrl.includes('.pdf') || lowerUrl.includes('/raw/') || lowerUrl.includes('resource_type=raw');
  }

  // Helper functions
  getDocTypeLabel(type: string): string {
    const found = this.documentTypes.find(d => d.type === type);
    return found ? found.label : type;
  }

  getDocTypeIcon(type: string): string {
    const found = this.documentTypes.find(d => d.type === type);
    return found ? found.icon : 'fa-file';
  }

  goBack() {
    this.router.navigate(['/my-services']);
  }

  // Format file size
  formatFileSize(bytes: number): string {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  }
}