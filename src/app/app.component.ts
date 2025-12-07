import { Component, OnInit,ChangeDetectorRef  } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/shared/navbar/navbar.component";
import { HomepageComponent } from "./components/shared/homepage/homepage.component";
import { FooterComponent } from "./components/shared/footer/footer.component";
import { Router } from '@angular/router';
import { ChatbotComponent } from './components/chatbot/chatbot.component';
import { CommonModule } from '@angular/common';
import { AuthService } from './services/auth.service'; 

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent,FooterComponent,ChatbotComponent,CommonModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
}) 
export class AppComponent {
  title = 'frontend';
  // Liste des routes où le footer DOIT être masqué
  public hideFooterRoutes: string[] = ['/unauthorized', '/404', '/login', '/register', '/forgot-password', '/reset-password']; 
  public showFooter: boolean = true;
  showChatbot: boolean = false;
  isAdmin: boolean | null = null;

constructor(private router: Router,private auth: AuthService, private cdr: ChangeDetectorRef) {
  
}

 toggleChatbot() {
    this.showChatbot = !this.showChatbot;
    console.log('showChatbot =', this.showChatbot);
  }

ngOnInit(): void {
   
      if (typeof window !== 'undefined') {
    const user = this.auth.getCurrentUser(); 
     this.isAdmin = user?.role === 'admin';
      console.log("isAdmin ?", this.isAdmin);
      this.cdr.detectChanges();
    }
 
  
    this.router.events.subscribe(() => {
      // Vérifie si l'URL actuelle (après la navigation) est dans la liste des routes à masquer
      const currentPath = this.router.url.split('?')[0]; // Supprime les paramètres de requête
      this.showFooter = !this.hideFooterRoutes.includes(currentPath);
    });
  }








}
