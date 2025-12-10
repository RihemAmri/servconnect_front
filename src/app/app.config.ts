import { ApplicationConfig, provideZoneChangeDetection, LOCALE_ID } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { routes } from './app.routes';

import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';

import {  withInterceptors } from '@angular/common/http';
import { authInterceptor } from '../../src/app/interceptors/auth.interceptor';

registerLocaleData(localeFr); 

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideAnimations(), // ✅ il faut les parenthèses ici
    provideLottieOptions({
      player: () => player // Fournit le player Lottie
    }),

    providePrimeNG({
            theme: {
                preset: Aura
            }
    }),
    provideHttpClient(
      withInterceptors([authInterceptor]) // Liste d'intercepteurs
    ),
    { provide: LOCALE_ID, useValue: 'fr' }
  ]
};
