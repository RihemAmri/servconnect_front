import { Component } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../services/auth.service';
import { LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  imports: [CommonModule, ReactiveFormsModule, LottieComponent],
})
export class ForgotPasswordComponent {
  form;
  loading = false;
  message: string | null = null;
  error: string | null = null;

  lottieOptions = {
    path: 'assets/animations/reset-password.json',
    loop: true,
    autoplay: true,
    rendererSettings: {
      preserveAspectRatio: 'xMidYMid meet'
    }
  };

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
    });
  }

  onAnimationCreated(animation: any) {
    console.log('Lottie animation created:', animation);
  }

  onSubmit() {
    if (this.form.invalid) {
      this.error = this.form.controls['email'].hasError('required')
        ? 'Veuillez remplir le champ Email.'
        : 'Veuillez entrer un email valide.';
      this.message = null;
      return;
    }

    this.loading = true;
    const email = this.form.value.email!;

    this.auth.forgotPassword(email).subscribe({
      next: (res: any) => {
        setTimeout(() => {
          this.loading = false;
          this.message = res.message;
          this.error = null;
        }, 2000);
      },
      error: (err) => {
        setTimeout(() => {
          this.loading = false;
          this.error = err.error?.message || 'Erreur lors de l’envoi.';
          this.message = null;
        }, 2000);
      },
    });
  }
}
