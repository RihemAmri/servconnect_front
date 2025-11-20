import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TimelineModule } from 'primeng/timeline';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ReservationsService, Reservation } from '../../../services/reservations.service';

@Component({
  selector: 'app-reservation-details',
  standalone: true,
  imports: [
    CommonModule,
    CardModule,
    ButtonModule,
    TagModule,
    ToastModule,
    ConfirmDialogModule,
    TimelineModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './reservation-details.component.html'
})
export class ReservationDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private reservationsService = inject(ReservationsService);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);

  reservation: Reservation | undefined;
  loading = true;

  // Timeline des statuts
  statusHistory = [
    { status: 'Réservation créée', date: new Date('2024-11-01'), icon: 'pi pi-plus-circle', color: '#3b82f6' },
    { status: 'Confirmée', date: new Date('2024-11-02'), icon: 'pi pi-check', color: '#10b981' },
    { status: 'En cours', date: new Date('2024-11-15'), icon: 'pi pi-spin pi-spinner', color: '#f59e0b' }
  ];

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadReservation(id);
    } else {
      this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'ID manquant' });
      this.router.navigate(['/admin/reservations']);
    }
  }

  loadReservation(id: string) {
    this.loading = true;
    this.reservationsService.getReservations().subscribe(reservations => {
      this.reservation = reservations.find(r => r._id === id);
      if (!this.reservation) {
        this.messageService.add({ severity: 'error', summary: 'Introuvable', detail: 'Réservation introuvable' });
        this.router.navigate(['/admin/reservations']);
      }
      this.loading = false;
    });
  }

  changeStatus(newStatut: Reservation['statut']) {
    if (!this.reservation) return;
    this.confirmationService.confirm({
      message: `Changer le statut à "${this.getStatutLabel(newStatut)}" ?`,
      header: 'Confirmer',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.reservationsService.updateReservationStatus(this.reservation!._id, newStatut);
        this.messageService.add({ severity: 'success', summary: 'Modifié', detail: 'Statut mis à jour' });
      }
    });
  }

  cancelReservation() {
    if (!this.reservation) return;
    const motif = window.prompt('Motif de l\'annulation :');
    if (motif === null) return;
    if (!motif.trim()) {
      this.messageService.add({ severity: 'warn', summary: 'Motif requis', detail: 'Veuillez saisir un motif' });
      return;
    }
    this.reservationsService.cancelReservation(this.reservation._id, motif.trim());
    this.messageService.add({ severity: 'success', summary: 'Annulée', detail: 'Réservation annulée' });
  }

  back() {
    this.router.navigate(['/admin/reservations']);
  }

  getStatutSeverity(statut: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' {
    switch (statut) {
      case 'confirmee': return 'info';
      case 'en_cours': return 'warn';
      case 'terminee': return 'success';
      case 'annulee': return 'danger';
      case 'en_attente': return 'secondary';
      default: return 'secondary';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'en_attente': return 'En attente';
      case 'confirmee': return 'Confirmée';
      case 'en_cours': return 'En cours';
      case 'terminee': return 'Terminée';
      case 'annulee': return 'Annulée';
      default: return statut;
    }
  }
}