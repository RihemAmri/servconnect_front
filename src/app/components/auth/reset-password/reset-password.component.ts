import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, LottieComponent],
})
export class ResetPasswordComponent {
  form;
  token = '';
  passwordVisible = false;
  confirmVisible = false;

  // Messages et loader
  errorMessage: string | null = null;
  successMessage: string | null = null;
  loading = false;

  lottieOptions = {
    path: 'assets/animations/reset_password.json', 
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet'
    }
  };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private auth: AuthService,
    private router: Router
  ) {
    this.form = this.fb.group({
      motDePasse: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required],
    });

    this.token = this.route.snapshot.params['token'];

    // Supprime les messages quand l'utilisateur tape
    this.form.valueChanges.subscribe(() => {
      this.errorMessage = null;
      this.successMessage = null;
    });
  }

  onAnimationCreated(animation: any) {
    console.log('Lottie animation created:', animation);
  }

  togglePasswordVisibility(field: 'motDePasse' | 'confirm') {
    if (field === 'motDePasse') this.passwordVisible = !this.passwordVisible;
    else this.confirmVisible = !this.confirmVisible;
  }

  onSubmit() {
  if (this.form.invalid || this.form.value.motDePasse !== this.form.value.confirm) {
    this.errorMessage = this.form.invalid ? 'Veuillez remplir tous les champs.' : 'Les mots de passe ne correspondent pas.';
    return;
  }

  this.loading = true; // active le loading

  this.auth.resetPassword(this.token, this.form.value.motDePasse!).subscribe({
    next: (res: any) => {
      setTimeout(() => {
        this.loading = false; // désactive le loading après 2s
        this.successMessage = res.message;
        this.errorMessage = '';
        setTimeout(() => this.router.navigate(['/login']), 2000); // redirection
      }, 1000); // ← 2 secondes
    },
    error: (err) => {
      setTimeout(() => {
        this.loading = false; // désactive le loading après 2s
        this.errorMessage = err.error?.message || 'Erreur lors de la réinitialisation.';
        this.successMessage = '';
      }, 1000);
    },
  });
}

}
