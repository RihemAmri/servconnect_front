import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withFetch } from '@angular/common/http';

import { provideLottieOptions } from 'ngx-lottie';
import player from 'lottie-web';

import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideHttpClient(withFetch()),
    provideAnimations(), // ✅ il faut les parenthèses ici
    provideLottieOptions({
      player: () => player // Fournit le player Lottie
    })
  ]
};
