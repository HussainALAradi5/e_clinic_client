import { DatePipe, LowerCasePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  input,
  output,
  signal,
  untracked,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom, startWith } from 'rxjs';
import { newIdempotencyKey } from '@middlewares/interceptors/http-context';
import { AppButton } from '@components/common/app-button/app-button.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { ColleagueRight } from '@enums/pharmacy/colleague-right.enum';
import { EnumOption } from '@interfaces/common/enum-option.interface';
import { Dispensation } from '@interfaces/pharmacy/dispensation.interface';
import { Prescription } from '@interfaces/pharmacy/prescription.interface';
import { PrescriptionItem } from '@interfaces/pharmacy/prescription-item.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { QtyPipe } from '@pipes/qty.pipe';
import { DispensationApi } from '@services/pharmacy/dispensation-api.service';
import { PrescriptionApi } from '@services/pharmacy/prescription-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { compareQty, formatQty, isPositiveQty } from '@utilities/quantity';
import { AppValidators } from '@validations/validators';
import { RX_DISPENSE_PANEL_TEXT } from '@constants/pharmacy/rx-dispense-panel.constants';

/**
 * Hand-over of one prescription at the counter: what is left on each line, how much to give now (partial allowed),
 * a pack barcode check per line, the witness for controlled drugs, then Dispense — lots are taken first expiry first
 * and the patient's invoice is charged.
 */
@Component({
  selector: 'app-rx-dispense-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ReactiveFormsModule,
    AppButton,
    SelectField,
    StatusChip,
    TextField,
    MatCardModule,
    MatIconModule,
    DatePipe,
    EnumLabelPipe,
    QtyPipe,
    LowerCasePipe,
  ],
  host: { class: 'block' },
  templateUrl: './rx-dispense-panel.component.html',
})
export class RxDispensePanel {
  protected readonly text = RX_DISPENSE_PANEL_TEXT;

  readonly prescriptionId = input.required<string>();
  readonly dispensed = output<Dispensation>();

  private readonly prescriptions = inject(PrescriptionApi);
  private readonly api = inject(DispensationApi);
  private readonly notify = inject(NotifyService);

  protected readonly prescription = signal<Prescription | null>(null);
  protected readonly items = signal<PrescriptionItem[]>([]);
  protected readonly quantities = new FormArray<FormControl<string | null>>([]);
  protected readonly witness = new FormControl<string | null>(null);
  protected readonly notes = new FormControl<string | null>(null);
  protected readonly scan = new FormControl('', { nonNullable: true });
  protected readonly witnesses = signal<EnumOption[]>([]);
  /** Lines whose pack barcode was scanned. */
  protected readonly verified = signal<ReadonlySet<string>>(new Set());
  protected readonly dateFormat = DATE_FORMAT;
  private key = newIdempotencyKey();

  private readonly values = toSignal(this.quantities.valueChanges.pipe(startWith(null)));
  /** Lines with something to hand over now. */
  private readonly giving = computed(() => {
    this.values();
    return this.items().filter((item, i) => isPositiveQty(this.quantities.at(i)?.value));
  });
  protected readonly needsWitness = computed(() =>
    this.giving().some((i) => i.medication.isControlled),
  );
  protected readonly ready = computed(() => this.giving().length > 0);

  constructor() {
    effect(() => {
      const id = this.prescriptionId();
      untracked(() => void this.load(id));
    });
    void this.loadWitnesses();
  }

  protected remaining(item: PrescriptionItem): string {
    return item.remainingQuantity ?? item.quantity;
  }

  protected done(item: PrescriptionItem): boolean {
    return compareQty(this.remaining(item), '0') <= 0;
  }

  /** A scanned pack: its GTIN must match a line still to hand over. */
  protected check(): void {
    const code = this.scan.value.trim();
    this.scan.setValue('');
    if (!code) return;
    const line = this.items().find((i) => i.medication.gtin === code);
    if (!line) {
      this.notify.error(RX_DISPENSE_PANEL_TEXT.thisPackIsNotOn);
      return;
    }
    this.verified.update((set) => new Set([...set, line.id]));
    this.notify.success(`${line.medication.name} checked.`);
  }

  protected readonly dispense = async (): Promise<void> => {
    if (this.quantities.invalid) {
      this.quantities.markAllAsTouched();
      throw new Error(RX_DISPENSE_PANEL_TEXT.checkTheQuantities);
    }
    if (this.needsWitness() && !this.witness.value) {
      this.witness.markAsTouched();
      throw new Error(RX_DISPENSE_PANEL_TEXT.aControlledDrugNeedsA);
    }
    const rx = this.prescription() as Prescription;
    const lines = this.items()
      .map((item, i) => ({ item, quantity: this.quantities.at(i).value }))
      .filter(({ quantity }) => isPositiveQty(quantity));
    const result = await firstValueFrom(
      this.api.dispense(
        {
          patientId: rx.patientId,
          prescriptionId: rx.id,
          items: lines.map(({ item, quantity }) => ({
            prescriptionItemId: item.id,
            medicationId: item.medicationId,
            quantity: String(quantity),
          })),
          witnessId: this.needsWitness() ? this.witness.value : null,
          notes: this.notes.value?.trim() || null,
        },
        this.key,
      ),
    );
    this.key = newIdempotencyKey();
    this.dispensed.emit(result);
    await this.load(rx.id);
  };

  private async load(id: string): Promise<void> {
    const rx = await firstValueFrom(this.prescriptions.get(id)).catch(() => null);
    const items = rx?.items ?? [];
    this.quantities.clear();
    for (const item of items) {
      const left = this.remaining(item);
      this.quantities.push(
        new FormControl<string | null>(this.done(item) ? null : formatQty(left), [
          AppValidators.quantity,
          AppValidators.maxQuantity(() => left),
        ]),
      );
    }
    this.verified.set(new Set());
    this.witness.reset();
    this.notes.reset();
    this.items.set(items);
    this.prescription.set(rx);
  }

  private async loadWitnesses(): Promise<void> {
    const people = await firstValueFrom(this.api.colleagues(ColleagueRight.Dispense)).catch(
      () => [],
    );
    this.witnesses.set(people.map((p) => ({ value: p.id, label: p.fullName })));
  }
}
