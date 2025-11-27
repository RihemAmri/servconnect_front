import { Component, OnInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../services/profile.service';
import { LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LottieComponent]
})
export class ProfileComponent implements OnInit {

  user: any = null;
  provider: any = null;
  isEditing = false;
  profileForm!: FormGroup;

  certificateLottie = { path: 'assets/animations/Files.json', autoplay: true, loop: true };
  documentLottie = { path: 'assets/animations/Document.json', autoplay: true, loop: true };

  constructor(private fb: FormBuilder, private profileService: ProfileService) {}

  // Get user photo URL
  getUserPhoto(): string {
    if (!this.user?.photo) {
      return 'https://via.placeholder.com/200/025ddd/ffffff?text=User';
    }
    if (this.user.photo.startsWith('http')) {
      return this.user.photo;
    }
    if (this.user.photo.startsWith('data:image')) {
      return this.user.photo;
    }
    return `http://localhost:5000${this.user.photo}`;
  }

  // Handle avatar click
  onAvatarClick(): void {
    if (this.isEditing) {
      this.openPhotoInput();
    }
  }

  ngOnInit() {
    this.loadUserData();
  }

  loadUserData() {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    const localUser = JSON.parse(userData);
    
    // Load fresh user data from server
    this.profileService.getUser(localUser._id).subscribe({
      next: (freshUser: any) => {
        this.user = freshUser;
        // Update localStorage with fresh data
        localStorage.setItem('user', JSON.stringify(this.user));
        this.initForm();

        if (this.user.role === 'prestataire') {
          this.loadProviderData(this.user._id);
        }
      },
      error: (error) => {
        console.error('Erreur chargement utilisateur:', error);
        // Fallback to localStorage data
        this.user = localUser;
        this.initForm();
        
        if (this.user.role === 'prestataire') {
          this.loadProviderData(this.user._id);
        }
      }
    });
  }

  /** Initialisation dynamique du formulaire selon le rôle */
  initForm() {
    const baseFields = {
      nom: [''],
      prenom: [''],
      email: [''],
      telephone: [''],
      adresse: [''],
    };

    const providerFields = {
      metier: [''],
      description: [''],
      experience: [''],
    };

    this.profileForm = this.fb.group(
      this.user.role === 'prestataire' ? { ...baseFields, ...providerFields } : baseFields
    );

    this.profileForm.patchValue({
      nom: this.user.nom,
      prenom: this.user.prenom,
      email: this.user.email,
      telephone: this.user.telephone,
      adresse: this.user.adresse,
    });
  }

  loadProviderData(userId: string) {
    this.profileService.getProvider(userId).subscribe({
      next: (data: any) => {
        this.provider = data;

        // Transformer les documents et certifications existants pour uniformité
        this.provider.certifications = data.certifications?.map((c: any) => ({ url: c })) || [];
        this.provider.documents = data.documents?.map((d: any) => ({ url: d })) || [];

        this.profileForm.patchValue({
          metier: data.metier,
          description: data.description,
          experience: data.experience,
        });
      },
      error: (error) => {
        console.error('Erreur chargement prestataire:', error);
      }
    });
  }

  toggleEdit() {
    this.isEditing = !this.isEditing;
  }

  // ===================== Photo =====================
  openPhotoInput() {
    const input: any = document.querySelector('#photoInput');
    input.value = '';
    input.click();
  }

  onPhotoSelected(event: any) {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => { this.user.photo = reader.result; };
    reader.readAsDataURL(file);

    this.uploadPhoto(file);
  }

  uploadPhoto(file: File) {
    this.profileService.updatePhoto(this.user._id, file).subscribe({
      next: (res: any) => {
        console.log('Photo mise à jour !');
        // Update user photo with the new URL from backend
        this.user.photo = res.photo;
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(this.user));
        // Force view update by triggering change detection
        this.user = { ...this.user };
      },
      error: (error) => {
        console.error('Erreur mise à jour photo:', error);
      }
    });
  }


  // ===================== Documents & Certifications =====================
  addItem(type: 'documents' | 'certifications') {
 const inputId = type === 'documents' ? 'docInput' : 'certInput';
  const input: any = document.getElementById(inputId);
  input.click();
}


  onFileSelected(event: any, type: 'documents' | 'certifications') {
    const input = event.target as HTMLInputElement;
    const files = input.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    for (let i = 0; i < files.length; i++) {
      formData.append(type, files[i]);
    }

    this.profileService.uploadFiles(this.user._id, type, formData).subscribe({
      next: (res: any) => {
        // Update the local provider data with response from backend
        this.provider[type] = res[type];
        console.log(`${type} uploadés avec succès`);
        // Force view update
        this.provider = { ...this.provider };
      },
      error: (error) => {
        console.error(`Erreur upload ${type}:`, error);
      }
    });
  }

onCertFileSelected(event: any) {
  this.onFileSelected(event, 'certifications');
}

onDocFileSelected(event: any) {
  this.onFileSelected(event, 'documents');
}



  removeItem(type: 'documents' | 'certifications', index: number) {
    this.provider[type].splice(index, 1);
  }

  openFile(item: any) {
    if (item.file) {
      window.open(item.url, '_blank');
    } else if (item.url) {
      window.open(item.url, '_blank');
    }
  }

  // ===================== Save =====================
  save() {
    const formData = this.profileForm.value;

    const userUpdate = {
      nom: formData.nom,
      prenom: formData.prenom,
      email: formData.email,
      telephone: formData.telephone,
      adresse: formData.adresse,
    };

    this.profileService.updateUser(this.user._id, userUpdate).subscribe({
      next: (updatedUser: any) => {
        // Update local user object with new data
        this.user.nom = updatedUser.nom;
        this.user.prenom = updatedUser.prenom;
        this.user.email = updatedUser.email;
        this.user.telephone = updatedUser.telephone;
        this.user.adresse = updatedUser.adresse;
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(this.user));

        if (this.user.role === 'prestataire' && this.provider) {
          const providerUpdate = {
            metier: formData.metier,
            description: formData.description,
            experience: formData.experience
          };

          this.profileService.updateProvider(this.user._id, providerUpdate).subscribe({
            next: (updatedProvider: any) => {
              // Update local provider object with new data
              this.provider.metier = updatedProvider.metier;
              this.provider.description = updatedProvider.description;
              this.provider.experience = updatedProvider.experience;
              
              console.log('Prestataire mis à jour');
              this.isEditing = false;
            },
            error: (error) => {
              console.error('Erreur mise à jour prestataire:', error);
            }
          });
        } else {
          this.isEditing = false;
        }

        console.log('Profil enregistré');
      },
      error: (error) => {
        console.error('Erreur mise à jour utilisateur:', error);
      }
    });
  }
}
