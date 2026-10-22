import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { LeaveTypeDialogData } from '../../interfaces/dialog-data.interface';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { LeaveType } from '@shared/interfaces/hr/leave.interface';
import { LeaveApi } from '@shared/services/hr/leave-api.service';

/** Leave type: yearly days (0 = no limit), paid, certificate, carry-forward and notice. */
@Component({
  selector: 'app-leave-type-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, MatCheckboxModule, ReactiveFormsModule, GenericForm, TextField],
  templateUrl: './leave-type-dialog.component.html',
})
export class LeaveTypeDialog {
  protected readonly data = inject<LeaveTypeDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<LeaveTypeDialog, LeaveType>);
  private readonly api = inject(LeaveApi);
  private readonly type = this.data.type;

  private readonly days = [Validators.required, Validators.min(0), Validators.max(366)];
  protected readonly form = new FormGroup({
    code: new FormControl(this.type?.code ?? '', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(/^[A-Z0-9_-]+$/),
      ],
    }),
    name: new FormControl(this.type?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    nameAr: new FormControl<string | null>(this.type?.nameAr ?? null, [Validators.maxLength(100)]),
    annualQuotaDays: new FormControl(Number(this.type?.annualQuotaDays ?? 0), {
      nonNullable: true,
      validators: this.days,
    }),
    maxCarryForwardDays: new FormControl(Number(this.type?.maxCarryForwardDays ?? 0), {
      nonNullable: true,
      validators: this.days,
    }),
    minNoticeDays: new FormControl(this.type?.minNoticeDays ?? 0, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(0), Validators.max(365)],
    }),
    isPaid: new FormControl(this.type?.isPaid ?? true, { nonNullable: true }),
    requiresAttachment: new FormControl(this.type?.requiresAttachment ?? false, {
      nonNullable: true,
    }),
  });

  protected readonly submit = async (): Promise<LeaveType> => {
    const v = this.form.getRawValue();
    const saved = await firstValueFrom(
      this.api.saveType(
        {
          ...v,
          code: v.code.trim().toUpperCase(),
          name: v.name.trim(),
          nameAr: v.nameAr?.trim() || null,
        },
        this.type?.id,
      ),
    );
    this.ref.close(saved);
    return saved;
  };
}
