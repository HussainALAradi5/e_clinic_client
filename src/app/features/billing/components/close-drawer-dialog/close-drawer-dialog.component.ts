import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { firstValueFrom, map, startWith } from 'rxjs';
import { CloseDrawerDialogData } from '../../interfaces/dialog-data.interface';
import { BHD_DENOMINATIONS, countTotal } from '../../utils/denominations';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { MoneyInput } from '@shared/components/money-input/money-input.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { CashSession } from '@shared/interfaces/finance/cash-session.interface';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { CashSessionApi } from '@shared/services/finance/cash-session-api.service';
import { fromMinor, toMinor } from '@shared/utils/money';
import { AppValidators } from '@shared/utils/validators';

/**
 * End of shift: count the drawer note by note (or type the total), see the expected cash and the difference as
 * you count, and close. A difference above the tolerance waits for a supervisor.
 */
@Component({
  selector: 'app-close-drawer-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatSlideToggleModule,
    ReactiveFormsModule,
    GenericForm,
    MoneyInput,
    TextField,
    MoneyPipe,
  ],
  templateUrl: './close-drawer-dialog.component.html',
})
export class CloseDrawerDialog {
  protected readonly data = inject<CloseDrawerDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<CloseDrawerDialog, CashSession>);
  private readonly api = inject(CashSessionApi);

  protected readonly session = this.data.session;
  protected readonly expected = this.session.report?.expected.amount ?? '0.000';
  protected readonly notes = BHD_DENOMINATIONS;
  protected readonly counts = new FormArray(
    BHD_DENOMINATIONS.map(
      () => new FormControl<number | null>(null, [Validators.min(0), Validators.max(100000)]),
    ),
  );
  protected readonly form = new FormGroup({
    byNote: new FormControl(true, { nonNullable: true }),
    counts: this.counts,
    countedClosing: new FormControl<string | null>(null, [AppValidators.money]),
    notes: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(500)] }),
  });

  private readonly value = toSignal(
    this.form.valueChanges.pipe(
      startWith(null),
      map(() => this.form.getRawValue()),
    ),
    { requireSync: true },
  );
  protected readonly counted = computed(() => {
    const v = this.value();
    return v.byNote
      ? countTotal(this.notes.map((n, i) => ({ value: n.value, count: v.counts[i] ?? 0 })))
      : (v.countedClosing ?? '');
  });
  protected readonly difference = computed(() => {
    const counted = toMinor(this.counted());
    const expected = toMinor(this.expected);
    return counted === null || expected === null ? null : fromMinor(counted - expected);
  });

  constructor() {
    this.form.controls.countedClosing.addValidators(
      AppValidators.requiredIf(() => !this.form.controls.byNote.value),
    );
    this.form.controls.byNote.valueChanges.subscribe(() =>
      this.form.controls.countedClosing.updateValueAndValidity(),
    );
  }

  protected readonly submit = async (): Promise<CashSession> => {
    const v = this.form.getRawValue();
    const closed = await firstValueFrom(
      this.api.close(this.session.id, {
        countedClosing: this.counted(),
        denominations: v.byNote
          ? this.notes
              .map((n, i) => ({ value: n.value, count: v.counts[i] ?? 0 }))
              .filter((d) => d.count > 0)
          : null,
        notes: v.notes.trim() || null,
      }),
    );
    this.ref.close(closed);
    return closed;
  };
}
