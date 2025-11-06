import { Component } from '@angular/core';
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

  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onRegister() {
    const formValue = this.registerForm.value;

    // Construction de l'objet à envoyer au backend
    const payload = {
      nom: formValue.name.split(' ')[0] || '',
      prenom: formValue.name.split(' ')[1] || '',
      email: formValue.email,
      motDePasse: formValue.password,
      telephone: formValue.telephone,
      adresse: formValue.adresse,
      role: formValue.role === 'provider' ? 'prestataire' : 'client',
      metier: formValue.category,
      description: formValue.description,
      experience: formValue.experience
    };

    console.log('📦 Payload envoyé au backend:', payload);

    this.http.post('http://localhost:5000/api/users/register', payload)
      .subscribe({
        next: (res) => console.log('✅ Enregistrement réussi :', res),
        error: (err) => console.error('❌ Erreur d’inscription :', err)
      });
  }
}
