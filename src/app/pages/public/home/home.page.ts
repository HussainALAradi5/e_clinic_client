import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  signal,
} from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { BrandSurface } from '@components/common/hub/brand-surface.component';
import { HubSection } from '@components/common/hub/hub-section.component';
import { HubTile } from '@components/common/hub/hub-tile.component';
import {
  CLINIC_INFO,
  CLINIC_SERVICES,
  VISIT_STEPS,
  WEEKDAYS,
} from '@constants/clinic-info.constants';
import { clinicClock, openingStatus } from '@utilities/opening-hours';
import { HOME_TEXT } from '@constants/public/home.constants';

const STATUS_REFRESH_MS = 60_000;

/** `/` — public home: who we are, live opening status, services, how a visit works, document check, contact. */
@Component({
  selector: 'app-home-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    BrandSurface,
    HubSection,
    HubTile,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
})
export class HomePage {
  private readonly router = inject(Router);

  protected readonly clinic = CLINIC_INFO;
  protected readonly services = CLINIC_SERVICES;
  protected readonly steps = VISIT_STEPS;
  protected readonly weekdays = WEEKDAYS;
  protected readonly tel = 'tel:' + CLINIC_INFO.phone.replaceAll(' ', '');
  protected readonly whatsapp = CLINIC_INFO.whatsapp
    ? 'https://wa.me/' + CLINIC_INFO.whatsapp.replace(/\D/g, '')
    : null;

  private readonly now = signal(new Date());
  protected readonly status = computed(() => openingStatus(this.clinic.hours, this.now()));
  protected readonly today = computed(() => clinicClock(this.now()).day);
  protected readonly statusText = computed(() => {
    const s = this.status();
    if (s.open) {
      return HOME_TEXT.untilToday(s.closesAt);
    }
    if (!s.nextOpen) {
      return HOME_TEXT.noOpeningHoursPublished;
    }
    const when = s.nextOpen.day === this.today() ? 'today' : this.weekdays[s.nextOpen.day];
    return HOME_TEXT.opensAt(when, s.nextOpen.time);
  });

  protected readonly code = new FormControl('', { nonNullable: true });

  constructor() {
    const timer = setInterval(() => this.now.set(new Date()), STATUS_REFRESH_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  protected verify(event: Event): void {
    event.preventDefault();
    const code = this.code.value.trim();
    void this.router.navigate(['/verify'], { queryParams: code ? { code } : {} });
  }
}
