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
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';

export const routes: Routes = [
  { path: '', component: HomepageComponent }, // public
  { path: 'footer', component: FooterComponent }, // public
  { path: 'unauthorized', loadComponent: () => import('./components/shared/unauthorized/unauthorized.component').then(m => m.UnauthorizedComponent) },

  // provider routes (seuls les providers peuvent y accéder)
  {
    path: 'my-services',
    component: MyservicesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['provider'] }
  },
  {
    path: 'add-service',
    component: AddservicesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['provider'] }
  },
  {
    path: 'upcoming-services',
    component: UpcomingServicesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['provider'] }
  },
  {
    path: 'past-services',
    component: PastServicesComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['provider'] }
  },
  {
    path: 'manage-bookings',
    component: GestionbookComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['provider'] }
  },

  // client routes (seuls les clients peuvent y accéder)
  {
    path: 'explore',
    component: ExploreComponent,
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
    path: 'paiement',
    component: PaiementComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['client'] }
  },

  // admin routes (seul admin)
  {
    path: 'admin',
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin'] },
    children: [
      {
        path: 'users',
        loadComponent: () =>
          import('./components/admin/users-list/users-list.component').then(
            (m) => m.UsersListComponent
          )
      },
      {
        path: 'users/:id',
        loadComponent: () =>
          import('./components/admin/user-details/user-details.component').then(
            (m) => m.UserDetailsComponent
          )
      },
      {
        path: 'providers',
        loadComponent: () =>
          import('./components/admin/providers-list/providers-list.component').then(
            (m) => m.ProvidersListComponent
          )
      },
      {
        path: 'providers/:id',
        loadComponent: () =>
          import('./components/admin/provider-details/provider-details.component').then(
            (m) => m.ProviderDetailsComponent
          )
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('./components/admin/reservations-list/reservations-list.component').then(
            (m) => m.ReservationsListComponent
          )
      },
      {
        path: 'reservations/:id',
        loadComponent: () =>
          import('./components/admin/reservation-details/reservation-details.component').then(
            (m) => m.ReservationDetailsComponent
          )
      }
    ]
  },

  {
    path: 'register',
    loadComponent: () =>
      import('./components/auth/register/register.component').then(
        (m) => m.RegisterComponent
      )
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./components/auth/login/login.component').then(
        (m) => m.LoginComponent
      )
  },

  { path: '**', redirectTo: '' }
];