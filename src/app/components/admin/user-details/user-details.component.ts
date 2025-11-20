/* import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

// PrimeNG
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { UsersService, User } from '../../../services/users.service'; 

interface Provider {
  metier: string;
  description?: string;
  experience?: number;
  isVerified: boolean;
  noteGenerale: number;
  nombreAvis: number;
}

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ButtonModule,
    InputTextModule,
    TextareaModule,
    DropdownModule,
    TagModule,
    TabViewModule,
    ToastModule
  ],
  providers: [MessageService],
  templateUrl: './user-details.component.html'
})
export class UserDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private usersService = inject(UsersService); 

  private providersData: { [key: string]: Provider } = {
    '2': {
      metier: 'Plombier',
      description: 'Plombier professionnel avec 8 ans d\'expérience',
      experience: 8,
      isVerified: true,
      noteGenerale: 4.7,
      nombreAvis: 23
    },
    '3': {
      metier: 'Électricien',
      description: 'Spécialiste en installation électrique',
      experience: 5,
      isVerified: false,
      noteGenerale: 4.2,
      nombreAvis: 12
    },
    '5': {
      metier: 'Menuisier',
      description: 'Création de meubles sur mesure',
      experience: 10,
      isVerified: true,
      noteGenerale: 4.9,
      nombreAvis: 45
    }
  };

  user: User | null = null;
  provider: Provider | null = null;
  loading = true;
  editMode = false;

  editForm: {
    nom: string;
    prenom: string;
    telephone: string;
    adresse: string;
    role: 'client' | 'prestataire' | 'admin';
  } = {
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
    role: 'client'
  };

  roles = [
    { label: 'Client', value: 'client' as const },
    { label: 'Prestataire', value: 'prestataire' as const },
    { label: 'Admin', value: 'admin' as const }
  ];

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    console.log('📋 User ID from route:', userId); // ✅ Debug log
    
    if (userId) {
      this.loadUserDetails(userId);
    }
  }

  loadUserDetails(id: string) {
    this.loading = true;

    setTimeout(() => {
      // ✅ Récupérer du service au lieu de la copie locale
      const foundUser = this.usersService.getUserById(id);
      
      console.log('🔍 Found user:', foundUser); // ✅ Debug log
      
      if (foundUser) {
        this.user = foundUser;
        
        if (foundUser.role === 'prestataire' && this.providersData[id]) {
          this.provider = this.providersData[id];
        }
        
        this.initEditForm();
      } else {
        this.messageService.add({
          severity: 'error',
          summary: 'Erreur',
          detail: 'Utilisateur introuvable'
        });
        this.router.navigate(['/admin/users']);
      }
      
      this.loading = false;
    }, 300);
  }

  initEditForm() {
    if (this.user) {
      this.editForm = {
        nom: this.user.nom,
        prenom: this.user.prenom,
        telephone: this.user.telephone || '',
        adresse: this.user.adresse || '',
        role: this.user.role
      };
    }
  }

  saveChanges() {
    if (!this.user) return;

    // ✅ Utiliser le service pour mettre à jour
    this.usersService.updateUser(this.user._id, this.editForm);

    this.messageService.add({
      severity: 'success',
      summary: 'Succès',
      detail: 'Utilisateur modifié avec succès'
    });
    this.editMode = false;
  }

  cancelEdit() {
    this.editMode = false;
    this.initEditForm();
  }

  goBack() {
    this.router.navigate(['/admin/users']);
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' {
    switch(role) {
      case 'admin': return 'warn';
      case 'prestataire': return 'info';
      case 'client': return 'success';
      default: return 'success';
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
} */


  import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';
import { TagModule } from 'primeng/tag';
import { TabViewModule } from 'primeng/tabview';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

import { UsersService, User } from '../../../services/users.service';

interface Provider {
  metier: string;
  description?: string;
  experience?: number;
  isVerified: boolean;
  noteGenerale: number;
  nombreAvis: number;
}

@Component({
  selector: 'app-user-details',
  standalone: true,
  imports: [CommonModule, FormsModule, CardModule, ButtonModule, InputTextModule, TextareaModule, DropdownModule, TagModule, TabViewModule, ToastModule],
  providers: [MessageService],
  templateUrl: './user-details.component.html'
})
export class UserDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private messageService = inject(MessageService);
  private usersService = inject(UsersService);

  // Exemple de données statiques (commentées) — garde en commentaire si tu veux utiliser le backend
  /*
  private providersData: { [key: string]: Provider } = {
    '2': {
      metier: 'Plombier',
      description: 'Plombier professionnel avec 8 ans d\'expérience',
      experience: 8,
      isVerified: true,
      noteGenerale: 4.7,
      nombreAvis: 23
    },
    // ...
  };
  */

  user: User | null = null;
  provider: Provider | null = null;
  loading = true;
  editMode = false;

  editForm: {
    nom: string;
    prenom: string;
    telephone: string;
    adresse: string;
    role: 'client' | 'prestataire' | 'admin';
  } = {
    nom: '',
    prenom: '',
    telephone: '',
    adresse: '',
    role: 'client'
  };

  roles = [
    { label: 'Client', value: 'client' as const },
    { label: 'Prestataire', value: 'prestataire' as const },
    { label: 'Admin', value: 'admin' as const }
  ];

  ngOnInit() {
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUserDetails(userId);
    }
  }

  loadUserDetails(id: string) {
    this.loading = true;
    this.usersService.getUserById(id).subscribe({
      next: (resp) => {
        this.user = resp.user;
        // si tu veux utiliser des données statiques, décommente la logique qui récupère providersData
        if (resp.provider) {
          this.provider = resp.provider;
        } else {
          // si tu utilises providersData statique, fais :
          // this.provider = this.providersData[id] || null;
          this.provider = null;
        }
        this.initEditForm();
        this.loading = false;
      },
      error: (err) => {
        console.error('Erreur chargement user:', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger l\'utilisateur' });
        this.loading = false;
        this.router.navigate(['/admin/users']);
      }
    });
  }

  initEditForm() {
    if (this.user) {
      this.editForm = {
        nom: this.user.nom,
        prenom: this.user.prenom,
        telephone: this.user.telephone || '',
        adresse: this.user.adresse || '',
        role: this.user.role
      };
    }
  }

  saveChanges() {
    if (!this.user) return;
    const payload = {
      nom: this.editForm.nom,
      prenom: this.editForm.prenom,
      telephone: this.editForm.telephone,
      adresse: this.editForm.adresse,
      role: this.editForm.role
    };
    this.usersService.updateUser(this.user._id, payload).subscribe({
      next: (resp) => {
        this.user = resp.user || this.user;
        this.messageService.add({ severity: 'success', summary: 'Succès', detail: 'Utilisateur modifié avec succès' });
        this.editMode = false;
      },
      error: (err) => {
        console.error('Erreur update:', err);
        this.messageService.add({ severity: 'error', summary: 'Erreur', detail: 'Échec de la modification' });
      }
    });
  }

  cancelEdit() {
    this.editMode = false;
    this.initEditForm();
  }

  goBack() {
    this.router.navigate(['/admin/users']);
  }

  getRoleSeverity(role: string): 'success' | 'info' | 'warn' {
    switch (role) {
      case 'admin': return 'warn';
      case 'prestataire': return 'info';
      case 'client': return 'success';
      default: return 'success';
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
}