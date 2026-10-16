import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BrandMark } from '@shared/components/brand-mark/brand-mark.component';
import { HOME_PATH, LOGIN_PATH } from '@shared/constants/app.constants';
import { CLINIC_INFO } from '@shared/constants/clinic-info.constants';
import { ThemeMode } from '@shared/enums/ui/theme.enum';
import { AuthStore } from '@shared/services/auth/auth.store';
import { ThemeService } from '@shared/services/ui/theme.service';

/** Public website frame (no sign-in): navbar, page, footer. Signed-in staff get a link back to their workspace. */
@Component({
  selector: 'app-public-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, MatIconModule, MatMenuModule, BrandMark],
  host: {
    class: 'flex min-h-dvh flex-col',
    '(window:scroll)': 'onScroll()',
  },
  templateUrl: './public.layout.html',
  styleUrl: './public.layout.scss',
})
export class PublicLayout {
  protected readonly auth = inject(AuthStore);
  private readonly theme = inject(ThemeService);

  protected readonly clinic = CLINIC_INFO;
  protected readonly loginPath = LOGIN_PATH;
  protected readonly workspacePath = HOME_PATH;
  protected readonly tel = 'tel:' + CLINIC_INFO.phone.replaceAll(' ', '');
  protected readonly year = new Date().getFullYear();
  protected readonly links = [
    { label: 'Services', fragment: 'services' },
    { label: 'Your visit', fragment: 'visit' },
    { label: 'Contact', fragment: 'contact' },
  ];

  protected readonly scrolled = signal(false);
  protected readonly dark = computed(() => this.theme.resolved() === ThemeMode.Dark);

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  protected toggleTheme(): void {
    this.theme.mode.set(this.dark() ? ThemeMode.Light : ThemeMode.Dark);
  }
}
