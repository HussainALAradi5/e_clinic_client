import { provideHttpClient, withInterceptors } from '@angular/common/http';
import {
  ApplicationConfig,
  inject,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { MAT_FORM_FIELD_DEFAULT_OPTIONS } from '@angular/material/form-field';
import { MatIconRegistry } from '@angular/material/icon';
import {
  provideRouter,
  withComponentInputBinding,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';
import { routes } from './app.routes';
import { API_INTERCEPTORS } from '@core/interceptors/api.interceptors';
import { firstValueFrom } from 'rxjs';
import { SessionService } from '@shared/services/auth/session.service';
import { ThemeService } from '@shared/services/ui/theme.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(
      routes,
      withComponentInputBinding(),
      withInMemoryScrolling({ scrollPositionRestoration: 'top', anchorScrolling: 'enabled' }),
      // Pages cross-fade instead of jumping (skipped where the browser has no View Transitions).
      withViewTransitions(),
    ),
    provideHttpClient(withInterceptors(API_INTERCEPTORS)),
    { provide: MAT_FORM_FIELD_DEFAULT_OPTIONS, useValue: { appearance: 'outline' } },
    provideAppInitializer(() => {
      inject(MatIconRegistry).setDefaultFontSetClass('material-symbols-outlined');
      inject(ThemeService);
      // A stored token is validated (GET /auth/me) before the first route is matched.
      return firstValueFrom(inject(SessionService).restore());
    }),
  ],
};
