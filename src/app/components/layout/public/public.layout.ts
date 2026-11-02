import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BrandMark } from '@components/common/brand-mark/brand-mark.component';
import { LOGIN_PATH } from '@constants/app.constants';
import { CLINIC_INFO } from '@constants/clinic-info.constants';
import { AuthStore } from '@services/auth/auth.store';
import { ThemeService } from '@services/ui/theme.service';

/** Public website frame (no sign-in): navbar, page, footer. Signed-in users get a link back to their workspace or portal. */
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
  protected readonly tel = 'tel:' + CLINIC_INFO.phone.replaceAll(' ', '');
  protected readonly year = new Date().getFullYear();
  protected readonly links = [
    { label: 'Services', fragment: 'services' },
    { label: 'Your visit', fragment: 'visit' },
    { label: 'Contact', fragment: 'contact' },
  ];

  protected readonly scrolled = signal(false);
  protected readonly dark = this.theme.dark;

  protected onScroll(): void {
    this.scrolled.set(window.scrollY > 8);
  }

  protected toggleTheme(): void {
    this.theme.toggle();
  }
}
