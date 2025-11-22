/*import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  registerForm: FormGroup;
  selectedFile: File | null = null;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.registerForm = this.fb.group({
      role: ['client', Validators.required],
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
      telephone: [''],
      adresse: [''],
      category: [''],
      description: [''],
      experience: ['']
    });
  }

  // 📸 Quand on choisit une image
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  // 🚀 Soumission du formulaire
  onRegister() {
    const formValue = this.registerForm.value;

    // Séparation du nom et prénom
    const [nom, prenom = ''] = formValue.name.split(' ');

    // Création du FormData pour envoi (multipart/form-data)
    const formData = new FormData();
    formData.append('nom', nom);
    formData.append('prenom', prenom);
    formData.append('email', formValue.email);
    formData.append('motDePasse', formValue.password);
    formData.append('telephone', formValue.telephone || '');
    formData.append('adresse', formValue.adresse || '');
    formData.append('role', formValue.role === 'prestataire' ? 'prestataire' : 'client');

    // ✅ Ajouter ces champs seulement si role = "provider"
    if (formValue.role === 'prestataire') {
      formData.append('metier', formValue.category || '');
      formData.append('description', formValue.description || '');
      formData.append('experience', formValue.experience || '');
    }

    // 📸 Ajouter l’image si elle est sélectionnée
    if (this.selectedFile) {
      formData.append('photo', this.selectedFile);
    }
    

    console.log('📦 FormData envoyé au backend :', {
      nom,
      prenom,
      role: formValue.role,
      photo: this.selectedFile ? this.selectedFile.name : 'aucune',
    });
    console.log('Autres données :', formValue);
    // Envoi au backend
    this.http.post('http://localhost:5000/api/users/register', formData).subscribe({
      next: (res) => console.log('✅ Enregistrement réussi :', res),
      error: (err) => console.error('❌ Erreur d’inscription :', err)
    });
  }
}
*/
import { Component, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule,FormArray,FormControl,AbstractControl  } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
//import * as L from 'leaflet';
import { MapService } from '../../../services/map.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule,HttpClientModule],
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  @ViewChild('photoInput') photoInput!: ElementRef<HTMLInputElement>;

  registerForm: FormGroup;
  showError: any = {};
  photoPreview: string | null = null;
  selectedPhotoFile: File | null = null;
  certificationsFiles: File[] = [];
  documentsFiles: File[] = [];
  passwordVisible = false;
  loading = false;
  successMessage = '';
  errorMessage = '';
  map!: L.Map; 
  marker!: any;

async ngAfterViewInit() {
  if (typeof window === 'undefined') return;
  const L = await import('leaflet');
  this.map = L.map('map').setView([36.8065, 10.1815], 13);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 })
    .addTo(this.map);
  this.mapService.setMap(this.map);
  /* ⭐⭐⭐ ESSENTIEL : empêche la map grise quand le CSS change ⭐⭐⭐ */
  setTimeout(() => {
    this.map.invalidateSize();  // <-- 🔥 redessine la map proprement
  }, 200);
  /* CLICK */
  this.map.on('click', async (e: any) => {
    const lat = e.latlng.lat;
    const lon = e.latlng.lng;

    if (this.marker) this.marker.setLatLng(e.latlng);
    else this.marker = L.marker(e.latlng).addTo(this.map);

    const address = await this.mapService.reverseGeocode(lat, lon);
    const label = address?.display_name ?? `${lat}, ${lon}`;

    this.registerForm.patchValue({
      adresse: {
        street: label,
        lat: lat,
        lng: lon
      }
    });

  });
}



  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router,private mapService: MapService) {
  this.registerForm = this.fb.group({
    role: ['client', Validators.required],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    telephone: ['', Validators.required],
    adresse: this.fb.group({
      street: ['', Validators.required],
      lat: [''],
      lng: ['']
    }),
    lat: [''],
    lon: [''],
    category: [''],
    description: [''],
    experience: [''],
    photo: [null],
    disponibilite: this.fb.array([
    this.createDayAvailability('monday'),
    this.createDayAvailability('tuesday'),
    this.createDayAvailability('wednesday'),
    this.createDayAvailability('thursday'),
    this.createDayAvailability('friday'),
    this.createDayAvailability('saturday'),
    this.createDayAvailability('sunday'),
  ])
  });

  // Initialisation showError
  Object.keys(this.registerForm.controls).forEach(key => this.showError[key] = false);

  // ✅ Ajout du validator conditionnel pour les champs prestataire
  this.registerForm.get('role')?.valueChanges.subscribe(role => {
    if (role === 'prestataire') {
      this.registerForm.get('category')?.setValidators(Validators.required);
      this.registerForm.get('description')?.setValidators(Validators.required);
      this.registerForm.get('experience')?.setValidators(Validators.required);
    } else {
      this.registerForm.get('category')?.clearValidators();
      this.registerForm.get('description')?.clearValidators();
      this.registerForm.get('experience')?.clearValidators();
    }
    this.registerForm.get('category')?.updateValueAndValidity();
    this.registerForm.get('description')?.updateValueAndValidity();
    this.registerForm.get('experience')?.updateValueAndValidity();
  });


  }
 onGoToLogin() {
  this.router.navigate(['/login']);
}
  onAvatarClick() {
    this.photoInput.nativeElement.click();
  }

  togglePasswordVisibility() {
  this.passwordVisible = !this.passwordVisible;
}
  onPhotoSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Veuillez sélectionner une image valide.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('L’image ne doit pas dépasser 5 Mo.');
      return;
    }

    this.selectedPhotoFile = file;
     this.showError['photo'] = false;
    const reader = new FileReader();
    reader.onload = () => (this.photoPreview = reader.result as string);
    reader.readAsDataURL(file);

    this.registerForm.patchValue({ photo: file });
  }

  removePhoto() {
    this.photoPreview = null;
    this.selectedPhotoFile = null;
    this.registerForm.patchValue({ photo: null });
    if (this.photoInput) this.photoInput.nativeElement.value = '';
  }

  onCertificationsSelected(event: any) {
    this.certificationsFiles = Array.from(event.target.files);
     if (this.certificationsFiles.length > 0) {
    this.showError['certifications'] = false; // 
  }
  }

  onDocumentsSelected(event: any) {
    this.documentsFiles = Array.from(event.target.files);
    if (this.documentsFiles.length > 0) {
    this.showError['documents'] = false; // 👈 cacher message si au moins un fichier choisi
  }
  }
 onFocus(field: string) {
    this.showError[field] = false;
    // Ajouter ces lignes dans le constructeur après l'initialisation de showError
this.showError['photo'] = false;
this.showError['certifications'] = false;
this.showError['documents'] = false;
 // cache le message quand l'utilisateur clique
  }
  
  onRegister() {
    Object.keys(this.registerForm.controls).forEach(key => {
    this.showError[key] = this.registerForm.controls[key].invalid;
  });
  // Validation des uploads
if (!this.selectedPhotoFile) {
  this.showError['photo'] = true;
}
if (this.registerForm.get('role')?.value === 'prestataire') {
  if (this.certificationsFiles.length === 0) this.showError['certifications'] = true;
  if (this.documentsFiles.length === 0) this.showError['documents'] = true;
}
//validation dispo provider
if (this.registerForm.get('role')?.value === 'prestataire') {
  let atLeastOneDayChecked = false;

  // Clear previous errors
  this.disponibilite.controls.forEach(dayControl => {
    const dayGroup = dayControl as FormGroup;
    dayGroup.setErrors(null);
    const slots = dayGroup.get('timeSlots') as FormArray;
    slots.controls.forEach(slotControl => (slotControl as FormGroup).setErrors(null));
  });

 this.disponibilite.controls.forEach(dayControl => {
  const dayGroup = dayControl as FormGroup;
  const isAvailable = dayGroup.get('isAvailable')?.value;
  const timeSlots = dayGroup.get('timeSlots') as FormArray;

  if (isAvailable) {
    atLeastOneDayChecked = true;

    // Vérifie si aucun créneau valide n'existe
    let hasValidSlot = false;
    timeSlots.controls.forEach(slotControl => {
      const slot = slotControl as FormGroup;
      const start = slot.get('start')?.value;
      const end = slot.get('end')?.value;

      if (start && end && start < end) {
        hasValidSlot = true; // au moins un créneau valide
      } else if (start || end) {
        // slot partiellement rempli ou invalide → erreur sur le slot
        slot.setErrors({ invalidTime: true });
      }
    });

    if (!hasValidSlot) {
      // aucun créneau valide → erreur sur le jour
      dayGroup.setErrors({ required: true });
    }
  }
});



  if (!atLeastOneDayChecked) {
    // Aucun jour coché → on met une erreur sur le FormArray lui-même
    (this.registerForm.get('disponibilite') as FormArray).setErrors({ required: true });
  }

  // Force l'affichage des messages
  this.disponibilite.markAllAsTouched();

  // Bloque l'envoi si il y a des erreurs
  if (this.disponibilite.invalid) return;
}


// Ne pas envoyer si un champ requis est manquant
if (Object.values(this.showError).some(v => v)) return;

    const formValue = this.registerForm.value;
    const [nom, prenom = ''] = formValue.name.split(' ');
    const formData = new FormData();

    formData.append('nom', nom);
    formData.append('prenom', prenom);
    formData.append('email', formValue.email);
    formData.append('motDePasse', formValue.password);
    formData.append('telephone', formValue.telephone || '');
    formData.append("adresse[street]", formValue.adresse.street);
    formData.append("adresse[lat]", formValue.adresse.lat);
    formData.append("adresse[lng]", formValue.adresse.lng);    formData.append('role', formValue.role);

    if (formValue.role === 'prestataire') {
      formData.append('metier', formValue.category || '');
      formData.append('description', formValue.description || '');
      formData.append('experience', formValue.experience || '');
      this.certificationsFiles.forEach(f => formData.append('certifications', f));
      this.documentsFiles.forEach(f => formData.append('documents', f));
       // 🔹 Préparer disponibilités sous forme de JSON
    const disponibiliteJSON = this.disponibilite.controls.map(dayCtrl => {
  const dayValue = dayCtrl.value;

  // 🔹 Si le jour n’est pas disponible, timeSlots sera un tableau vide
  const timeSlots = dayValue.isAvailable
    ? dayValue.timeSlots.map((slot: any) => ({
        start: slot.start,
        end: slot.end
      }))
    : [];

  return {
    day: dayValue.day,
    isAvailable: dayValue.isAvailable,
    timeSlots
  };
});

    console.log("available test");
    console.log(JSON.stringify(disponibiliteJSON, null, 2));
    // 🔹 Ajouter la disponibilité au FormData
    formData.append('disponibilite', JSON.stringify(disponibiliteJSON));

    // 🔹 Optionnel : console.log pour debug
    console.log('FormData complet :', {
      nom,
      prenom,
      role: formValue.role,
      photo: this.selectedPhotoFile?.name,
      certifications: this.certificationsFiles.map(f => f.name),
      documents: this.documentsFiles.map(f => f.name),
      disponibilite: disponibiliteJSON
    });
    }

    if (this.selectedPhotoFile) {
      formData.append('photo', this.selectedPhotoFile);
    }
     this.loading = true;
  this.successMessage = '';
  this.errorMessage = '';
    // ✅ Appel via le service AuthService
    const request =
      formValue.role === 'prestataire'
        ? this.authService.registerProvider(formData)
        : this.authService.registerClient(formData);

     request.subscribe({
    next: (res) => {
      this.loading = false;
      this.successMessage = '✅ Inscription réussie ! Redirection vers la page de connexion...';
      setTimeout(() => this.router.navigate(['/login']), 1500);
    },
    error: (err) => {
      this.loading = false;
      this.errorMessage = '❌ Erreur lors de l’inscription. Veuillez réessayer.';
      console.error('Erreur:', err);
    }
  });
}
createDayAvailability(day: string): FormGroup {
  return this.fb.group({
    day: [day],
    isAvailable: [false],
    timeSlots: this.fb.array([]),
  });
}

getDisponibilite() {
  return this.registerForm.get('disponibilite') as any;
}

getTimeSlots(index: number): FormArray {
  return (this.disponibilite.at(index).get('timeSlots') as FormArray);
}


addTimeSlot(dayIndex: number) {
  this.getTimeSlots(dayIndex).push(
    this.fb.group({
      start: [''],
      end: ['']
    })
  );
}

removeTimeSlot(dayIndex: number, slotIndex: number) {
  this.getTimeSlots(dayIndex).removeAt(slotIndex);
}
get disponibilite(): FormArray {
  return this.registerForm.get('disponibilite') as FormArray;
}
// Méthode utilitaire
getControl(control: AbstractControl, controlName: string): FormControl {
  return (control as FormGroup).get(controlName) as FormControl;
}

async locate() {
  const pos = await this.mapService.locateUser();
  if (!pos) return;

  const { lat, lon } = pos;

  await this.mapService.placeMarker(lat, lon);
  this.mapService.setView(lat, lon, 15);

  const address = await this.mapService.reverseGeocode(lat, lon);
  const label = address?.display_name ?? `${lat}, ${lon}`;

this.registerForm.patchValue({
  adresse: {
    street: label,
    lat: lat,
    lng: lon
  }
});

}

 async search(query: string) {
  if (!query) return;

  const result = await this.mapService.searchAndMark(query);
  if (!result) return;

  this.registerForm.patchValue({
    adresse: result.label,
    lat: result.y,
    lon: result.x
  });
}


}
