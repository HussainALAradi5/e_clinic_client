import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom, map, startWith } from 'rxjs';
import { JournalEntryDialogData } from '@interfaces/accounting/journal-entry-dialog-data.interface';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { MoneyInput } from '@components/common/money-input/money-input.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { JournalEntryType } from '@enums/accounting/journal-entry-type.enum';
import { Account } from '@interfaces/accounting/account.interface';
import { JournalEntry } from '@interfaces/accounting/journal-entry.interface';
import { JournalLine } from '@interfaces/accounting/journal.interface';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { AccessService } from '@services/auth/access.service';
import { JournalApi } from '@services/accounting/journal-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { fromMinor, toMinor } from '@utilities/money';
import { AppValidators } from '@validations/validators';
import { LineGroup } from '@interfaces/accounting/journal-entry-dialog.interface';
import { JOURNAL_ENTRY_DIALOG_TEXT } from '@constants/accounting/journal-entry-dialog.constants';

/**
 * A manual (or adjustment) journal entry: date, description and at least two lines, each a debit or a credit on a
 * posting account. The running totals show when it balances; it can be saved as a draft or posted at once.
 */
@Component({
  selector: 'app-journal-entry-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    ReactiveFormsModule,
    GenericForm,
    EntitySelect,
    MoneyInput,
    SelectField,
    TextField,
  ],
  templateUrl: './journal-entry-dialog.component.html',
})
export class JournalEntryDialog {
  protected readonly text = JOURNAL_ENTRY_DIALOG_TEXT;

  protected readonly data = inject<JournalEntryDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<JournalEntryDialog, JournalEntry>);
  private readonly api = inject(JournalApi);
  protected readonly canPost = inject(AccessService).can('journal.write & journal.post');

  protected readonly entry = this.data.entry;
  protected readonly types = [
    { value: JournalEntryType.Manual, label: JOURNAL_ENTRY_DIALOG_TEXT.manual },
    { value: JournalEntryType.Adjustment, label: JOURNAL_ENTRY_DIALOG_TEXT.adjustment },
  ];
  protected readonly postable: FilterGroup = { and: [{ isGroup: { eq: false } }] };
  protected readonly accountName = (a: Account): string => `${a.code} · ${a.name}`;

  protected readonly lines = new FormArray<LineGroup>(
    this.entry?.lines?.length
      ? this.entry.lines.map((l) => this.line(l))
      : [this.line(null), this.line(null)],
  );
  protected readonly form = new FormGroup({
    entryDate: new FormControl(this.entry?.entryDate ?? clinicIsoDate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    type: new FormControl<JournalEntryType.Manual | JournalEntryType.Adjustment>(
      this.entry?.type === JournalEntryType.Adjustment
        ? JournalEntryType.Adjustment
        : JournalEntryType.Manual,
      { nonNullable: true },
    ),
    description: new FormControl(this.entry?.description ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(500)],
    }),
    postNow: new FormControl(false, { nonNullable: true }),
    lines: this.lines,
  });

  private readonly values = toSignal(
    this.lines.valueChanges.pipe(
      startWith(null),
      map(() => this.lines.getRawValue()),
    ),
    { requireSync: true },
  );
  protected readonly debit = computed(() =>
    fromMinor(this.values().reduce((s, l) => s + (toMinor(l.debit) ?? 0n), 0n)),
  );
  protected readonly credit = computed(() =>
    fromMinor(this.values().reduce((s, l) => s + (toMinor(l.credit) ?? 0n), 0n)),
  );
  protected readonly difference = computed(() =>
    fromMinor((toMinor(this.debit()) ?? 0n) - (toMinor(this.credit()) ?? 0n)),
  );
  protected readonly balanced = computed(
    () => this.difference() === '0.000' && this.debit() !== '0.000',
  );

  constructor() {
    // Posting needs a balanced entry; a draft may be saved half-done.
    this.form.addValidators(() =>
      this.form.controls.postNow.value && !this.balanced() ? { unbalanced: true } : null,
    );
  }

  protected add(): void {
    this.lines.push(this.line(null));
  }

  protected remove(index: number): void {
    this.lines.removeAt(index);
    this.lines.markAsDirty();
  }

  /** Fills the empty side of the last line with what makes the entry balance. */
  protected balance(index: number): void {
    const group = this.lines.at(index);
    const diff = toMinor(this.difference()) ?? 0n;
    if (diff === 0n) return;
    const own = toMinor(group.controls.debit.value) ?? 0n;
    const ownCredit = toMinor(group.controls.credit.value) ?? 0n;
    const net = own - ownCredit - diff;
    group.patchValue(
      net >= 0n
        ? { debit: fromMinor(net), credit: null }
        : { debit: null, credit: fromMinor(-net) },
    );
  }

  protected readonly submit = async (): Promise<JournalEntry> => {
    const v = this.form.getRawValue();
    const payload = {
      entryDate: v.entryDate,
      type: v.type,
      description: v.description.trim(),
      lines: v.lines
        .filter((l) => l.accountId)
        .map((l) => ({
          accountId: l.accountId as string,
          debit: toMinor(l.debit) ? l.debit : null,
          credit: toMinor(l.credit) ? l.credit : null,
          description: l.description.trim() || null,
        })),
    };
    let saved = await firstValueFrom(
      this.entry ? this.api.update(this.entry.id, payload) : this.api.create(payload),
    );
    if (v.postNow) saved = await firstValueFrom(this.api.post(saved.id));
    this.ref.close(saved);
    return saved;
  };

  private line(line: JournalLine | null): LineGroup {
    const group: LineGroup = new FormGroup({
      accountId: new FormControl<string | null>(line?.accountId ?? null, [Validators.required]),
      description: new FormControl(line?.description ?? '', {
        nonNullable: true,
        validators: [Validators.maxLength(255)],
      }),
      debit: new FormControl<string | null>(
        line && line.debit.amount !== '0.000' ? line.debit.amount : null,
        [AppValidators.money],
      ),
      credit: new FormControl<string | null>(
        line && line.credit.amount !== '0.000' ? line.credit.amount : null,
        [AppValidators.money],
      ),
    });
    // One side per line: typing a debit clears the credit and the other way round.
    group.controls.debit.valueChanges.subscribe((v) => {
      if (v && group.controls.credit.value)
        group.controls.credit.setValue(null, { emitEvent: false });
    });
    group.controls.credit.valueChanges.subscribe((v) => {
      if (v && group.controls.debit.value)
        group.controls.debit.setValue(null, { emitEvent: false });
    });
    return group;
  }

  protected initial(index: number): Account | null {
    const line = this.entry?.lines?.[index];
    return line?.account ? ({ ...line.account } as Account) : null;
  }
}
