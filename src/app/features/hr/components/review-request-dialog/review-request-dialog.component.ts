import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@shared/components/generic-form/generic-form.component';
import { StatusChip } from '@shared/components/status-chip/status-chip.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { DATE_FORMAT } from '@shared/constants/app.constants';
import { StaffRequestType } from '@shared/enums/hr/staff-request-type.enum';
import { StaffRequest } from '@shared/interfaces/hr/staff-request.interface';
import { DurationPipe } from '@shared/pipes/duration.pipe';
import { MoneyPipe } from '@shared/pipes/money.pipe';
import { StaffRequestApi } from '@shared/services/hr/staff-request-api.service';

export interface ReviewRequestDialogData {
  request: StaffRequest;
  decision: 'approve' | 'reject';
}

/**
 * HR decides a staff request. The reason goes back to the employee: optional when approving, required when
 * rejecting (so they know why).
 */
@Component({
  selector: 'app-review-request-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatDialogModule,
    MatIconModule,
    ReactiveFormsModule,
    DurationPipe,
    MoneyPipe,
    GenericForm,
    StatusChip,
    TextField,
  ],
  templateUrl: './review-request-dialog.component.html',
})
export class ReviewRequestDialog {
  protected readonly data = inject<ReviewRequestDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<ReviewRequestDialog, StaffRequest>);
  private readonly api = inject(StaffRequestApi);

  protected readonly dateFormat = DATE_FORMAT;
  protected readonly approving = this.data.decision === 'approve';
  protected readonly isLate = this.data.request.type === StaffRequestType.LateExcuse;
  protected readonly form = new FormGroup({
    reason: new FormControl<string | null>(
      null,
      this.approving
        ? [Validators.maxLength(1000)]
        : [Validators.required, Validators.minLength(3), Validators.maxLength(1000)],
    ),
  });

  protected readonly submit = async (): Promise<void> => {
    const reason = this.form.controls.reason.value?.trim() || null;
    const id = this.data.request.id;
    this.ref.close(
      await firstValueFrom(
        this.approving ? this.api.approve(id, reason) : this.api.reject(id, reason ?? ''),
      ),
    );
  };
}
