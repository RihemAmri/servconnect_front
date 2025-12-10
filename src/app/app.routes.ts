import { Routes } from '@angular/router';

// Public & Shared Components
import { HomepageComponent } from './components/shared/homepage/homepage.component';
import { FooterComponent } from './components/shared/footer/footer.component';
import { ProfileComponent } from './components/shared/profile/profile.component';

// Provider Components
import { MyservicesComponent } from './components/provider/myservices/myservices.component';
import { UpcomingServicesComponent } from './components/provider/upcoming-services/upcoming-services.component';
import { PastServicesComponent } from './components/provider/past-services/past-services.component';
import { GestionbookComponent } from './components/provider/gestionbook/gestionbook.component';
import { ResubmitDocsComponent } from './components/provider/resubmit-docs/resubmit-docs.component';


// Client Components
import { ExploreComponent } from './components/client/explore/explore.component';
import { ProviderDetailsComponent } from './components/client/provider-details/provider-details.component';
import { ServicedetailsComponent } from './components/client/servicedetails/servicedetails.component';
import { ReservationComponent } from './components/client/reservation/reservation.component';
import { PaiementComponent } from './components/client/paiement/paiement.component';
import { MesReservationsComponent } from './components/client/mes-reservations/mes-reservations.component';

// Auth Components
import { LoginComponent } from './components/auth/login/login.component';
import { ForgotPasswordComponent } from './components/auth/forgot-password/forgot-password.component';
import { ResetPasswordComponent } from './components/auth/reset-password/reset-password.component';

// Guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  /** PUBLIC ROUTES **/
  { path: '', component: HomepageComponent },
  { path: 'footer', component: FooterComponent },

  { 
    path: 'unauthorized', 
    loadComponent: () =>
      import('./components/shared/unauthorized/unauthorized.component').then(
        m => m.UnauthorizedComponent
      ) 
  },
{ 
    path: '404', 
    loadComponent: () =>
      import('./components/shared/not-found/not-found.component').then(
        m => m.NotFoundComponent
      )
},


  /** PROVIDER ROUTES **/
  {
    path: 'my-services',
    component: MyservicesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['prestataire'] }
  },
  {
    path: 'manage-bookings/:id',
    component: GestionbookComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['prestataire'] }
  },
  {
    path: 'upcoming-services',
    component: UpcomingServicesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['prestataire'] }
  },
  {
    path: 'past-services',
    component: PastServicesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['prestataire'] }
  },
  {
    path: 'provider/my-documents',
    component:ResubmitDocsComponent ,
    canActivate: [AuthGuard],
    data: { role: 'prestataire' }
  },
  {
    path: 'provider/dashboard',
    loadComponent: () =>
      import('./components/provider/dashboard/dashboard.component').then(
        m => m.ProviderDashboardComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['prestataire'] }
  },

  /** CLIENT ROUTES **/
  {
    path: 'explore',
    component: ExploreComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['client'] }
  },
  {
    path: 'detailsProvider/:id',
    component: ProviderDetailsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['client'] }
  },
  {
    path: 'service/:id',
    component: ServicedetailsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['client'] }
  },
   {
    path: 'reservation',
    component: ReservationComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['client'] }
  },
  {
    path: 'reservation/:id',
    component: ReservationComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['client'] }
  },
  
  {
    path: 'paiement/:id',
    component: PaiementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['client'] }
  },
  {
    path: 'mes-reservations',
    component: MesReservationsComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['client'] }
  },
  {
    path: 'reservation-details/:id',
    loadComponent: () =>
      import('./components/client/reservation-details/reservation-details.component').then(
        m => m.ReservationDetailsComponent
      ),
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['client'] }
  },

  /** ADMIN ROUTES **/
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import('./components/admin/users-list/users-list.component').then(m => m.UsersListComponent)
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./components/admin/user-details/user-details.component').then(m => m.UserDetailsComponent)
      },
      {
        path: 'providers',
        loadComponent: () =>
          import('./components/admin/providers-list/providers-list.component').then(m => m.ProvidersListComponent)
      },
      {
        path: 'providers/:id',
        loadComponent: () =>
          import('./components/admin/provider-details/provider-details.component').then(m => m.ProviderDetailsComponent)
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('./components/admin/reservations-list/reservations-list.component').then(m => m.ReservationsListComponent)
      },
      {
        path: 'reservations/:id',
        loadComponent: () =>
          import('./components/admin/reservation-details/reservation-details.component').then(m => m.ReservationDetailsComponent)
      },
      {
        path: 'reclamations',
        loadComponent: () =>
          import('./components/admin/reclamations-list/reclamations-list.component')
            .then(m => m.ReclamationsListComponent)
      },
      {
        path: 'reclamations/:id',
        loadComponent: () =>
          import('./components/admin/reclamation-details/reclamation-details.component')
            .then(m => m.ReclamationDetailsComponent)
      }
    ]
  },

  /** AUTH ROUTES **/
  {
    path: 'register',
    loadComponent: () =>
      import('./components/auth/register/register.component').then(
        m => m.RegisterComponent
      )
  },
  { path: 'login', component: LoginComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'profile', component: ProfileComponent, canActivate: [AuthGuard] },

  /*reclamation */
  {
  path: 'reclamation',
  loadComponent: () =>
    import('./components/shared/reclamation/reclamation.component')
      .then(m => m.ReclamationComponent),
  canActivate: [AuthGuard] 
},
{
  path: 'mes-reclamations',
  loadComponent: () =>
    import('./components/shared/mes-reclamations/mes-reclamations.component')
      .then(m => m.MesReclamationsComponent),
  canActivate: [AuthGuard]
},

  /** DEFAULT ROUTE **/
{ path: '**', redirectTo: '/404' }

];
