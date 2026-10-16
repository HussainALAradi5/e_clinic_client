import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BrandMark } from '@shared/components/brand-mark/brand-mark.component';
import { CLINIC_INFO } from '@shared/constants/clinic-info.constants';

/** Sign-in / password pages: brand panel on the left (desktop), form on the right, always a way back to the website. */
@Component({
  selector: 'app-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, MatIconModule, BrandMark],
  templateUrl: './auth.layout.html',
  styleUrl: './auth.layout.scss',
})
export class AuthLayout {
  protected readonly clinic = CLINIC_INFO;
  protected readonly grid = [0, 1, 2, 3, 4, 5, 6, 7];
}
