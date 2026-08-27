import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { routes } from './app.routes';

// ✅ NO importamos AngularFire, usamos Firebase directamente
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

import { environment } from '../environments/environment';

// ✅ Inicializar Firebase UNA VEZ aquí
const app = initializeApp(environment.firebase);
export const auth = getAuth(app);
export const database = getDatabase(app);

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    // ✅ No necesitamos providers de Firebase aquí
  ]
};