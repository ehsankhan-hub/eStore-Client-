import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import {
  HttpInterceptorFn,
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';
import { API_BASE_URL } from './api-url';

// Firebase imports - only for development
// import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
// import { getAuth, provideAuth } from '@angular/fire/auth';
// import { getFirestore, provideFirestore } from '@angular/fire/firestore';

const ngrokBypassInterceptor: HttpInterceptorFn = (req, next) => {
  const isApiCall = req.url.startsWith(API_BASE_URL);
  const isNgrokEndpoint =
    req.url.includes('ngrok-free.dev') || API_BASE_URL.includes('ngrok-free.dev');

  if (isApiCall && isNgrokEndpoint) {
    req = req.clone({
      setHeaders: {
        'ngrok-skip-browser-warning': 'true',
      },
    });
  }

  return next(req);
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch(), withInterceptors([ngrokBypassInterceptor])),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimations(), 
    provideServiceWorker('ngsw-worker.js', {
            enabled: !isDevMode(),
            registrationStrategy: 'registerWhenStable:30000'
          }),
    // Firebase providers - temporarily disabled for production build
    // provideFirebaseApp(() => initializeApp({
    //   apiKey: "AIzaSyD3fLw8n2cYFhXJ-8kQ7m9pLqRstUvWxY",
    //   authDomain: "estore-pwa-dde6c.firebaseapp.com",
    //   projectId: "estore-pwa-dde6c",
    //   storageBucket: "estore-pwa-dde6c.appspot.com",
    //   messagingSenderId: "445821967123",
    //   appId: "1:445821967123:web:abc123def456ghi789"
    // })),
    // provideAuth(() => getAuth()),
    // provideFirestore(() => getFirestore()),
  ],
};
