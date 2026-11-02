import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom, startWith } from 'rxjs';
import { OrderFormDialogData } from '@interfaces/clinic/order-form-dialog-data.interface';
import { newIdempotencyKey } from '@middlewares/interceptors/http-context';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { ServiceCategory } from '@enums/billing/service-category.enum';
import { ClinicalOrderType } from '@enums/clinic/clinical-order-type.enum';
import { TreatmentPriority } from '@enums/clinic/treatment-priority.enum';
import { CompanyType } from '@enums/reference/company-type.enum';
import { BillableService } from '@interfaces/billing/billable-service.interface';
import { ClinicalOrder } from '@interfaces/clinic/clinical-order.interface';
import { Doctor } from '@interfaces/clinic/doctor.interface';
import { Specialty } from '@interfaces/clinic/specialty.interface';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { Company } from '@interfaces/reference/company.interface';
import { ClinicalOrderApi } from '@services/clinic/clinical-order-api.service';
import { ReferralTarget } from '@interfaces/clinic/order-form-dialog.interface';

/**
 * Order imaging, a lab test or an ECG (billed service of the matching kind), or write a referral to a doctor, a
 * specialty or an outside hospital.
 */
@Component({
  selector: 'app-order-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonToggleModule,
    ReactiveFormsModule,
    GenericForm,
    SelectField,
    TextField,
    EntitySelect,
  ],
  templateUrl: './order-form-dialog.component.html',
})
export class OrderFormDialog {
  protected readonly data = inject<OrderFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<OrderFormDialog, ClinicalOrder>);
  private readonly api = inject(ClinicalOrderApi);
  private readonly key = newIdempotencyKey();

  protected readonly form = new FormGroup({
    type: new FormControl<ClinicalOrderType>(ClinicalOrderType.Xray, { nonNullable: true }),
    billableServiceId: new FormControl<string | null>(null),
    bodyPart: new FormControl<string | null>(null, [Validators.maxLength(100)]),
    target: new FormControl<ReferralTarget>('specialty', { nonNullable: true }),
    referredToDoctorId: new FormControl<string | null>(null),
    referredToSpecialtyId: new FormControl<string | null>(null),
    referredToCompanyId: new FormControl<string | null>(null),
    clinicalNotes: new FormControl<string | null>(null, [Validators.maxLength(5000)]),
    priority: new FormControl<TreatmentPriority>(TreatmentPriority.Medium, { nonNullable: true }),
  });
  protected readonly type = toSignal(
    this.form.controls.type.valueChanges.pipe(startWith(this.form.controls.type.value)),
    { requireSync: true },
  );
  protected readonly target = toSignal(
    this.form.controls.target.valueChanges.pipe(startWith(this.form.controls.target.value)),
    { requireSync: true },
  );
  protected readonly referral = computed(() => this.type() === ClinicalOrderType.Referral);
  protected readonly services = computed<FilterGroup>(() => ({
    and: [
      {
        category: {
          eq:
            this.type() === ClinicalOrderType.LabTest
              ? ServiceCategory.Laboratory
              : ServiceCategory.Radiology,
        },
      },
    ],
  }));
  protected readonly hospitals: FilterGroup = { and: [{ type: { eq: CompanyType.Hospital } }] };
  protected readonly serviceName = (s: BillableService): string => `${s.code} · ${s.name}`;
  protected readonly doctorName = (d: Doctor): string =>
    `${d.displayName} · ${d.specialty?.name ?? ''}`;
  protected readonly specialtyName = (s: Specialty): string => s.name;
  protected readonly companyName = (c: Company): string => c.name;

  constructor() {
    // A different kind of order needs a different service; the referral target follows the chosen kind.
    this.form.controls.type.valueChanges.subscribe(() =>
      this.form.controls.billableServiceId.setValue(null),
    );
  }

  protected readonly submit = async (): Promise<ClinicalOrder> => {
    const v = this.form.getRawValue();
    const referral = v.type === ClinicalOrderType.Referral;
    const saved = await firstValueFrom(
      this.api.order(
        {
          type: v.type,
          patientId: this.data.patient.id,
          appointmentId: this.data.appointmentId ?? null,
          treatmentId: this.data.treatmentId ?? null,
          billableServiceId: referral ? null : v.billableServiceId,
          bodyPart: referral ? null : v.bodyPart?.trim() || null,
          referredToDoctorId: referral && v.target === 'doctor' ? v.referredToDoctorId : null,
          referredToSpecialtyId:
            referral && v.target === 'specialty' ? v.referredToSpecialtyId : null,
          referredToCompanyId: referral && v.target === 'company' ? v.referredToCompanyId : null,
          clinicalNotes: v.clinicalNotes?.trim() || null,
          priority: v.priority,
        },
        this.key,
      ),
    );
    this.ref.close(saved);
    return saved;
  };
}
