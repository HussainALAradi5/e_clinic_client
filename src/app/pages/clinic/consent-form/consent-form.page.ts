import { dateTimeFormat } from '@utilities/clock-format';
import { DocumentType } from '@enums/documents/document-type.enum';
import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, OnInit, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { PrintSheet } from '@components/common/print-sheet/print-sheet.component';
import { SIGNER_RELATIONSHIPS } from '@utilities/clinic/consent';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { PatientConsent } from '@interfaces/clinic/consent.interface';
import { Patient } from '@interfaces/clinic/patient.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { ConsentApi } from '@services/clinic/consent-api.service';
import { PatientApi } from '@services/clinic/patient-api.service';
import { CONSENT_FORM_TEXT } from '@constants/clinic/consent-form.constants';

/** `/print/consent/:id` — consent form to sign on paper (or the record of a signed one) with a verification QR. */
@Component({
  selector: 'app-consent-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PrintSheet, ErrorState, EnumLabelPipe, DatePipe],
  templateUrl: './consent-form.page.html',
})
export class ConsentFormPage implements OnInit {
  protected readonly text = CONSENT_FORM_TEXT;

  protected readonly documentType = DocumentType;
  readonly id = input.required<string>();

  private readonly consents = inject(ConsentApi);
  private readonly patients = inject(PatientApi);
  protected readonly consent = signal<PatientConsent | null>(null);
  protected readonly patient = signal<Patient | null>(null);
  protected readonly error = signal<unknown>(null);
  protected readonly dateFormat = DATE_FORMAT;
  protected readonly dateTimeFormat = dateTimeFormat;

  async ngOnInit(): Promise<void> {
    try {
      const consent = await firstValueFrom(this.consents.get(this.id()));
      this.consent.set(consent);
      this.patient.set(
        await firstValueFrom(this.patients.get(consent.patientId)).catch(() => null),
      );
    } catch (error) {
      this.error.set(error);
    }
  }

  protected relationship(value: string): string {
    return SIGNER_RELATIONSHIPS.find((r) => r.value === value)?.label ?? value;
  }
}
