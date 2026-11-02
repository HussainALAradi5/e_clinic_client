import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom, map, startWith } from 'rxjs';
import { InvoiceEditorDialogData } from '@interfaces/billing/dialog-data.interface';
import { invoiceAmounts, lineAmounts } from '@utilities/billing/invoice-math';
import { LineDraft } from '@interfaces/billing/invoice-math.interface';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { MoneyInput } from '@components/common/money-input/money-input.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { DiscountType } from '@enums/billing/discount-type.enum';
import { BillableService } from '@interfaces/billing/billable-service.interface';
import { Invoice, InvoiceItem, InvoiceItemPayload } from '@interfaces/billing/invoice.interface';
import { Patient } from '@interfaces/clinic/patient.interface';
import { PatientSummary } from '@interfaces/common/summary.interface';
import { MoneyPipe } from '@pipes/money.pipe';
import { InvoiceApi } from '@services/billing/invoice-api.service';
import { formatAmount, formatMoney } from '@utilities/money';
import { AppValidators } from '@validations/validators';
import { LineGroup } from '@interfaces/billing/invoice-editor-dialog.interface';

/**
 * Draft invoice lines with a live preview of the totals. Visit, session and order lines arrive by themselves when
 * the work is done; here reception adds price-list items or free-text lines and gives discounts (within the
 * user's limit, checked by the server). A new invoice for a patient with an open draft adds to that draft.
 */
@Component({
  selector: 'app-invoice-editor-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    ReactiveFormsModule,
    MoneyPipe,
    GenericForm,
    EntitySelect,
    MoneyInput,
    TextField,
  ],
  templateUrl: './invoice-editor-dialog.component.html',
})
export class InvoiceEditorDialog {
  protected readonly data = inject<InvoiceEditorDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<InvoiceEditorDialog, Invoice>);
  private readonly api = inject(InvoiceApi);

  protected readonly invoice = this.data.invoice;
  protected readonly patient = signal<PatientSummary | null>(
    this.invoice?.patient ?? this.data.patient ?? null,
  );
  protected readonly discountTypes = DiscountType;
  protected readonly lines = new FormArray<LineGroup>(
    (this.invoice?.items ?? []).map((item) => this.existingLine(item)),
  );
  protected readonly form = new FormGroup({
    patientId: new FormControl<string | null>(this.patient()?.id ?? null, [Validators.required]),
    notes: new FormControl(this.invoice?.notes ?? '', {
      nonNullable: true,
      validators: [Validators.maxLength(2000)],
    }),
    items: this.lines,
  });

  private readonly drafts = toSignal(
    this.lines.valueChanges.pipe(
      startWith(null),
      map(() => this.lines.getRawValue() as LineDraft[]),
    ),
    { requireSync: true },
  );
  protected readonly totals = computed(() => invoiceAmounts(this.drafts()));
  protected readonly lineTotals = computed(() =>
    this.drafts().map((line) => {
      const amounts = lineAmounts(line);
      return amounts ? formatAmount(amounts.total) : '—';
    }),
  );

  protected readonly patientName = (p: Patient): string => p.fullName;
  protected readonly patientDetail = (p: Patient): string => `${p.code} · ${p.phone}`;
  protected readonly serviceName = (s: BillableService): string => `${s.code} · ${s.name}`;
  protected readonly serviceDetail = (s: BillableService): string => formatMoney(s.price);

  constructor() {
    if (!this.lines.length) this.addService();
  }

  protected pickPatient(patient: Patient | null): void {
    this.patient.set(
      patient
        ? { id: patient.id, code: patient.code, fullName: patient.fullName, phone: patient.phone }
        : null,
    );
  }

  protected addService(): void {
    this.lines.push(this.line({ kind: 'service' }));
  }

  protected addCustom(): void {
    this.lines.push(this.line({ kind: 'custom' }));
  }

  protected remove(index: number): void {
    this.lines.removeAt(index);
    this.lines.markAsDirty();
  }

  /** A picked service fills the preview price and VAT; the server prices it again on save. */
  protected pickService(group: LineGroup, service: BillableService | null): void {
    group.patchValue({
      label: service ? service.name : '',
      description: service?.name ?? '',
      unitPrice: service?.price.amount ?? null,
      taxRate: service?.taxRate ?? '0',
    });
  }

  /** New service lines pick a service; kept service lines show it; free lines have none. */
  protected isService(group: LineGroup): boolean {
    const service = group.controls.billableServiceId;
    return service.enabled || service.value !== null;
  }

  protected readonly submit = async (): Promise<Invoice> => {
    const v = this.form.getRawValue();
    const items = this.lines.controls.map((group) => this.payload(group));
    const saved = await firstValueFrom(
      this.invoice
        ? this.api.update(this.invoice.id, {
            version: this.invoice.version,
            notes: v.notes.trim() || null,
            items,
          })
        : this.api.create({
            patientId: v.patientId as string,
            notes: v.notes.trim() || null,
            items,
          }),
    );
    this.ref.close(saved);
    return saved;
  };

  private payload(group: LineGroup): InvoiceItemPayload {
    const v = group.getRawValue();
    const discount = {
      discountType: v.discountType,
      discountValue: v.discountType ? v.discountValue || '0' : null,
    };
    const free = v.billableServiceId === null;
    return {
      ...(v.id ? { id: v.id } : { billableServiceId: v.billableServiceId }),
      quantity: v.quantity,
      ...(free ? { description: v.description.trim(), unitPrice: v.unitPrice } : {}),
      ...discount,
    };
  }

  private existingLine(item: InvoiceItem): LineGroup {
    const group = this.line({
      kind: item.billableServiceId ? 'service' : 'custom',
      id: item.id,
      billableServiceId: item.billableServiceId,
      label: item.description,
      source: item.source?.code ?? null,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice.amount,
      discountType: item.discountType,
      discountValue: item.discountType ? item.discountValue : null,
      taxRate: item.taxRate,
    });
    // Existing service lines keep their price snapshot and their service.
    if (item.billableServiceId) group.controls.billableServiceId.disable();
    return group;
  }

  private line(seed: {
    kind: 'service' | 'custom';
    id?: string;
    billableServiceId?: string | null;
    label?: string;
    source?: string | null;
    description?: string;
    quantity?: string;
    unitPrice?: string | null;
    discountType?: DiscountType | null;
    discountValue?: string | null;
    taxRate?: string;
  }): LineGroup {
    const service = seed.kind === 'service';
    const group: LineGroup = new FormGroup({
      id: new FormControl<string | null>(seed.id ?? null),
      billableServiceId: new FormControl<string | null>(
        seed.billableServiceId ?? null,
        service && !seed.id ? [Validators.required] : [],
      ),
      label: new FormControl(seed.label ?? '', { nonNullable: true }),
      source: new FormControl<string | null>(seed.source ?? null),
      description: new FormControl(seed.description ?? '', {
        nonNullable: true,
        validators: service ? [] : [Validators.required, Validators.maxLength(255)],
      }),
      quantity: new FormControl(seed.quantity ?? '1', {
        nonNullable: true,
        validators: [
          Validators.required,
          AppValidators.positive,
          Validators.pattern(/^\d+(\.\d{1,2})?$/),
        ],
      }),
      unitPrice: new FormControl<string | null>(
        seed.unitPrice ?? null,
        service ? [] : [Validators.required, AppValidators.money],
      ),
      discountType: new FormControl<DiscountType | null>(seed.discountType ?? null),
      discountValue: new FormControl<string | null>(seed.discountValue ?? null, [
        AppValidators.money,
      ]),
      taxRate: new FormControl(seed.taxRate ?? '0', { nonNullable: true }),
    });
    if (!service) group.controls.billableServiceId.disable();
    return group;
  }
}
