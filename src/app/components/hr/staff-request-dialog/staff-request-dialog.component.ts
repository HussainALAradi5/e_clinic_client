import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { DATE_FORMAT, TIME_FORMAT } from '@constants/app.constants';
import { StaffRequestType } from '@enums/hr/staff-request-type.enum';
import { Attendance } from '@interfaces/hr/attendance.interface';
import { StaffRequest } from '@interfaces/hr/staff-request.interface';
import { DurationPipe } from '@pipes/duration.pipe';
import { StaffRequestApi } from '@services/hr/staff-request-api.service';
import { StaffRequestDialogData } from '@interfaces/hr/staff-request-dialog.interface';

/**
 * Ask HR about one of my days: excuse the late arrival, or pay the overtime. Shows the day as attendance measured it;
 * the reason is optional but helps HR decide.
 */
@Component({
  selector: 'app-staff-request-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    MatDialogModule,
    MatIconModule,
    ReactiveFormsModule,
    DurationPipe,
    GenericForm,
    StatusChip,
    TextField,
  ],
  templateUrl: './staff-request-dialog.component.html',
  styleUrl: './staff-request-dialog.component.scss',
})
export class StaffRequestDialog {
  protected readonly data = inject<StaffRequestDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<StaffRequestDialog, StaffRequest>);
  private readonly api = inject(StaffRequestApi);

  protected readonly dateFormat = DATE_FORMAT;
  protected readonly timeFormat = TIME_FORMAT;
  protected readonly zone = '+0300';
  protected readonly isLate = this.data.type === StaffRequestType.LateExcuse;
  protected readonly minutes = computed(() =>
    this.isLate ? this.data.day.lateMinutes : this.data.day.overtimeMinutes,
  );
  protected readonly form = new FormGroup({
    reason: new FormControl<string | null>(null, [Validators.maxLength(1000)]),
  });

  protected readonly submit = async (): Promise<void> => {
    const reason = this.form.controls.reason.value?.trim() || null;
    this.ref.close(
      await firstValueFrom(
        this.api.create({ type: this.data.type, attendanceId: this.data.day.id, reason }),
      ),
    );
  };
}
