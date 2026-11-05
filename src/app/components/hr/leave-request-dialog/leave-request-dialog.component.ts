import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom, map } from 'rxjs';
import { LeaveRequestDialogData } from '@interfaces/hr/leave-request-dialog-data.interface';
import { AppButton } from '@components/common/app-button/app-button.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { UploadZone } from '@components/common/upload-zone/upload-zone.component';
import { AttachmentCategory } from '@enums/attachment/attachment-category.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { EnumOption } from '@interfaces/common/enum-option.interface';
import { LeaveRequest } from '@interfaces/hr/leave-request.interface';
import { LeaveType } from '@interfaces/hr/leave.interface';
import { QtyPipe } from '@pipes/qty.pipe';
import { LeaveApi } from '@services/hr/leave-api.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { AppValidators } from '@validations/validators';
import { LEAVE_REQUEST_DIALOG_TEXT } from '@constants/hr/leave-request-dialog.constants';

/**
 * Ask for leave (or, for HR, record it for an employee). Weekly days off and clinic holidays are not counted. Types
 * that need a certificate come back as a draft: attach it here, then send it for approval.
 */
@Component({
  selector: 'app-leave-request-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatDialogModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    ReactiveFormsModule,
    GenericForm,
    SelectField,
    TextField,
    UploadZone,
    AppButton,
    QtyPipe,
  ],
  templateUrl: './leave-request-dialog.component.html',
})
export class LeaveRequestDialog {
  protected readonly text = LEAVE_REQUEST_DIALOG_TEXT;

  protected readonly data = inject<LeaveRequestDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<LeaveRequestDialog, LeaveRequest>);
  private readonly api = inject(LeaveApi);

  private readonly types = toSignal(this.api.types(), { initialValue: [] as LeaveType[] });
  protected readonly typeOptions = computed<EnumOption<string>[]>(() =>
    this.types().map((t) => ({
      value: t.id,
      label: t.isPaid ? t.name : `${t.name} (unpaid)`,
    })),
  );
  protected readonly form = new FormGroup({
    leaveTypeId: new FormControl<string | null>(null, [Validators.required]),
    startDate: new FormControl(clinicIsoDate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    endDate: new FormControl(clinicIsoDate(), {
      nonNullable: true,
      validators: [Validators.required, AppValidators.dateAfter('startDate')],
    }),
    isHalfDay: new FormControl(false, { nonNullable: true }),
    reason: new FormControl<string | null>(null, [Validators.maxLength(1000)]),
  });
  private readonly typeId = toSignal(this.form.controls.leaveTypeId.valueChanges, {
    initialValue: null,
  });
  protected readonly type = computed(() => this.types().find((t) => t.id === this.typeId()));
  protected readonly singleDay = toSignal(
    this.form.valueChanges.pipe(map((v) => v.startDate === v.endDate)),
    { initialValue: true },
  );

  /** A draft waiting for its certificate. */
  protected readonly draft = signal<LeaveRequest | null>(null);
  protected readonly attached = signal(false);
  protected readonly certificate = AttachmentCategory.MedicalCertificate;
  protected readonly owner = computed(() => ({
    type: 'leave_request',
    id: this.draft()?.id ?? '',
  }));

  constructor() {
    this.form.controls.startDate.valueChanges.subscribe((start) => {
      if (start && this.form.controls.endDate.value < start) {
        this.form.controls.endDate.setValue(start);
      }
      this.form.controls.endDate.updateValueAndValidity();
    });
  }

  protected readonly submit = async (): Promise<LeaveRequest> => {
    const v = this.form.getRawValue();
    const request = await firstValueFrom(
      this.api.request({
        employeeId: this.data.employee?.id ?? null,
        leaveTypeId: v.leaveTypeId as string,
        startDate: v.startDate,
        endDate: v.endDate,
        isHalfDay: v.isHalfDay && v.startDate === v.endDate,
        reason: v.reason?.trim() || null,
      }),
    );
    if (request.status === ApprovalStatus.Draft) {
      this.draft.set(request);
    } else {
      this.ref.close(request);
    }
    return request;
  };

  protected readonly send = async (): Promise<void> => {
    const sent = await firstValueFrom(this.api.submit(this.draft()?.id as string));
    this.ref.close(sent);
  };
}
