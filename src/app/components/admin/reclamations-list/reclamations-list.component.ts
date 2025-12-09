import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReclamationService } from '../../../services/reclamation.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { BadgeModule } from 'primeng/badge';

@Component({
  selector: 'app-reclamations-list',
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ToastModule,
    TooltipModule,
    BadgeModule
  ],
  templateUrl: './reclamations-list.component.html',
  styleUrls: ['./reclamations-list.component.scss']
})
export class ReclamationsListComponent implements OnInit {
  reclamations: any[] = [];
  searchTerm: string = "";
  filterStatus: string = "";

  // dropdown options pour le filtre
  statuts = [
    { label: 'Tous', value: '' },
    { label: 'En attente', value: 'en attente' },
    { label: 'Répondu', value: 'répondu' }
  ];

  // pagination
  currentPage: number = 1;
  pageSize: number = 6; // items par page (change si tu veux)
  maxPagesToShow: number = 5;

  constructor(private recService: ReclamationService, private router: Router) {}

  ngOnInit(): void {
    this.recService.getAllReclamations().subscribe({
      next: (res: any) => this.reclamations = res || [],
      error: (err) => console.error(err)
    });
  }

get filteredReclamations() {
  const term = this.searchTerm.toLowerCase();

  return this.reclamations
    .filter(r => {
      const fullName = (r.user?.nom || '') + ' ' + (r.user?.prenom || '');
      const sujet = r.sujet || '';
      const role = r.user?.role || '';
      const dateStr = r.dateCreation ? new Date(r.dateCreation).toLocaleDateString() : '';
      
      // Vérifie si le terme de recherche est dans l'un de ces champs
      return (
        fullName.toLowerCase().includes(term) ||
        sujet.toLowerCase().includes(term) ||
        role.toLowerCase().includes(term) ||
        dateStr.toLowerCase().includes(term)
      );
    })
    .filter(r =>
      !this.filterStatus || r.status.toLowerCase() === this.filterStatus.toLowerCase()
    );
}


    resetFilters() {
    this.searchTerm = "";
    this.filterStatus = "";
    this.currentPage = 1; // reset pagination
  }

  // --- pagination helpers ---
  get total() { return this.reclamations.length; }
  get enAttente() { return this.reclamations.filter(r => r.status === "en attente").length; }
  get repondu() { return this.reclamations.filter(r => r.status === "répondu").length; }

  get totalPages() {
    return Math.max(1, Math.ceil(this.filteredReclamations.length / this.pageSize));
  }

  get pagesToShow(): number[] {
    const total = this.totalPages;
    const max = this.maxPagesToShow;
    let start = Math.max(1, this.currentPage - Math.floor(max / 2));
    let end = start + max - 1;
    if (end > total) { end = total; start = Math.max(1, end - max + 1); }
    const pages: number[] = [];
    for (let p = start; p <= end; p++) pages.push(p);
    return pages;
  }

  get pagedReclamations() {
    const filtered = this.filteredReclamations;
    const start = (this.currentPage - 1) * this.pageSize;
    return filtered.slice(start, start + this.pageSize);
  }

  prevPage() {
    if (this.currentPage > 1) this.currentPage--;
  }

  nextPage() {
    if (this.currentPage < this.totalPages) this.currentPage++;
  }

  goToPage(p: number) {
    if (p >= 1 && p <= this.totalPages) this.currentPage = p;
  }

  viewDetails(id: string) {
    this.router.navigate(['/admin/reclamations', id]);
  }
}
