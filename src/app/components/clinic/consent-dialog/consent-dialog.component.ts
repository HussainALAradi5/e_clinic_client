import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom, map, startWith } from 'rxjs';
import { ConsentDialogData } from '@interfaces/clinic/dialog-data.interface';
import {
  CONSENT_TEMPLATES,
  PATIENT_WIDE_CONSENTS,
  SIGNER_RELATIONSHIPS,
} from '@utilities/clinic/consent';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { UploadZone } from '@components/common/upload-zone/upload-zone.component';
import { AttachmentCategory } from '@enums/attachment/attachment-category.enum';
import { AppointmentType } from '@enums/clinic/appointment-type.enum';
import { ConsentType } from '@enums/clinic/consent-type.enum';
import { Attachment } from '@interfaces/attachment/attachment.interface';
import { PatientConsent } from '@interfaces/clinic/consent.interface';
import { AuthStore } from '@services/auth/auth.store';
import { ConsentApi } from '@services/clinic/consent-api.service';
import { TreatmentApi } from '@services/clinic/treatment-api.service';
import { Scope } from '@interfaces/clinic/consent-dialog.interface';

/** Under this age a parent or guardian signs (server rule). */
const ADULT_AGE = 18;

/**
 * Record a signed consent: what was explained, who signed (patient or representative), witness, validity and the
 * scanned signed form. The signer is you; the scope is the whole file or this visit / treatment / order.
 */
@Component({
  selector: 'app-consent-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatIconModule, GenericForm, SelectField, TextField, UploadZone],
  templateUrl: './consent-dialog.component.html',
})
export class ConsentDialog {
  protected readonly data = inject<ConsentDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<ConsentDialog, PatientConsent>);
  private readonly api = inject(ConsentApi);
  private readonly me = inject(AuthStore).user();

  protected readonly minor = this.data.patient.age < ADULT_AGE;
  protected readonly relationships = SIGNER_RELATIONSHIPS;
  protected readonly owner = { type: 'patient', id: this.data.patient.id };
  protected readonly formCategory = AttachmentCategory.ConsentForm;
  protected readonly witnesses = toSignal(
    inject(TreatmentApi)
      .providers(AppointmentType.TreatmentSession)
      .pipe(
        map((list) =>
          list.filter((p) => p.id !== this.me?.id).map((p) => ({ value: p.id, label: p.fullName })),
        ),
      ),
    { initialValue: [] },
  );
  protected readonly scopes = [
    { value: 'patient', label: 'The whole patient file' },
    ...(this.data.appointmentId ? [{ value: 'appointment', label: 'This visit only' }] : []),
    ...(this.data.treatmentId
      ? [{ value: 'treatment', label: 'This treatment plan (all sessions)' }]
      : []),
    ...(this.data.clinicalOrderId ? [{ value: 'clinical_order', label: 'This order' }] : []),
  ];

  private readonly type0 = this.data.type ?? ConsentType.GeneralTreatment;
  protected readonly form = new FormGroup({
    type: new FormControl<ConsentType>(this.type0, { nonNullable: true }),
    scope: new FormControl<Scope>(this.defaultScope(this.type0), { nonNullable: true }),
    description: new FormControl(CONSENT_TEMPLATES[this.type0], {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(10000)],
    }),
    signedByName: new FormControl(this.minor ? '' : this.data.patient.fullName, {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    signerRelationship: new FormControl(this.minor ? 'parent' : 'self', { nonNullable: true }),
    witnessId: new FormControl<string | null>(null),
    validUntil: new FormControl<string | null>(null),
  });
  protected readonly type = toSignal(
    this.form.controls.type.valueChanges.pipe(startWith(this.type0)),
    { requireSync: true },
  );
  protected readonly patientWide = computed(() => PATIENT_WIDE_CONSENTS.includes(this.type()));
  protected readonly signature = signal<Attachment | null>(null);

  constructor() {
    this.form.controls.type.valueChanges.subscribe((type) => {
      this.form.controls.description.setValue(CONSENT_TEMPLATES[type]);
      this.form.controls.scope.setValue(this.defaultScope(type));
    });
  }

  protected scanned(files: Attachment[]): void {
    this.signature.set(files[0] ?? null);
  }

  protected readonly submit = async (): Promise<PatientConsent> => {
    const v = this.form.getRawValue();
    const scope = this.patientWide() ? 'patient' : v.scope;
    const saved = await firstValueFrom(
      this.api.record(this.data.patient.id, {
        type: v.type,
        appointmentId: scope === 'appointment' ? this.data.appointmentId : null,
        treatmentId: scope === 'treatment' ? this.data.treatmentId : null,
        clinicalOrderId: scope === 'clinical_order' ? this.data.clinicalOrderId : null,
        description: v.description.trim(),
        signedByName: v.signedByName.trim(),
        signerRelationship: v.signerRelationship,
        explainedBy: this.me?.id ?? '',
        witnessId: v.witnessId,
        signedAt: new Date().toISOString(),
        validUntil: v.validUntil || null,
        signatureAttachmentId: this.signature()?.id ?? null,
      }),
    );
    this.ref.close(saved);
    return saved;
  };

  /** The narrowest scope offered, for consents that are not patient-wide. */
  private defaultScope(type: ConsentType): Scope {
    if (PATIENT_WIDE_CONSENTS.includes(type)) return 'patient';
    return (this.scopes.at(-1)?.value as Scope | undefined) ?? 'patient';
  }
}
