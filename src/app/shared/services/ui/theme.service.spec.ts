import { TestBed } from '@angular/core/testing';
import { ThemeMode } from '@shared/enums/ui/theme.enum';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => localStorage.clear());

  it('starts light and toggles between light and dark only', () => {
    const theme = TestBed.inject(ThemeService);
    expect(theme.mode()).toBe(ThemeMode.Light);

    theme.toggle();
    TestBed.tick();
    expect(theme.mode()).toBe(ThemeMode.Dark);
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
    expect(JSON.parse(localStorage.getItem('ec.ui') ?? '{}').mode).toBe('dark');

    theme.toggle();
    TestBed.tick();
    expect(theme.mode()).toBe(ThemeMode.Light);
  });

  it('treats an old "system" choice as light', () => {
    localStorage.setItem('ec.ui', JSON.stringify({ mode: 'system' }));
    const theme = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(theme.mode()).toBe(ThemeMode.Light);
  });
});
