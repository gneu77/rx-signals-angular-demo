import { enableProdMode } from '@angular/core';
import { environment } from './environments/environment';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { PreloadAllModules, provideRouter, withPreloading } from '@angular/router';
import { appRoutes } from './app/app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideStore } from '@rx-signals/angular-provider';
import { setupNavigationSignals } from './app/navigation/signals/navigation.signals';
import { setupNavigationEffects } from './app/navigation/effects/navigation.effects';

if (environment.production) {
  enableProdMode();
}

bootstrapApplication(AppComponent, {
  providers: [
    provideRouter(appRoutes, withPreloading(PreloadAllModules)),
    provideHttpClient(),
    provideStore(setupNavigationSignals, setupNavigationEffects),
  ],
}).catch(err => console.error(err));
