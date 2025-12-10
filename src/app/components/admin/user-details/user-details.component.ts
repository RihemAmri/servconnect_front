
import { Component, OnInit, inject ,PLATFORM_ID, Inject} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
    constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

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
  adresse: {
    street: string;
    lat: number;
    lng: number;
  } | null;
  role: 'client' | 'prestataire' | 'admin';
} = {
  nom: '',
  prenom: '',
  telephone: '',
  adresse: null, // Changé de '' à null
  role: 'client'
};

  roles = [
    { label: 'Client', value: 'client' as const },
    { label: 'Prestataire', value: 'prestataire' as const },
    { label: 'Admin', value: 'admin' as const }
  ];

  ngOnInit() {
      if (isPlatformBrowser(this.platformId)) {
      window.scrollTo({ top: 0 });
    }
    const userId = this.route.snapshot.paramMap.get('id');
    if (userId) {
      this.loadUserDetails(userId);
    }
  
  }
 
  

  

  loadUserDetails(id: string) {
    this.loading = true;
    this.usersService.getUserById(id).subscribe({
      next: (resp) => {
        console.log("hahahaha");
      console.log('Response complète:', resp);
      console.log('User adresse:', resp.user.adresse);
      console.log('Type de adresse:', typeof resp.user.adresse);
      console.log('Street:', resp.user.adresse?.street);
      
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
editAddressStreet: string = '';
  initEditForm() {
  if (this.user) {
    this.editForm = {
      nom: this.user.nom,
      prenom: this.user.prenom,
      telephone: this.user.telephone || '',
      adresse: this.user.adresse || null, // Changé de '' à null
      role: this.user.role
    };
    this.editAddressStreet = this.user.adresse?.street || '';
  }
}

  saveChanges() {
    if (!this.user) return;
    const payload = {
      nom: this.editForm.nom,
      prenom: this.editForm.prenom,
      telephone: this.editForm.telephone,
      adresse: this.editAddressStreet 
      ? {
          street: this.editAddressStreet,
          lat: this.user.adresse?.lat || 0,
          lng: this.user.adresse?.lng || 0
        }
      : null,
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