import { formatDate } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { PortalActions } from '@services/portal/portal-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { Facts } from '@components/common/facts/facts.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { CLINIC_INFO } from '@constants/clinic-info.constants';
import { CLINIC_LOCALE, DATE_FORMAT, PORTAL_PATH } from '@constants/app.constants';
import { Patient } from '@interfaces/clinic/patient.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { PortalApi } from '@services/portal/portal-api.service';

const day = (iso: string): string => formatDate(`${iso}T00:00:00`, DATE_FORMAT, CLINIC_LOCALE);

/**
 * `/portal/profile` — the patient's file as the clinic holds it. Contact details and the emergency contact can be
 * changed here; name, ID and insurance are changed at the front desk (they need documents).
 */
@Component({
  selector: 'app-my-profile-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, MatButtonModule, MatIconModule, AppButton, Facts, Skeleton],
  templateUrl: './profile.page.html',
})
export class MyProfilePage {
  private readonly api = inject(PortalApi);
  private readonly actions = inject(PortalActions);

  protected readonly securityPath = `${PORTAL_PATH}/security`;
  protected readonly clinicPhone = CLINIC_INFO.phone;
  protected readonly patient = signal<Patient | null>(null);

  protected readonly personal = computed<Fact[]>(() => {
    const p = this.patient();
    if (!p) return [];
    return [
      { label: 'Patient number', value: p.code, mono: true },
      { label: 'Name', value: p.fullName },
      { label: 'Date of birth', value: day(p.dateOfBirth) },
      { label: 'Gender', value: p.gender, enum: 'Gender' },
      {
        label: 'Nationality',
        value: p.person.nationality?.nationality,
        flag: p.person.nationalityCode,
      },
      { label: 'ID number', value: p.person.nationalId, mono: true },
    ];
  });
  protected readonly contact = computed<Fact[]>(() => {
    const p = this.patient();
    if (!p) return [];
    return [
      { label: 'Mobile', value: p.phone },
      { label: 'Email', value: p.email },
      { label: 'Address', value: p.person.address?.formatted },
      {
        label: 'Emergency contact',
        value: [p.emergencyContactName, p.emergencyContactRelation, p.emergencyContactPhone]
          .filter(Boolean)
          .join(' · '),
      },
    ];
  });
  protected readonly insurance = computed<Fact[]>(() => {
    const p = this.patient();
    if (!p?.insurer) return [];
    return [
      { label: 'Insurer', value: p.insurer.name },
      { label: 'Policy number', value: p.insurancePolicyNumber, mono: true },
      {
        label: 'Covers',
        value: p.insuranceCoveragePercent ? `${+p.insuranceCoveragePercent} %` : null,
      },
      { label: 'Valid until', value: p.insuranceExpiryDate ? day(p.insuranceExpiryDate) : null },
    ];
  });

  constructor() {
    firstValueFrom(this.api.profile())
      .then((p) => this.patient.set(p))
      .catch(() => undefined);
  }

  protected readonly edit = async (): Promise<void> => {
    const p = this.patient();
    const saved = p ? await this.actions.editProfile(p) : undefined;
    if (saved) this.patient.set(saved);
  };
}
