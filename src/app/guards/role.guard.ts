import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
  UrlTree
} from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate {
  constructor(private auth: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean | UrlTree {
    const allowedRoles: string[] | undefined = route.data['roles'];

    // Si pas connecté -> redirection vers login
    if (!this.auth.isLoggedIn()) {
      return this.router.createUrlTree(['/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    const userRole = this.auth.getUserRole();

    // Si aucune restriction -> autoriser
    if (!allowedRoles || allowedRoles.length === 0) {
      return true;
    }

    // Si rôle autorisé -> autoriser
    if (userRole && allowedRoles.includes(userRole)) {
      return true;
    }

    // Sinon : rediriger vers la page "Unauthorized"
    return this.router.createUrlTree(['/unauthorized']);
  }
}