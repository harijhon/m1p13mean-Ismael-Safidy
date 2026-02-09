import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MessageService, ConfirmationService } from 'primeng/api';
import { Chart, registerables } from 'chart.js';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';

import { appRoutes } from './app.routes';
import { authInterceptor } from './app/core/interceptors/auth.interceptor';

// Register Chart.js components globally
Chart.register(...registerables);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    MessageService,
    ConfirmationService,
    providePrimeNG({ 
        theme: { 
            preset: Aura, 
            options: { 
                darkModeSelector: '.app-dark',
                // cssLayer: {
                //     name: 'primeng',
                //     order: 'tailwind-base, primeng, tailwind-utilities'
                // }
            } 
        } 
    })
  ]
};