import { computed, DOCUMENT, effect, inject, Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '@shared/constants/app.constants';
import { Density, ThemeMode } from '@shared/enums/ui/theme.enum';

/**
 * Light / dark / system and density, stored per browser (no PHI). Always writes a resolved data-theme
 * so Tailwind `dark:` utilities follow Material's colour scheme.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly media = this.document.defaultView?.matchMedia('(prefers-color-scheme: dark)');

  readonly mode = signal<ThemeMode>(this.read().mode ?? ThemeMode.System);
  readonly density = signal<Density>(this.read().density ?? Density.Compact);
  private readonly systemDark = signal(this.media?.matches ?? false);
  /** The scheme actually shown (System resolved to Light or Dark). */
  readonly resolved = computed(() => {
    const mode = this.mode();
    return mode === ThemeMode.System
      ? this.systemDark()
        ? ThemeMode.Dark
        : ThemeMode.Light
      : mode;
  });

  constructor() {
    this.media?.addEventListener('change', (e) => this.systemDark.set(e.matches));

    effect(() => {
      const root = this.document.documentElement;
      root.setAttribute('data-theme', this.resolved());
      root.setAttribute('data-density', this.density());
      this.write({ mode: this.mode(), density: this.density() });
    });
  }

  private read(): { mode?: ThemeMode; density?: Density } {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.uiSettings) ?? '{}') as {
        mode?: ThemeMode;
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
