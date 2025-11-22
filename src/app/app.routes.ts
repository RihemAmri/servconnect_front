import { Routes } from '@angular/router';

import { HomepageComponent } from './components/shared/homepage/homepage.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { MyservicesComponent } from './components/provider/myservices/myservices.component';
import { AddservicesComponent } from './components/provider/addservices/addservices.component';
import { ServicedetailsComponent } from './components/client/servicedetails/servicedetails.component';
import { GestionbookComponent } from './components/provider/gestionbook/gestionbook.component';
import { ExploreComponent } from './components/client/explore/explore.component';
import { PaiementComponent } from './components/client/paiement/paiement.component';
import { ReservationComponent } from './components/client/reservation/reservation.component';
import { RegisterComponent } from './components/auth/register/register.component';
import { LoginComponent } from './components/auth/login/login.component';
import { UpcomingServicesComponent } from './components/provider/upcoming-services/upcoming-services.component';
import { PastServicesComponent } from './components/provider/past-services/past-services.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';
import { ProfileComponent } from './components/shared/profile/profile.component';

export const routes: Routes = [
  { path: '', component: HomepageComponent }, // page d’accueil
  {path: 'footer', component: FooterComponent}, // footer
  { path: 'my-services', component: MyservicesComponent },
  { path: 'upcoming-services', component: UpcomingServicesComponent },
  { path: 'past-services', component: PastServicesComponent },
  { path: 'manage-bookings', component: GestionbookComponent },
  
  // 👥 Client routes
  { path: 'explore', component: ExploreComponent },
  { path: 'service/:id', component: ServicedetailsComponent }, // détail d’un service spécifique
  { path: 'reservation', component: ReservationComponent },
  { path: 'paiement', component: PaiementComponent },
 { 
  path: 'register', 
  loadComponent: () => import('./components/auth/register/register.component').then(m => m.RegisterComponent) 
},
{ path: 'login', component: LoginComponent },
{ path: 'forgot-password', component: ForgotPasswordComponent },
{ path: 'reset-password/:token', component: ResetPasswordComponent },
{path: 'profile', component: ProfileComponent},


  { path: '**', redirectTo: '' }
];