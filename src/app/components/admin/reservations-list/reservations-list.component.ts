import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';

import { ReservationsService, Reservation } from '../../../services/reservations.service';

@Component({
  selector: 'app-reservations-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ToastModule,
    TooltipModule,
    ConfirmDialogModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './reservations-list.component.html'
})
export class ReservationsListComponent implements OnInit {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private confirmationService = inject(ConfirmationService);
  private reservationsService = inject(ReservationsService);

  reservations: Reservation[] = [];
  filteredReservations: Reservation[] = [];
  allReservations: Reservation[] = [];
  totalRecords = 0;
  loading = false;

  searchTerm = '';
  selectedStatut: any = { label: 'Tous', value: 'tous' };

  statuts = [
    { label: 'Tous', value: 'tous' },
    { label: 'En attente', value: 'en_attente' },
    { label: 'Confirmées', value: 'confirmee' },
    { label: 'En cours', value: 'en_cours' },
    { label: 'Terminées', value: 'terminee' },
    { label: 'Annulées', value: 'annulee' }
  ];

  page = 1;
  limit = 10;

  // Statistiques
  stats = {
    total: 0,
    enAttente: 0,
    confirmees: 0,
    enCours: 0,
    terminees: 0,
    annulees: 0,
    revenueTotal: 0
  };

  ngOnInit() {
    this.reservationsService.getReservations().subscribe(reservations => {
      this.allReservations = reservations;
      this.calculateStats();
      this.applyFilters();
      this.reservations = this.filteredReservations.slice(0, this.limit);
      this.totalRecords = this.filteredReservations.length;
    });
  }

  calculateStats() {
    this.stats.total = this.allReservations.length;
    this.stats.enAttente = this.allReservations.filter(r => r.statut === 'en_attente').length;
    this.stats.confirmees = this.allReservations.filter(r => r.statut === 'confirmee').length;
    this.stats.enCours = this.allReservations.filter(r => r.statut === 'en_cours').length;
    this.stats.terminees = this.allReservations.filter(r => r.statut === 'terminee').length;
    this.stats.annulees = this.allReservations.filter(r => r.statut === 'annulee').length;
    this.stats.revenueTotal = this.allReservations
      .filter(r => r.statut === 'terminee')
      .reduce((sum, r) => sum + r.prix, 0);
  }

  applyFilters() {
    let filtered = [...this.allReservations];

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(reservation =>
        reservation.clientNom.toLowerCase().includes(search) ||
        reservation.prestataireNom.toLowerCase().includes(search) ||
        reservation.metier.toLowerCase().includes(search) ||
        reservation.ville.toLowerCase().includes(search)
      );
    }

    if (this.selectedStatut.value !== 'tous') {
      filtered = filtered.filter(reservation => reservation.statut === this.selectedStatut.value);
    }

    // Trier par date de service (plus récente en premier)
    filtered.sort((a, b) => b.dateService.getTime() - a.dateService.getTime());

    this.filteredReservations = filtered;
  }

  onSearch() {
    this.page = 1;
    this.applyFilters();
    this.reservations = this.filteredReservations.slice(0, this.limit);
    this.totalRecords = this.filteredReservations.length;
  }

  onFilterChange() {
    this.page = 1;
    this.applyFilters();
    this.reservations = this.filteredReservations.slice(0, this.limit);
    this.totalRecords = this.filteredReservations.length;
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedStatut = { label: 'Tous', value: 'tous' };
    this.page = 1;

    this.applyFilters();
    this.reservations = this.filteredReservations.slice(0, this.limit);
    this.totalRecords = this.filteredReservations.length;

    this.messageService.add({
      severity: 'info',
      summary: 'Réinitialisation',
      detail: 'Les filtres ont été réinitialisés'
    });
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;

    const start = event.first;
    const end = start + event.rows;
    this.reservations = this.filteredReservations.slice(start, end);
  }

  viewDetails(reservationId: string) {
    this.router.navigate(['/admin/reservations', reservationId]);
  }

  changeStatus(reservation: Reservation, newStatut: Reservation['statut']) {
    this.confirmationService.confirm({
      message: `Changer le statut de cette réservation à "${this.getStatutLabel(newStatut)}" ?`,
      header: 'Confirmer le changement',
      icon: 'pi pi-question-circle',
      acceptLabel: 'Oui',
      rejectLabel: 'Non',
      accept: () => {
        this.reservationsService.updateReservationStatus(reservation._id, newStatut);
        this.messageService.add({
          severity: 'success',
          summary: 'Statut modifié',
          detail: `Réservation mise à jour`
        });
      }
    });
  }

  cancelReservation(reservation: Reservation) {
    const motif = window.prompt('Motif de l\'annulation :');
    if (motif === null) return;
    if (!motif.trim()) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Motif requis',
        detail: 'Veuillez saisir un motif'
      });
      return;
    }
    this.reservationsService.cancelReservation(reservation._id, motif.trim());
    this.messageService.add({
      severity: 'success',
      summary: 'Annulée',
      detail: 'Réservation annulée'
    });
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