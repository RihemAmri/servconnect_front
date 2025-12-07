import { Component, OnInit } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { ReclamationService } from '../../../services/reclamation.service';
import { FormsModule, NgForm } from '@angular/forms';
import { LottieComponent } from 'ngx-lottie';

@Component({
  selector: 'app-reclamation-details',
  imports: [CommonModule, RouterModule, FormsModule, LottieComponent],
  templateUrl: './reclamation-details.component.html',
  styleUrls: ['./reclamation-details.component.scss']
})
export class ReclamationDetailsComponent implements OnInit {

  reclamation: any = null;
  responseText: string = '';

  showToast: boolean = false;
  toastMessage: string = '';
  loading: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private recService: ReclamationService
  ) {}

  lottieOptions = {
    path: 'assets/animations/Email.json', 
    autoplay: true,
    loop: true
  };

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;

    this.recService.getAllReclamations().subscribe({
      next: (res: any) => {
        this.reclamation = res.find((r: any) => r._id === id);

        // Initialiser responseText
        this.responseText = this.reclamation.status === 'répondu' 
          ? (this.reclamation.reponse || 'Réponse envoyée') 
          : '';
      },
      error: (err) => console.error(err)
    });
  }

  sendResponse(form: NgForm) {
    if (!this.reclamation || form.invalid) return;
    this.loading = true;  //  AFFICHER LE LOADER
    const payload = {
      reponse: this.responseText,
      status: 'répondu'
    };

    this.recService.respondReclamation(this.reclamation._id, payload).subscribe({
      next: (res) => {
        this.loading = false;  // CACHER LE LOADER
        this.reclamation.status = res.reclamation.status;
        this.reclamation.reponse = res.reclamation.reponse;
        this.responseText = res.reclamation.reponse || 'Réponse envoyée';

        this.toastMessage = 'Réponse envoyée !';
        this.showToast = true;

        // redirection après 2 secondes
        /*setTimeout(() => {
          this.showToast = false;
          this.router.navigate(['admin/reclamations']);
        }, 2000);*/
       },
    error: (err) => {
      console.error(err);
      this.loading = false; // CACHER MÊME EN CAS D’ERREUR
      this.toastMessage = "Erreur lors de l’envoi.";
      this.showToast = true;
    }
  });
  }

closeToast(redirect: boolean) {
  this.showToast = false;
  if (redirect) {
    this.router.navigate(['admin/reclamations']);
  }
}

  
  onAnimationCreated(anim: any) {
    console.log("Lottie loaded", anim);
  }

  goBack() {
    this.router.navigate(['admin/reclamations']); 
  }
}
