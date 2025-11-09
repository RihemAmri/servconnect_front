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
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';


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

  

  constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
  this.registerForm = this.fb.group({
    role: ['client', Validators.required],
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
    telephone: ['', Validators.required],
    adresse: ['', Validators.required],
    category: [''],
    description: [''],
    experience: [''],
    photo: [null]
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
    formData.append('adresse', formValue.adresse || '');
    formData.append('role', formValue.role);

    if (formValue.role === 'prestataire') {
      formData.append('metier', formValue.category || '');
      formData.append('description', formValue.description || '');
      formData.append('experience', formValue.experience || '');
      this.certificationsFiles.forEach(f => formData.append('certifications', f));
      this.documentsFiles.forEach(f => formData.append('documents', f));
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
}
