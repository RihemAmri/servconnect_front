import {
  HttpInterceptorFn,
  HttpRequest,
  HttpHandlerFn,
} from '@angular/common/http';
import { inject, PLATFORM_ID } from '@angular/core'; // Importez inject et PLATFORM_ID
import { isPlatformBrowser } from '@angular/common'; // Importez isPlatformBrowser

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<any>,
  next: HttpHandlerFn
) => {
  // 1. Injecter PLATFORM_ID pour déterminer l'environnement
  const platformId = inject(PLATFORM_ID);
  
  // 2. Vérifier si nous sommes dans le navigateur
  if (isPlatformBrowser(platformId)) {
    const token = localStorage.getItem('token');
    
    if (token) {
      const cloned = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });
      return next(cloned);
    }
  }

  // 3. Retourner la requête non modifiée si pas de token ou si SSR
  return next(req);
};