import { ApplicationConfig, provideZoneChangeDetection, isDevMode } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import {
  provideClientHydration,
  withEventReplay,
} from '@angular/platform-browser';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideServiceWorker } from '@angular/service-worker';

// Firebase imports - only for development
// import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
// import { getAuth, provideAuth } from '@angular/fire/auth';
// import { getFirestore, provideFirestore } from '@angular/fire/firestore';

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(withFetch()),
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
