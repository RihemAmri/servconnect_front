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

  maxAttempts = 3;
  lockDuration = 2 * 60 * 1000; // 2 minutes
  remainingTime: number = 0;
  isLocked = false;
  timerInterval: any = null;

  // 🔥 Permet d'afficher ou cacher les erreurs des champs
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

    this.authService.autoLogin();
  }

  ngOnInit() {
    this.checkLockState();
  }

  checkLockState() {
    const lockUntil = localStorage.getItem("lockUntil");

    if (lockUntil) {
      const lockTime = parseInt(lockUntil);

      if (Date.now() < lockTime) {
        this.isLocked = true;
        this.startCountdown(lockTime - Date.now());
      } else {
        this.isLocked = false;
        localStorage.removeItem("lockUntil");
        localStorage.removeItem("loginAttempts");
      }
    }
  }

  startCountdown(duration: number) {
    this.remainingTime = Math.floor(duration / 1000);

    this.timerInterval = setInterval(() => {
      this.remainingTime--;

      if (this.remainingTime <= 0) {
        clearInterval(this.timerInterval);
        this.isLocked = false;
        localStorage.removeItem("lockUntil");
        localStorage.removeItem("loginAttempts");
      }
    }, 1000);
  }

  togglePasswordVisibility() {
    this.passwordVisible = !this.passwordVisible;
  }

  onFocus(field: 'email' | 'password') {
    this.showError[field] = false; // Efface l’erreur quand l’utilisateur clique sur l’input
  }

  onLogin() {
    if (this.isLocked) {
      this.errorMessage = `Vous devez attendre ${this.remainingTime} secondes avant une nouvelle tentative.`;
      return;
    }

    // Montre les erreurs si les champs sont invalides
    this.showError.email = true;
    this.showError.password = true;

    this.loginForm.markAllAsTouched();

    if (this.loginForm.invalid) return;

    this.loading = true;

    const { email, password } = this.loginForm.value;

    this.authService.login(email, password).subscribe({
      next: (res: any) => {
        this.loading = false;
        
         this.errorMessage = null;
    localStorage.removeItem("loginAttempts");
    localStorage.removeItem("lockUntil");

        this.successMessage = 'Connexion réussie ! 🎉';

        setTimeout(() => {
          if (res.user.role === 'prestataire') {
            this.router.navigate(['/my-services']);
          } else if (res.user.role === 'client') {
            this.router.navigate(['/explore']);
          } else if (res.user.role === 'admin') {
            window.location.href = "/admin/users";
          }
        }, 800);
      },

      error: () => {
        this.loading = false;

        let attempts = parseInt(localStorage.getItem("loginAttempts") || "0");
        attempts++;
        localStorage.setItem("loginAttempts", attempts.toString());

        if (attempts < this.maxAttempts) {
          this.errorMessage = `Identifiants incorrects. Tentative ${attempts} / 3.`;
        } else {
          this.errorMessage = `Identifiants incorrects. Tentative 3 / 3.`;

          setTimeout(() => {
            const lockUntil = Date.now() + this.lockDuration;
            localStorage.setItem("lockUntil", lockUntil.toString());
            this.isLocked = true;
            this.startCountdown(this.lockDuration);
          }, 800);
        }
      }
    });
  }

}
