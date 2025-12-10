import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReclamationService } from '../../../services/reclamation.service';
import { AuthService } from '../../../services/auth.service';

interface Reclamation {
  _id?: string;
  sujet: string;
  description: string;
  status: 'en attente' | 'répondu' | string;
  reponse?: string;

  showSujet?: boolean;
  showFullDescription?: boolean;
  showReponse?: boolean;

  [key: string]: any;
}


@Component({
  selector: 'app-mes-reclamations',
  imports: [CommonModule, RouterModule],
  templateUrl: './mes-reclamations.component.html',
  styleUrls: ['./mes-reclamations.component.scss']
})
export class MesReclamationsComponent implements OnInit {
  reclamations: Reclamation[] = [];
  filteredReclamations: Reclamation[] = [];
  filter: string = 'all';

  attenteCount = 0;
  reponduCount = 0;
  totalCount = 0;
  
  currentPage = 1;
  itemsPerPage = 3;

  constructor(
    private recService: ReclamationService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    if (!user) return;

    this.recService.getMyReclamations(user._id).subscribe({
      next: (res: Reclamation[]) => {
        // Si ton API renvoie autre chose, adapte le typage ci-dessus
        this.reclamations = res ?? [];
        this.reclamations = (res ?? []).map((r: Reclamation) => ({
          ...r,
          showSujet: false,
          showFullDescription: false,
          showReponse: false
        }));

        this.totalCount = this.reclamations.length;
        this.attenteCount = this.reclamations.filter((r: Reclamation) => r.status === 'en attente').length;
        this.reponduCount = this.reclamations.filter((r: Reclamation) => r.status === 'répondu').length;

        this.applyFilter('all');
      },
      error: (err) => console.error('Erreur récupération réclamations:', err)
    });
  }

  applyFilter(filter: string) {
    this.filter = filter;

    if (filter === 'all') {
      this.filteredReclamations = this.reclamations;
    } else {
      this.filteredReclamations = this.reclamations.filter((r: Reclamation) => r.status === filter);
    }
  }
  get paginatedReclamations() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.filteredReclamations.slice(start, start + this.itemsPerPage);
  }

  nextPage() {
    if (this.currentPage * this.itemsPerPage < this.filteredReclamations.length) {
      this.currentPage++;
    }
  }

  prevPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
    }
  }
  get totalPages() {
  return Math.ceil(this.filteredReclamations.length / this.itemsPerPage);
}

goToPage(page: number | string) {
  if (typeof page === 'string') return; // ignore "..."
  this.currentPage = page;
}


get pagesToShow() {
  const pages: (number | string)[] = [];

  // Toujours montrer 1
  pages.push(1);

  if (this.currentPage > 3) pages.push("...");

  const start = Math.max(2, this.currentPage - 1);
  const end = Math.min(this.totalPages - 1, this.currentPage + 1);

  for (let p = start; p <= end; p++) pages.push(p);

  if (this.currentPage < this.totalPages - 2) pages.push("...");

  if (this.totalPages > 1) pages.push(this.totalPages);

  return pages;
}

shorten(text: string, limit: number): string {
  if (!text) return '';
  return text.length > limit ? text.substring(0, limit) + '...' : text;
}


}
