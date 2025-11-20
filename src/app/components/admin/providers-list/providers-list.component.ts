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
import { BadgeModule } from 'primeng/badge';
import { MessageService } from 'primeng/api';

import { ProvidersService, Provider } from '../../../services/providers.service';

@Component({
  selector: 'app-providers-list',
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
    BadgeModule
  ],
  providers: [MessageService],
  templateUrl: './providers-list.component.html'
})
export class ProvidersListComponent implements OnInit {
  private router = inject(Router);
  private messageService = inject(MessageService);
  private providersService = inject(ProvidersService);

  providers: Provider[] = [];
  filteredProviders: Provider[] = [];
  allProviders: Provider[] = [];
  totalRecords = 0;
  loading = false;

  searchTerm = '';
  selectedStatut: any = { label: 'Tous', value: 'tous' };
  selectedVille: any = { label: 'Toutes', value: 'toutes' };

  statuts = [
    { label: 'Tous', value: 'tous' },
    { label: 'En attente', value: 'en_attente' },
    { label: 'Actifs', value: 'actif' },
    { label: 'Suspendus', value: 'suspendu' },
    { label: 'Refusés', value: 'refuse' }
  ];

  villes = [
    { label: 'Toutes', value: 'toutes' },
    { label: 'Tunis', value: 'Tunis' },
    { label: 'Sfax', value: 'Sfax' },
    { label: 'Sousse', value: 'Sousse' },
    { label: 'Monastir', value: 'Monastir' },
    { label: 'Nabeul', value: 'Nabeul' }
  ];

  page = 1;
  limit = 10;

  // Statistiques
  stats = {
    total: 0,
    enAttente: 0,
    actifs: 0,
    suspendus: 0
  };

  ngOnInit() {
    this.providersService.getProviders().subscribe(providers => {
      this.allProviders = providers;
      this.calculateStats();
      this.applyFilters();
      this.providers = this.filteredProviders.slice(0, this.limit);
      this.totalRecords = this.filteredProviders.length;
    });
  }

  calculateStats() {
    this.stats.total = this.allProviders.length;
    this.stats.enAttente = this.allProviders.filter(p => p.statut === 'en_attente').length;
    this.stats.actifs = this.allProviders.filter(p => p.statut === 'actif').length;
    this.stats.suspendus = this.allProviders.filter(p => p.statut === 'suspendu').length;
  }

  applyFilters() {
    let filtered = [...this.allProviders];

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(provider =>
        provider.nom.toLowerCase().includes(search) ||
        provider.prenom.toLowerCase().includes(search) ||
        provider.metier.toLowerCase().includes(search) ||
        provider.ville.toLowerCase().includes(search)
      );
    }

    if (this.selectedStatut.value !== 'tous') {
      filtered = filtered.filter(provider => provider.statut === this.selectedStatut.value);
    }

    if (this.selectedVille.value !== 'toutes') {
      filtered = filtered.filter(provider => provider.ville === this.selectedVille.value);
    }

    this.filteredProviders = filtered;
  }

  onSearch() {
    this.page = 1;
    this.applyFilters();
    this.providers = this.filteredProviders.slice(0, this.limit);
    this.totalRecords = this.filteredProviders.length;
  }

  onFilterChange() {
    this.page = 1;
    this.applyFilters();
    this.providers = this.filteredProviders.slice(0, this.limit);
    this.totalRecords = this.filteredProviders.length;
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedStatut = { label: 'Tous', value: 'tous' };
    this.selectedVille = { label: 'Toutes', value: 'toutes' };
    this.page = 1;

    this.applyFilters();
    this.providers = this.filteredProviders.slice(0, this.limit);
    this.totalRecords = this.filteredProviders.length;

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
    this.providers = this.filteredProviders.slice(start, end);
  }

  viewDetails(providerId: string) {
    this.router.navigate(['/admin/providers', providerId]);
  }

  getStatutSeverity(statut: string): 'success' | 'info' | 'warn' | 'danger' {
    switch (statut) {
      case 'actif': return 'success';
      case 'en_attente': return 'warn';
      case 'suspendu': return 'danger';
      case 'refuse': return 'danger';
      default: return 'info';
    }
  }

  getStatutLabel(statut: string): string {
    switch (statut) {
      case 'actif': return 'Actif';
      case 'en_attente': return 'En attente';
      case 'suspendu': return 'Suspendu';
      case 'refuse': return 'Refusé';
      default: return statut;
    }
  }
}