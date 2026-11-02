import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { ReactiveFormsModule } from '@angular/forms';
import { AccountFormDialogData } from '@interfaces/accounting/dialog-data.interface';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { AccountType } from '@enums/accounting/account-type.enum';
import { Account } from '@interfaces/accounting/account.interface';
import { AccountPayload } from '@interfaces/accounting/account-payload.interface';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { dirtyPayload } from '@utilities/form-payload';

/** Create (code, type, group flag) or edit an account; the parent must be a group of the same type. */
@Component({
  selector: 'app-account-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatCheckboxModule,
    ReactiveFormsModule,
    GenericForm,
    TextField,
    SelectField,
    EntitySelect,
  ],
  templateUrl: './account-form-dialog.component.html',
})
export class AccountFormDialog {
  protected readonly data = inject<AccountFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<AccountFormDialog, Account>);
  protected readonly account = this.data.account;
  protected readonly parent =
    this.account?.parent ?? (this.data.parent ? { ...this.data.parent } : null);

  protected readonly form = new FormGroup({
    code: new FormControl(this.account?.code ?? '', {
      nonNullable: true,
      validators: this.account ? [] : [Validators.required, Validators.pattern(/^[0-9]{3,10}$/)],
    }),
    name: new FormControl(this.account?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)],
    }),
    type: new FormControl<AccountType | null>(
      this.account?.type ?? this.data.parent?.type ?? null,
      [Validators.required],
    ),
    parentId: new FormControl<string | null>(
      this.account?.parentId ?? this.data.parent?.id ?? null,
    ),
    isGroup: new FormControl(this.account?.isGroup ?? false, { nonNullable: true }),
    description: new FormControl<string | null>(this.account?.description ?? null, [
      Validators.maxLength(2000),
    ]),
  });

  protected readonly accountName = (a: Account): string => `${a.code} · ${a.name}`;
  /** Parents: groups of the chosen type. */
  protected parentFilter(): FilterGroup {
    const type = this.form.controls.type.value;
    return { and: [{ isGroup: { eq: true } }, ...(type ? [{ type: { eq: type } }] : [])] };
  }

  private saved: Account | undefined;

  protected readonly submit = async (): Promise<Account> => {
    const payload = this.account
      ? dirtyPayload(this.form, ['code', 'isGroup'])
      : dirtyPayload(this.form, [], true);
    this.saved = await this.data.save(payload as AccountPayload);
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
