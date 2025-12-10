import { Component, OnInit, AfterViewInit, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ProfileService } from '../../../services/profile.service';
import { MapService } from '../../../services/map.service';
import { LottieComponent } from 'ngx-lottie';

declare var L: any;

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  imports: [CommonModule, ReactiveFormsModule, FormsModule, LottieComponent]
})
export class ProfileComponent implements OnInit, AfterViewInit {

  user: any = null;
  provider: any = null;
  isEditing = false;
  profileForm!: FormGroup;
  isLoading = true;
  
  // Map properties
  map!: any;
  marker!: any;
  showAddressMap = false;

  certificateLottie = { path: 'assets/animations/Files.json', autoplay: true, loop: true };
  documentLottie = { path: 'assets/animations/Document.json', autoplay: true, loop: true };

  constructor(
    private fb: FormBuilder, 
    private profileService: ProfileService,
    private mapService: MapService
  ) {
    // Initialize form immediately with empty values
    this.initEmptyForm();
  }

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
    if (!userData) {
      this.isLoading = false;
      return;
    }

    const localUser = JSON.parse(userData);
    
    // Load fresh user data from server
    this.profileService.getUser(localUser._id).subscribe({
      next: (freshUser: any) => {
        console.log('User loaded:', freshUser);
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

  /** Initialize empty form to prevent FormGroup errors */
  initEmptyForm() {
    this.profileForm = this.fb.group({
      nom: [''],
      prenom: [''],
      email: [''],
      telephone: [''],
      adresse: this.fb.group({
        street: [''],
        lat: [''],
        lng: ['']
      }),
      metier: [''],
      description: [''],
      experience: [''],
    });
  }

  /** Initialisation dynamique du formulaire selon le rôle */
  initForm() {
    if (!this.user) return;

    // Handle address - can be string or object
    let adresseValue = { street: '', lat: '', lng: '' };
    if (this.user.adresse) {
      if (typeof this.user.adresse === 'string') {
        adresseValue = { street: this.user.adresse, lat: '', lng: '' };
      } else if (typeof this.user.adresse === 'object') {
        adresseValue = {
          street: this.user.adresse.street || '',
          lat: this.user.adresse.lat || '',
          lng: this.user.adresse.lng || ''
        };
      }
    }

    this.profileForm.patchValue({
      nom: this.user.nom || '',
      prenom: this.user.prenom || '',
      email: this.user.email || '',
      telephone: this.user.telephone || '',
      adresse: adresseValue,
    });

    this.isLoading = false;
  }

  // ===================== Map Methods =====================
  ngAfterViewInit() {
    // Map will be initialized when user clicks to edit address
  }

  async initMap() {
    if (typeof window === 'undefined' || this.map) return;
    
    const L = await import('leaflet');
    
    // Get initial coordinates from user address or default to Tunisia
    let lat = 36.8065;
    let lng = 10.1815;
    
    if (this.user?.adresse?.lat && this.user?.adresse?.lng) {
      lat = parseFloat(this.user.adresse.lat);
      lng = parseFloat(this.user.adresse.lng);
    }
    
    this.map = L.map('profile-map').setView([lat, lng], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 })
      .addTo(this.map);
    this.mapService.setMap(this.map);
    
    // Add marker if coordinates exist
    if (this.user?.adresse?.lat && this.user?.adresse?.lng) {
      this.marker = L.marker([lat, lng]).addTo(this.map);
    }
    
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
    
    // Click handler
    this.map.on('click', async (e: any) => {
      const clickLat = e.latlng.lat;
      const clickLng = e.latlng.lng;

      if (this.marker) this.marker.setLatLng(e.latlng);
      else this.marker = L.marker(e.latlng).addTo(this.map);

      const address = await this.mapService.reverseGeocode(clickLat, clickLng);
      const label = address?.display_name ?? `${clickLat}, ${clickLng}`;

      this.profileForm.patchValue({
        adresse: {
          street: label,
          lat: clickLat,
          lng: clickLng
        }
      });
    });
  }

  toggleAddressMap() {
    this.showAddressMap = !this.showAddressMap;
    if (this.showAddressMap) {
      setTimeout(() => this.initMap(), 100);
    }
  }

  async locateUser() {
    const pos = await this.mapService.locateUser();
    if (!pos) return;

    const { lat, lon } = pos;
    const L = await import('leaflet');

    if (this.marker) this.marker.setLatLng([lat, lon]);
    else this.marker = L.marker([lat, lon]).addTo(this.map);
    
    this.map.setView([lat, lon], 15);

    const address = await this.mapService.reverseGeocode(lat, lon);
    const label = address?.display_name ?? `${lat}, ${lon}`;

    this.profileForm.patchValue({
      adresse: {
        street: label,
        lat: lat,
        lng: lon
      }
    });
  }

  async searchAddress(query: string) {
    if (!query) return;

    const result = await this.mapService.searchAndMark(query);
    if (!result) return;
    
    const L = await import('leaflet');

    if (this.marker) this.marker.setLatLng([result.y, result.x]);
    else this.marker = L.marker([result.y, result.x]).addTo(this.map);
    
    this.map.setView([result.y, result.x], 15);

    this.profileForm.patchValue({
      adresse: {
        street: result.label,
        lat: result.y,
        lng: result.x
      }
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
    
    // Close map and cleanup when exiting edit mode
    if (!this.isEditing) {
      this.showAddressMap = false;
      if (this.map) {
        this.map.remove();
        this.map = null;
        this.marker = null;
      }
    }
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
