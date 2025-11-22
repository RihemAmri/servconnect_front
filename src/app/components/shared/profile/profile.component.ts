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

  ngOnInit() {
    const userData = localStorage.getItem('user');
    if (!userData) return;

    this.user = JSON.parse(userData);
    this.initForm();

    if (this.user.role === 'prestataire') {
      this.loadProviderData(this.user._id);
    }
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
    this.profileService.getProvider(userId).subscribe((data: any) => {
      this.provider = data;

      // Transformer les documents et certifications existants pour uniformité
      this.provider.certifications = data.certifications?.map((c: any) => ({ url: c })) || [];
      this.provider.documents = data.documents?.map((d: any) => ({ url: d })) || [];

      this.profileForm.patchValue({
        metier: data.metier,
        description: data.description,
        experience: data.experience,
      });
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
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => { this.user.photo = reader.result; };
    reader.readAsDataURL(file);

    this.uploadPhoto(file);
  }

 uploadPhoto(file: File) {
  this.profileService.updatePhoto(this.user._id, file).subscribe((res: any) => {
    console.log('Photo mise à jour !');
  this.user.photo = res.photo; // <-- utiliser la vraie URL
  localStorage.setItem('user', JSON.stringify(this.user));
  });
}


  // ===================== Documents & Certifications =====================
  addItem(type: 'documents' | 'certifications') {
 const inputId = type === 'documents' ? 'docInput' : 'certInput';
  const input: any = document.getElementById(inputId);
  input.click();
}


 onFileSelected(event: any, type: 'documents' | 'certifications') {
  const files: FileList = event.target.files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append(type, files[i]);
  }

  this.profileService.uploadFiles(this.user._id, type, formData).subscribe((res: any) => {
    // mettre à jour le tableau local avec la réponse du backend
    this.provider[type] = res[type];
    console.log(`${type} uploadés avec succès`);
  });
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

    this.profileService.updateUser(this.user._id, userUpdate).subscribe(() => {

      if (this.user.role === 'prestataire' && this.provider) {
  const providerUpdate = {
    metier: formData.metier,
    description: formData.description,
    experience: formData.experience
  };

  this.profileService.updateProvider(this.user._id, providerUpdate).subscribe(() => {
    console.log('Prestataire mis à jour');
  });
}


      console.log('Profil enregistré');
      this.isEditing = false;
    });
  }
}
