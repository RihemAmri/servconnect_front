import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from "./components/shared/navbar/navbar.component";
import { HomepageComponent } from "./components/shared/homepage/homepage.component";
import { FooterComponent } from "./components/shared/footer/footer.component";
import { Router } from '@angular/router';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent,FooterComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'frontend';
  // Liste des routes où le footer DOIT être masqué
  public hideFooterRoutes: string[] = ['/unauthorized', '/404', '/login', '/register', '/forgot-password', '/reset-password']; 
  public showFooter: boolean = true;

constructor(private router: Router) {}


ngOnInit(): void {
    // S'abonner aux changements de route
    this.router.events.subscribe(() => {
      // Vérifie si l'URL actuelle (après la navigation) est dans la liste des routes à masquer
      const currentPath = this.router.url.split('?')[0]; // Supprime les paramètres de requête
      this.showFooter = !this.hideFooterRoutes.includes(currentPath);
    });
  }








}
