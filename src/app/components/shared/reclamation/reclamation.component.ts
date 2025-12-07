import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ReclamationService } from '../../../services/reclamation.service'
import { AuthService } from '../../../services/auth.service';
import { LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-reclamation',
  imports: [CommonModule, FormsModule, LottieComponent],
  templateUrl: './reclamation.component.html',
  styleUrls: ['./reclamation.component.scss']
})
export class ReclamationComponent {
  constructor(
    private router: Router,
    private reclamationService: ReclamationService,
    private authService: AuthService
  ) {}
    reclamationModel = {
    sujet: '',
    description: ''
  };
  
lottieOptions = {
  path: 'assets/animations/Chat.json', // mets ton animation ici
  autoplay: true,
  loop: true
};
  // Toast
  showToast: boolean = false;
  toastMessage: string = '';
  //loading
  loading: boolean = false;


onAnimationCreated(anim: any) {
  console.log("Lottie loaded", anim);
}
    goBack() {
    this.router.navigate(['/mes-reclamations']); 
  }
  onSubmit(form: NgForm) {
    if (form.invalid) return;

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.toastMessage = "Utilisateur non connecté !";
      this.showToast = true;
      return;
    }

    const data = { ...this.reclamationModel, userId: user._id };
    this.loading = true; // 👉 start loader
    this.reclamationService.sendReclamation(data).subscribe({
      next: (res) => {
        this.loading = false; // 👉 stop loader
        this.toastMessage = 'Votre réclamation a été envoyée 🎉';
        this.showToast = true;
        //form.reset();
      },
      error: (err) => {
         this.loading = false;
        console.error(err);
        this.toastMessage = "Erreur lors de l'envoi de la réclamation";
        this.showToast = true;
      }
    });
  }
    closeToast(redirect: boolean = false) {
    this.showToast = false;
    
    if (redirect) this.router.navigate(['/mes-reclamations']);

  }
}
