import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ReclamationService } from '../../../services/reclamation.service';

@Component({
  selector: 'app-reclamations-list',
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './reclamations-list.component.html',
  styleUrls: ['./reclamations-list.component.scss']
})
export class ReclamationsListComponent implements OnInit {

  reclamations: any[] = [];
  searchTerm: string = "";
  filterStatus: string = "";

  constructor(private recService: ReclamationService, private router: Router) {}

  ngOnInit(): void {
    this.recService.getAllReclamations().subscribe({
      next: (res: any) => this.reclamations = res,
      error: (err) => console.error(err)
    });
  }

  get filteredReclamations() {
    return this.reclamations
      .filter(r =>
        (r.user?.nom + " " + r.user?.prenom + " " + r.sujet)
          .toLowerCase()
          .includes(this.searchTerm.toLowerCase())
      )
      .filter(r =>
        this.filterStatus ? r.status === this.filterStatus : true
      );
  }

  viewDetails(id: string) {
    this.router.navigate(['/admin/reclamations', id]);
  }
}
