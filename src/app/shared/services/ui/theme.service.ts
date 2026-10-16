import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '@shared/constants/app.constants';
import { Density, ThemeMode } from '@shared/enums/ui/theme.enum';

/**
 * Light or dark (the user's choice, light by default) and density, stored per browser (no PHI). Writes data-theme
 * so Tailwind `dark:` utilities and Material's colour scheme follow the same choice.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly stored = this.read();

  readonly mode = signal<ThemeMode>(
    this.stored.mode === ThemeMode.Dark ? ThemeMode.Dark : ThemeMode.Light,
  );
  readonly density = signal<Density>(this.stored.density ?? Density.Compact);
  readonly dark = computed(() => this.mode() === ThemeMode.Dark);

  constructor() {
    effect(() => {
      const root = this.document.documentElement;
      root.setAttribute('data-theme', this.mode());
      root.setAttribute('data-density', this.density());
      this.write({ mode: this.mode(), density: this.density() });
    });
  }

  toggle(): void {
    this.mode.set(this.dark() ? ThemeMode.Light : ThemeMode.Dark);
  }

  private read(): { mode?: string; density?: Density } {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.uiSettings) ?? '{}') as {
        mode?: string;
        density?: Density;
      };
    } catch {
      return {};
    }
  }

  private write(value: { mode: ThemeMode; density: Density }): void {
    try {
      localStorage.setItem(STORAGE_KEYS.uiSettings, JSON.stringify(value));
    } catch {
      /* storage unavailable */
    }
  }
}
