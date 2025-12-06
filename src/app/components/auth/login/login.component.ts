import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { Router } from '@angular/router';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-login',
  standalone: true,
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  imports: [
    CommonModule,
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

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', Validators.required],
    });

    // ✅ Vérifie si l'utilisateur est déjà connecté
    this.authService.autoLogin();
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  onFocus(field: 'email' | 'password') {
    this.showError[field] = false;
  }

  onLogin() {
    this.loginForm.markAllAsTouched();

    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.controls[key];
      this.showError[key as 'email' | 'password'] = control.invalid;
    });

    if (this.loginForm.invalid) return;

    this.loading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res: any) => {
        this.loading = false;
        this.successMessage = 'Connexion réussie ! 🎉';
        console.log('✅ Login réussi :', res);

        // Déjà sauvegardé dans AuthService
        this.authService['authStatus'].next(true);

        setTimeout(() => {
          if (res.user.role === 'prestataire') {
            this.router.navigate(['/my-services']);
          } else if (res.user.role === 'client') {
            this.router.navigate(['/explore']);
          }
          else {
            this.router.navigate(['/']);
          }
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Vérifiez vos identifiants.';
      }
    });
  }
}
