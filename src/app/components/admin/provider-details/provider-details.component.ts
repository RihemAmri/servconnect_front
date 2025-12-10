import { Component, OnInit, inject, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { TabView } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputText } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ProvidersService, Provider, VerificationDocument } from '../../../services/providers.service';

@Component({
  selector: 'app-provider-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    TagModule,
    TabViewModule,
    ToastModule,
    BadgeModule,
    ConfirmDialogModule,
    DialogModule,
   
    TooltipModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './provider-details.component.html',
  styleUrls: ['./provider-details.component.scss']
})
export class ProviderDetailsComponent implements OnInit {
  @ViewChild('tabView') tabView!: TabView;

  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private providersService = inject(ProvidersService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  provider: Provider | undefined;
  loading = true;
  activeTabIndex = 0;

  // Dialogue de rejet
  showRejectDialog = false;
  rejectMotif = '';
  selectedDocumentId?: string;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProvider(id);
    } else {
      this.messageService.add({ 
        severity: 'error', 
        summary: 'Erreur', 
        detail: 'ID manquant' 
      });
      this.router.navigate(['/admin/providers']);
    }
    if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0 });
    }
  }

  loadProvider(id: string, preserveTab: boolean = false) {
    this.loading = true;
    const currentTab = preserveTab ? this.activeTabIndex : 0;

    this.providersService.getProviderById(id).subscribe({
      next: (provider) => {
        console.log('✅ Provider chargé:', provider);
        this.provider = provider;
        this.loading = false;

        if (preserveTab) {
          setTimeout(() => {
            this.activeTabIndex = currentTab;
          }, 0);
        }
      },
      error: (error) => {
        console.error('❌ Erreur chargement provider:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de charger le prestataire'
        });
        this.loading = false;
        this.router.navigate(['/admin/providers']);
      }
    });
  }

  validateProvider() {
    if (!this.provider) return;

    this.confirmationService.confirm({
      message: `Valider le compte de ${this.provider.prenom} ${this.provider.nom} ? Tous les documents seront marqués comme vérifiés.`,
      header: 'Valider le prestataire',
      icon: 'pi pi-check',
      acceptLabel: 'Oui, valider',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-success',
      accept: () => {
        this.providersService.validateProvider(this.provider!._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Validé',
              detail: 'Prestataire validé avec succès'
            });
            this.loadProvider(this.provider!._id, true);
          },
          error: (error) => {
            console.error('❌ Erreur validation:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de valider le prestataire'
            });
          }
        });
      }
    });
  }

  validateDocument(documentId: string) {
    this.providersService.updateDocumentStatus(
      this.provider!._id,
      documentId,
      'verified'
    ).subscribe({
      next: () => {
        this.messageService.add({
          severity: 'success',
          summary: 'Validé',
          detail: 'Document validé avec succès'
        });
        this.loadProvider(this.provider!._id, true);
      },
      error: (error) => {
        console.error('❌ Erreur validation document:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Impossible de valider le document'
        });
      }
    });
  }

  openRejectDialog(documentId?: string) {
    this.selectedDocumentId = documentId;
    this.rejectMotif = '';
    this.showRejectDialog = true;
  }

  confirmReject() {
    if (!this.rejectMotif.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Motif requis',
        detail: 'Veuillez saisir un motif de refus'
      });
      return;
    }

    if (this.selectedDocumentId) {
      // Rejeter un document spécifique (le prestataire sera automatiquement refusé)
      this.providersService.updateDocumentStatus(
        this.provider!._id,
        this.selectedDocumentId,
        'rejected',
        this.rejectMotif
      ).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'info',
            summary: 'Document refusé',
            detail: 'Le document a été rejeté et le prestataire a été automatiquement refusé'
          });
          this.loadProvider(this.provider!._id, true);
          this.showRejectDialog = false;
        },
        error: (error) => {
          console.error('❌ Erreur rejet document:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de rejeter le document'
          });
        }
      });
    } else {
      // Rejeter tout le prestataire
      this.providersService.rejectProvider(this.provider!._id, this.rejectMotif).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Refusé',
            detail: 'Prestataire refusé'
          });
          this.loadProvider(this.provider!._id, true);
          this.showRejectDialog = false;
        },
        error: (error) => {
          console.error('❌ Erreur rejet prestataire:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Erreur',
            detail: 'Impossible de rejeter le prestataire'
          });
        }
      });
    }
  }

  deleteProvider() {
    if (!this.provider) return;

    this.confirmationService.confirm({
      message: `Supprimer définitivement ${this.provider.prenom} ${this.provider.nom} ? Cette action est irréversible.`,
      header: 'Supprimer prestataire',
      icon: 'pi pi-trash',
      acceptLabel: 'Oui, supprimer',
      rejectLabel: 'Annuler',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.providersService.deleteProvider(this.provider!._id).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Supprimé',
              detail: 'Prestataire supprimé'
            });
            this.router.navigate(['/admin/providers']);
          },
          error: (error) => {
            console.error('❌ Erreur suppression:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Erreur',
              detail: 'Impossible de supprimer le prestataire'
            });
          }
        });
      }
    });
  }

  onTabChange(event: any) {
    this.activeTabIndex = event.index;
  }

  openImage(imageUrl: string) {
    window.open(imageUrl, '_blank');
  }

  back() {
    this.router.navigate(['/admin/providers']);
  }

  // ==========================================
  // 🔍 MÉTHODES DE VÉRIFICATION
  // ==========================================

  hasRejectedDocuments(): boolean {
    return this.provider?.verificationDocuments?.some(doc => doc.status === 'rejected') || false;
  }

  allDocumentsVerified(): boolean {
    if (!this.provider?.verificationDocuments || this.provider.verificationDocuments.length === 0) {
      return false;
    }
    return this.provider.verificationDocuments.every(doc => doc.status === 'verified');
  }

  getNumberOfRejectedDocs(): number {
    return this.provider?.verificationDocuments?.filter(doc => doc.status === 'rejected').length || 0;
  }

  getNumberOfPendingDocs(): number {
    return this.provider?.verificationDocuments?.filter(doc => doc.status === 'pending').length || 0;
  }

  getNumberOfVerifiedDocs(): number {
    return this.provider?.verificationDocuments?.filter(doc => doc.status === 'verified').length || 0;
  }

  getTotalDocs(): number {
    return this.provider?.verificationDocuments?.length || 0;
  }

  // ==========================================
  // 🎨 MÉTHODES D'AFFICHAGE
  // ==========================================

  getDocumentStatusSeverity(status: string): 'success' | 'warn' | 'danger' {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warn';
      case 'rejected': return 'danger';
      default: return 'warn';
    }
  }

  getDocumentStatusLabel(status: string): string {
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
      case 'other': return 'Autre';
      default: return type;
    }
  }

  displayStatut(statut: string | undefined): string {
    switch (statut) {
      case 'actif': return 'Actif';
      case 'en_attente': return 'En attente';
      case 'suspendu': return 'Suspendu';
      case 'refuse': return 'Refusé';
      default: return 'Inconnu';
    }
  }

  getStatutSeverity(statut: string | undefined): 'success' | 'warn' | 'danger' {
    switch (statut) {
      case 'actif': return 'success';
      case 'en_attente': return 'warn';
      default: return 'danger';
    }
  }
}