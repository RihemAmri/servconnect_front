import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { BadgeModule } from 'primeng/badge';
import { ConfirmDialogModule } from 'primeng/confirmdialog'; // ✅ AJOUT
import { MessageService, ConfirmationService } from 'primeng/api';

import { ProvidersService, Provider } from '../../../services/providers.service';

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
    ConfirmDialogModule // ✅ AJOUT
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './provider-details.component.html'
})
export class ProviderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private providersService = inject(ProvidersService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  provider: Provider | undefined;
  loading = true;

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProvider(id);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'ID manquant' });
      this.router.navigate(['/admin/providers']);
    }
  }

  loadProvider(id: string) {
    this.loading = true;
    // ✅ CORRECTION : S'abonner au service pour recevoir les mises à jour
    this.providersService.getProviders().subscribe(providers => {
      this.provider = providers.find(p => p._id === id);
      if (!this.provider) {
        this.messageService.add({ severity: 'error', summary: 'Introuvable', detail: 'Prestataire introuvable' });
        this.router.navigate(['/admin/providers']);
      }
      this.loading = false;
    });
  }

  validateProvider() {
    if (!this.provider) return;
    this.confirmationService.confirm({
      message: `Valider le compte de ${this.provider.prenom} ${this.provider.nom} ?`,
      header: 'Valider le prestataire',
      icon: 'pi pi-check',
      acceptLabel: 'Oui', // ✅ AJOUT
      rejectLabel: 'Non', // ✅ AJOUT
      accept: () => {
        this.providersService.validateProvider(this.provider!._id);
        this.messageService.add({ severity: 'success', summary: 'Validé', detail: 'Prestataire validé avec succès' });
      }
    });
  }

  refuseProvider() {
    if (!this.provider) return;
    const motif = window.prompt('Motif du refus :');
    if (motif === null) return;
    if (!motif.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Motif requis', detail: 'Veuillez saisir un motif' });
      return;
    }
    this.providersService.refuseProvider(this.provider._id, motif.trim());
    this.messageService.add({ severity: 'success', summary: 'Refusé', detail: 'Compte refusé' });
  }

  toggleSuspend() {
    if (!this.provider) return;
    if (this.provider.statut === 'suspendu') {
      this.providersService.activateProvider(this.provider._id);
      this.messageService.add({ severity: 'success', summary: 'Activé', detail: 'Prestataire réactivé' });
    } else {
      const motif = window.prompt('Motif de la suspension :');
      if (motif === null) return;
      this.providersService.suspendProvider(this.provider._id, motif.trim() || 'Suspendu par admin');
      this.messageService.add({ severity: 'success', summary: 'Suspendu', detail: 'Prestataire suspendu' });
    }
  }

/*   boostProvider() {
    if (!this.provider) return;
    const daysStr = window.prompt('Nombre de jours pour le boost (ex: 7) :', '7');
    if (daysStr === null) return;
    const days = Number(daysStr);
    if (!Number.isInteger(days) || days <= 0) {
      this.messageService.add({ severity: 'warn', summary: 'Jour invalide', detail: 'Saisir un nombre de jours valide' });
      return;
    }
    this.providersService.boostProvider(this.provider._id, days);
    this.messageService.add({ severity: 'success', summary: 'Boost', detail: `Mis en avant pour ${days} jours` });
  } */

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
        this.providersService.deleteProvider(this.provider!._id);
        this.messageService.add({ severity: 'success', summary: 'Supprimé', detail: 'Prestataire supprimé' });
        this.router.navigate(['/admin/providers']);
      }
    });
  }

  back() {
    this.router.navigate(['/admin/providers']);
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