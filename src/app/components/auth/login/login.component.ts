import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'; // 🟢 Import obligatoire pour ngClass, ngIf, etc.
import { AuthService } from '../../../services/auth.service'; // chemin correct vers ton service
import { Router } from '@angular/router'; // pour naviguer après logi
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-login',
  standalone: true, // ✅ important si ton composant est standalone
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule, // ✅ ici pour ngClass
    ReactiveFormsModule,
    RouterModule
  ]
})
export class LoginComponent {
  loginForm: FormGroup;
  passwordVisible = false;
  loading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  
  showError = { email: false, password: false };
  

constructor(private fb: FormBuilder, private authService: AuthService, private router: Router) {
  this.loginForm = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });
}

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }
 onFocus(field: 'email' | 'password') {
    this.showError[field] = false; // cache le message quand l'utilisateur clique
  }
 onLogin() {
  // ✅ Marquer tous les champs comme "touched" pour activer les erreurs Angular
  this.loginForm.markAllAsTouched();

  Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.controls[key];
      this.showError[key as 'email' | 'password'] = control.invalid;
    });
 
  // ⛔ Ne pas envoyer si le formulaire est invalide
  if (this.loginForm.invalid) return;
  this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

  // ✅ Si valide → envoi de la requête
  const { email, password } = this.loginForm.value;

  this.authService.login(email, password).subscribe({
    next: (res: any) => {
       this.loading = false;
       this.successMessage = 'Connexion réussie ! 🎉';
      console.log('✅ Login réussi :', res);
      localStorage.setItem('user', JSON.stringify(res.user));
      localStorage.setItem('token', res.token);

      setTimeout(() => {
          if (res.user.role === 'prestataire') {
            this.router.navigate(['/explore']);
          } else {
            this.router.navigate(['/my-services']);
          }
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error.message || ' Vérifiez vos identifiants.';
      }
    });
  }
}


