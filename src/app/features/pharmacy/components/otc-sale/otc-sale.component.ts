import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  output,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom, startWith } from 'rxjs';
import { newIdempotencyKey } from '@core/interceptors/http-context';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { EntitySelect } from '@shared/components/entity-select/entity-select.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { Patient } from '@shared/interfaces/clinic/patient.interface';
import { FilterGroup } from '@shared/interfaces/list/list-query.interface';
import { Dispensation } from '@shared/interfaces/pharmacy/dispensation.interface';
import { Medication } from '@shared/interfaces/pharmacy/medication.interface';
import { DispensationApi } from '@shared/services/pharmacy/dispensation-api.service';
import { MedicationApi } from '@shared/services/pharmacy/medication-api.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { divideHalfUp, formatAmount, toMinor, toScaled } from '@shared/utils/money';
import { formatQty } from '@shared/utils/quantity';
import { AppValidators } from '@shared/utils/validators';

type SaleLine = FormGroup<{
  medicationId: FormControl<string | null>;
  quantity: FormControl<string | null>;
}>;

/**
 * Over-the-counter sale: a patient, medicines that need no prescription (scan the pack or pick it) and quantities.
 * Charged on the patient's invoice like every hand-over.
 */
@Component({
  selector: 'app-otc-sale',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AppButton,
    EntitySelect,
    TextField,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
  ],
  host: { class: 'block' },
  templateUrl: './otc-sale.component.html',
})
export class OtcSale {
  readonly dispensed = output<Dispensation>();

  private readonly api = inject(DispensationApi);
  private readonly medications = inject(MedicationApi);
  private readonly notify = inject(NotifyService);
  private key = newIdempotencyKey();

  protected readonly overTheCounter: FilterGroup = {
    and: [{ requiresPrescription: { eq: false } }],
  };
  protected readonly patientName = (p: Patient): string => p.fullName;
  protected readonly patientDetail = (p: Patient): string => `${p.code} · ${p.phone}`;
  protected readonly medicationName = (m: Medication): string => m.name;
  protected readonly medicationDetail = (m: Medication): string =>
    `${m.price ? formatAmount(m.price.amount) : ''} · ${m.stockOnHand === null ? '' : formatQty(m.stockOnHand) + ' in stock'}`;

  /** Picked medicine per line (price, initial value of scanned lines). */
  protected readonly picked = signal<(Medication | null)[]>([]);
  protected readonly lines = new FormArray<SaleLine>([]);
  protected readonly patientId = new FormControl<string | null>(null, [Validators.required]);
  protected readonly scan = new FormControl('', { nonNullable: true });

  private readonly values = toSignal(this.lines.valueChanges.pipe(startWith(null)));
  /** Σ price × quantity, exact (fils × hundredths). */
  protected readonly total = computed(() => {
    this.values();
    const sum = this.picked().reduce((acc, m, i) => {
      const price = toMinor(m?.price?.amount);
      const qty = toScaled(this.lines.at(i)?.controls.quantity.value ?? null, 2);
      return price === null || qty === null ? acc : acc + divideHalfUp(price * qty, 100n);
    }, 0n);
    return formatAmount(sum);
  });

  constructor() {
    this.add(null);
  }

  protected add(medication: Medication | null): void {
    this.lines.push(
      new FormGroup({
        medicationId: new FormControl<string | null>(medication?.id ?? null, [Validators.required]),
        quantity: new FormControl<string | null>('1', [
          Validators.required,
          AppValidators.quantity,
          AppValidators.positive,
        ]),
      }),
    );
    this.picked.update((list) => [...list, medication]);
  }

  protected remove(index: number): void {
    this.lines.removeAt(index);
    this.picked.update((list) => list.filter((_, i) => i !== index));
  }

  protected pick(index: number, medication: Medication | null): void {
    this.picked.update((list) => list.map((m, i) => (i === index ? medication : m)));
  }

  /** A scanned pack adds a line (or one more unit on its line). */
  protected async scanned(): Promise<void> {
    const code = this.scan.value.trim();
    this.scan.setValue('');
    if (!code) return;
    const medication = await firstValueFrom(this.medications.byBarcode(code)).catch(() => null);
    if (!medication) {
      this.notify.error('No medicine with this barcode.');
      return;
    }
    if (medication.requiresPrescription) {
      this.notify.error(`${medication.name} needs a prescription.`);
      return;
    }
    const index = this.lines.controls.findIndex(
      (l) => l.controls.medicationId.value === medication.id,
    );
    if (index >= 0) {
      const quantity = this.lines.at(index).controls.quantity;
      quantity.setValue(String((Number(quantity.value) || 0) + 1));
      return;
    }
    const empty = this.lines.controls.findIndex((l) => !l.controls.medicationId.value);
    if (empty >= 0) this.remove(empty);
    this.add(medication);
  }

  protected readonly sell = async (): Promise<void> => {
    if (this.patientId.invalid || this.lines.invalid) {
      this.patientId.markAsTouched();
      this.lines.markAllAsTouched();
      throw new Error('Pick the patient and the medicines.');
    }
    const result = await firstValueFrom(
      this.api.dispense(
        {
          patientId: this.patientId.value as string,
          items: this.lines
            .getRawValue()
            .map((l) => ({ medicationId: l.medicationId as string, quantity: String(l.quantity) })),
          notes: 'Over the counter',
        },
        this.key,
      ),
    );
    this.key = newIdempotencyKey();
    this.lines.clear();
    this.picked.set([]);
    this.add(null);
    this.dispensed.emit(result);
  };
}
