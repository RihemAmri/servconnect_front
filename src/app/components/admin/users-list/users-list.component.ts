

  
/* import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

// PrimeNG imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

import { UsersService, User } from '../../../services/users.service'; 

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    TagModule,
    ConfirmDialogModule,
    ToastModule,
    TooltipModule
  ],
  providers: [ConfirmationService, MessageService],
  templateUrl: './users-list.component.html'
})
export class UsersListComponent implements OnInit {
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private usersService = inject(UsersService); 

  users: User[] = [];
  filteredUsers: User[] = [];
  allUsers: User[] = []; 
  totalRecords = 0;
  loading = false;

  searchTerm = '';
  selectedRole: any = { label: 'Tous', value: 'tous' };
  
  roles = [
    { label: 'Tous', value: 'tous' },
    { label: 'Clients', value: 'client' },
    { label: 'Prestataires', value: 'prestataire' },
    { label: 'Admins', value: 'admin' }
  ];

  page = 1;
  limit = 10;

  ngOnInit() {
    // ✅ Récupérer les données du service
    this.usersService.getUsers().subscribe(users => {
      this.allUsers = users;
      this.applyFilters();
      this.users = this.filteredUsers.slice(0, this.limit);
      this.totalRecords = this.filteredUsers.length;
    });
  }

  applyFilters() {
    let filtered = [...this.allUsers];

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user => 
        user.nom.toLowerCase().includes(search) ||
        user.prenom.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        user.telephone?.toLowerCase().includes(search) ||
        user.adresse?.toLowerCase().includes(search)
      );
    }

    if (this.selectedRole.value !== 'tous') {
      filtered = filtered.filter(user => user.role === this.selectedRole.value);
    }

    this.filteredUsers = filtered;
  }

  onSearch() {
    this.page = 1;
    this.applyFilters();
    this.users = this.filteredUsers.slice(0, this.limit);
    this.totalRecords = this.filteredUsers.length;
  }

  onFilterChange() {
    this.page = 1;
    this.applyFilters();
    this.users = this.filteredUsers.slice(0, this.limit);
    this.totalRecords = this.filteredUsers.length;
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    
    const start = event.first;
    const end = start + event.rows;
    this.users = this.filteredUsers.slice(start, end);
  }

  viewDetails(userId: string) {
    console.log('🔍 Navigation vers:', userId); // ✅ Debug log
    this.router.navigate(['/admin/users', userId]);
  }

  suspendUser(user: User) {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment suspendre ${user.prenom} ${user.nom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.usersService.suspendUser(user._id); // ✅ Utiliser service
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `${user.prenom} ${user.nom} a été suspendu`
        });
        
        this.applyFilters();
        const start = (this.page - 1) * this.limit;
        this.users = this.filteredUsers.slice(start, start + this.limit);
      }
    });
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: `⚠️ ATTENTION : Voulez-vous vraiment supprimer ${user.prenom} ${user.nom} ?`,
      header: 'Supprimer l\'utilisateur',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usersService.deleteUser(user._id); // ✅ Utiliser service
        
        this.messageService.add({
          severity: 'success',
          summary: 'Succès',
          detail: `${user.prenom} ${user.nom} a été supprimé`
        });
        
        this.applyFilters();
        this.totalRecords = this.filteredUsers.length;
        
        const totalPages = Math.ceil(this.totalRecords / this.limit);
        if (this.page > totalPages && totalPages > 0) {
          this.page = totalPages;
        }
        
        const start = (this.page - 1) * this.limit;
        this.users = this.filteredUsers.slice(start, start + this.limit);
        
        if (this.users.length === 0 && this.page > 1) {
          this.page = 1;
          this.users = this.filteredUsers.slice(0, this.limit);
        }
      }
    });
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    switch(role) {
      case 'admin': return 'warn';
      case 'prestataire': return 'info';
      case 'client': return 'success';
      default: return 'secondary';
    }
  }

  getRoleLabel(role: string): string {
    switch(role) {
      case 'admin': return 'Admin';
      case 'prestataire': return 'Prestataire';
      case 'client': return 'Client';
      default: return role;
    }
  }

  resetFilters() {
  this.searchTerm = '';
  this.selectedRole = { label: 'Tous', value: 'tous' };
  this.page = 1;
  
  this.applyFilters();
  this.users = this.filteredUsers.slice(0, this.limit);
  this.totalRecords = this.filteredUsers.length;
  
  this.messageService.add({
    severity: 'info',
    summary: 'Réinitialisation',
    detail: 'Les filtres ont été réinitialisés'
  });
}
} */


import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { UsersService, User } from '../../../services/users.service';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MessageService } from 'primeng/api';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, DropdownModule, TagModule, ConfirmDialogModule, ToastModule, TooltipModule],
  providers: [ConfirmationService, MessageService],
  templateUrl: './users-list.component.html'
})
export class UsersListComponent implements OnInit {
  private router = inject(Router);
  private confirmationService = inject(ConfirmationService);
  private messageService = inject(MessageService);
  private usersService = inject(UsersService);

  users: User[] = [];
  filteredUsers: User[] = [];
  allUsers: User[] = [];
  totalRecords = 0;
  loading = false;

  searchTerm = '';
  selectedRole: any = { label: 'Tous', value: 'tous' };

  roles = [
    { label: 'Tous', value: 'tous' },
    { label: 'Clients', value: 'client' },
    { label: 'Prestataires', value: 'prestataire' },
    { label: 'Admins', value: 'admin' }
  ];

  page = 1;
  limit = 10;

  ngOnInit() {
    this.loadAllUsers();
  }

  loadAllUsers() {
    this.loading = true;
    this.usersService.getUsers({ page: this.page, limit: 1000 }).subscribe({
      next: (users) => {
        this.allUsers = users;
        this.applyFilters();
        this.users = this.filteredUsers.slice(0, this.limit);
        this.totalRecords = this.filteredUsers.length;
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur getUsers:', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de récupérer les utilisateurs' });
        this.loading = false;
      }
    });
  }

  applyFilters() {
    let filtered = [...this.allUsers];

    if (this.searchTerm.trim()) {
      const search = this.searchTerm.toLowerCase();
      filtered = filtered.filter(user =>
        user.nom.toLowerCase().includes(search) ||
        user.prenom.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search) ||
        (user.telephone || '').toLowerCase().includes(search) ||
        (user.adresse || '').toLowerCase().includes(search)
      );
    }

    if (this.selectedRole.value !== 'tous') {
      filtered = filtered.filter(user => user.role === this.selectedRole.value);
    }

    this.filteredUsers = filtered;
  }

  onSearch() {
    this.page = 1;
    this.applyFilters();
    this.users = this.filteredUsers.slice(0, this.limit);
    this.totalRecords = this.filteredUsers.length;
  }

  onFilterChange() {
    this.onSearch();
  }

  onPageChange(event: any) {
    this.page = event.page + 1;
    this.limit = event.rows;
    const start = event.first;
    const end = start + event.rows;
    this.users = this.filteredUsers.slice(start, end);
  }

  viewDetails(userId: string) {
    this.router.navigate(['/admin/users', userId]);
  }

  suspendUser(user: User) {
    this.confirmationService.confirm({
      message: `Voulez-vous vraiment suspendre ${user.prenom} ${user.nom} ?`,
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.usersService.suspendUser(user._id).subscribe({
          next: (resp) => {
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: `${user.prenom} ${user.nom} a été suspendu` });
            // rafraîchir l'affichage local
            this.loadAllUsers();
          },
          error: (err) => {
            console.error('Erreur suspend:', err);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec lors de la suspension' });
          }
        });
      }
    });
  }

  deleteUser(user: User) {
    this.confirmationService.confirm({
      message: `⚠️ ATTENTION : Voulez-vous vraiment supprimer ${user.prenom} ${user.nom} ?`,
      header: 'Supprimer l\'utilisateur',
      icon: 'pi pi-trash',
      acceptButtonStyleClass: 'p-button-danger',
      accept: () => {
        this.usersService.deleteUser(user._id).subscribe({
          next: () => {
            this.messageService.add({ severity: 'success', summary: 'Succès', detail: `${user.prenom} ${user.nom} a été supprimé` });
            this.loadAllUsers();
          },
          error: (err) => {
            console.error('Erreur delete:', err);
            this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la suppression' });
          }
        });
      }
    });
  }

  getRoleSeverity(role: string) {
    switch (role) {
      case 'admin': return 'warn';
      case 'prestataire': return 'info';
      case 'client': return 'success';
      default: return 'secondary';
    }
  }

  getRoleLabel(role: string): string {
    switch (role) {
      case 'admin': return 'Admin';
      case 'prestataire': return 'Prestataire';
      case 'client': return 'Client';
      default: return role;
    }
  }

  resetFilters() {
    this.searchTerm = '';
    this.selectedRole = { label: 'Tous', value: 'tous' };
    this.page = 1;
    this.applyFilters();
    this.users = this.filteredUsers.slice(0, this.limit);
    this.totalRecords = this.filteredUsers.length;
    this.messageService.add({ severity: 'info', summary: 'Réinitialisation', detail: 'Les filtres ont été réinitialisés' });
  }
}