import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { StockLocation } from '@shared/enums/pharmacy/stock-location.enum';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { AdministerDialogData } from '../../interfaces/dialog-data.interface';
import { newIdempotencyKey } from '@core/interceptors/http-context';
import { EntitySelect } from '@shared/components/entity-select/entity-select.component';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { SelectField } from '@shared/components/select-field/select-field.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { ColleagueRight } from '@shared/enums/pharmacy/colleague-right.enum';
import { MedicationRoute } from '@shared/enums/pharmacy/medication-route.enum';
import { EnumOption } from '@shared/interfaces/common/enum-meta.interface';
import { Dispensation } from '@shared/interfaces/pharmacy/dispensation.interface';
import { Medication } from '@shared/interfaces/pharmacy/medication.interface';
import { DispensationApi } from '@shared/services/pharmacy/dispensation-api.service';
import { formatQty } from '@shared/utils/quantity';
import { AppValidators } from '@shared/utils/validators';

type GivenGroup = FormGroup<{
  medicationId: FormControl<string | null>;
  quantity: FormControl<string | null>;
  route: FormControl<MedicationRoute>;
  dose: FormControl<string | null>;
}>;

/**
 * Medicines given during the session (injection, infusion, dressing): taken from stock first expiry first, charged on
 * the patient's invoice. A controlled drug is witnessed by a colleague.
 */
@Component({
  selector: 'app-administer-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonToggleModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    ReactiveFormsModule,
    GenericForm,
    EntitySelect,
    SelectField,
    TextField,
  ],
  templateUrl: './administer-dialog.component.html',
})
export class AdministerDialog implements OnInit {
  protected readonly data = inject<AdministerDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<AdministerDialog, Dispensation>);
  private readonly api = inject(DispensationApi);
  private readonly key = newIdempotencyKey();

  protected readonly witnesses = signal<EnumOption[]>([]);
  /** Picked medicine per line (to know the unit and whether it is controlled). */
  protected readonly picked = signal<(Medication | null)[]>([null]);
  protected readonly controlled = computed(() => this.picked().some((m) => m?.isControlled));
  protected readonly medicationName = (m: Medication): string => m.name;
  protected readonly medicationDetail = (m: Medication): string =>
    `${m.stockOnHand === null ? '' : formatQty(m.stockOnHand) + ' in stock'}${m.isControlled ? ' · controlled' : ''}`;

  protected readonly places = StockLocation;
  protected readonly items = new FormArray<GivenGroup>([this.line()]);
  protected readonly form = new FormGroup({
    items: this.items,
    witnessId: new FormControl<string | null>(null),
    notes: new FormControl<string | null>(null, [Validators.maxLength(500)]),
    /** The treatment room's ward stock, or collected from the pharmacy. */
    from: new FormControl<StockLocation>(StockLocation.TreatmentRoom, { nonNullable: true }),
  });

  constructor() {
    this.form.controls.witnessId.addValidators(AppValidators.requiredIf(() => this.controlled()));
  }

  async ngOnInit(): Promise<void> {
    const people = await firstValueFrom(this.api.colleagues(ColleagueRight.Administer)).catch(
      () => [],
    );
    this.witnesses.set(people.map((p) => ({ value: p.id, label: p.fullName })));
  }

  protected pick(index: number, medication: Medication | null): void {
    this.picked.update((list) => list.map((m, i) => (i === index ? medication : m)));
    this.form.controls.witnessId.updateValueAndValidity();
  }

  protected add(): void {
    this.items.push(this.line());
    this.picked.update((list) => [...list, null]);
  }

  protected remove(index: number): void {
    this.items.removeAt(index);
    this.picked.update((list) => list.filter((_, i) => i !== index));
    this.form.controls.witnessId.updateValueAndValidity();
  }

  protected readonly submit = async (): Promise<Dispensation> => {
    const v = this.form.getRawValue();
    const given = await firstValueFrom(
      this.api.administer(
        this.data.appointmentId,
        {
          items: v.items.map((i) => ({
            medicationId: i.medicationId as string,
            quantity: String(i.quantity),
            route: i.route,
            dose: i.dose?.trim() || null,
          })),
          witnessId: this.controlled() ? v.witnessId : null,
          notes: v.notes?.trim() || null,
          from: v.from,
        },
        this.key,
      ),
    );
    this.ref.close(given);
    return given;
  };

  private line(): GivenGroup {
    return new FormGroup({
      medicationId: new FormControl<string | null>(null, [Validators.required]),
      quantity: new FormControl<string | null>('1', [
        Validators.required,
        AppValidators.quantity,
        AppValidators.positive,
      ]),
      route: new FormControl<MedicationRoute>(MedicationRoute.Intramuscular, { nonNullable: true }),
      dose: new FormControl<string | null>(null, [Validators.maxLength(50)]),
    });
  }
}
