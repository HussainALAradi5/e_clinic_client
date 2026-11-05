import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BrandMark } from '@components/common/brand-mark/brand-mark.component';
import { BrandSurface } from '@components/common/hub/brand-surface.component';
import { CLINIC_INFO } from '@constants/clinic-info.constants';
import { Highlight } from '@interfaces/ui/highlight.interface';
import { AUTH_TEXT } from '@constants/layout/auth.constants';

/** Sign-in / password pages: brand panel on the left (desktop), form on the right, always a way back to the website. */
@Component({
  selector: 'app-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, MatIconModule, BrandMark, BrandSurface],
  templateUrl: './auth.layout.html',
  styleUrl: './auth.layout.scss',
})
export class AuthLayout {
  protected readonly text = AUTH_TEXT;

  protected readonly clinic = CLINIC_INFO;
  /** What a signed-in patient or doctor sees: a glimpse of the product beside the form. */
  protected readonly highlights: Highlight[] = [
    {
      icon: 'event_available',
      title: AUTH_TEXT.nextVisitTodayAt10,
      detail: AUTH_TEXT.drOmarKhalilFamilyMedicine,
    },
    { icon: 'labs', title: AUTH_TEXT.labResultsReleased, detail: AUTH_TEXT.fullBloodCountAndLipid },
    {
      icon: 'medication',
      title: AUTH_TEXT.prescriptionReady,
      detail: AUTH_TEXT.showTheQrCodeAt,
    },
  ];
}
