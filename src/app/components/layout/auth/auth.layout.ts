import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink, RouterOutlet } from '@angular/router';
import { BrandMark } from '@components/common/brand-mark/brand-mark.component';
import { BrandSurface } from '@components/common/hub/brand-surface.component';
import { CLINIC_INFO } from '@constants/clinic-info.constants';
import { Highlight } from '@interfaces/ui/highlight.interface';

/** Sign-in / password pages: brand panel on the left (desktop), form on the right, always a way back to the website. */
@Component({
  selector: 'app-auth-layout',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, MatIconModule, BrandMark, BrandSurface],
  templateUrl: './auth.layout.html',
  styleUrl: './auth.layout.scss',
})
export class AuthLayout {
  protected readonly clinic = CLINIC_INFO;
  /** What a signed-in patient or doctor sees: a glimpse of the product beside the form. */
  protected readonly highlights: Highlight[] = [
    {
      icon: 'event_available',
      title: 'Next visit today at 10:30',
      detail: 'Dr. Omar Khalil, family medicine',
    },
    { icon: 'labs', title: 'Lab results released', detail: 'Full blood count and lipid profile' },
    {
      icon: 'medication',
      title: 'Prescription ready',
      detail: 'Show the QR code at the counter',
    },
  ];
}
