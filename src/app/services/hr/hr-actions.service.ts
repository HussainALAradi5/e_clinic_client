import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { LeaveRequestDialog } from '@components/hr/leave-request-dialog/leave-request-dialog.component';
import { LeaveTypeDialog } from '@components/hr/leave-type-dialog/leave-type-dialog.component';
import { ManualAttendanceDialog } from '@components/hr/manual-attendance-dialog/manual-attendance-dialog.component';
import { PayPayrollDialog } from '@components/hr/pay-payroll-dialog/pay-payroll-dialog.component';
import { PayrollRunDialog } from '@components/hr/payroll-run-dialog/payroll-run-dialog.component';
import { LeaveRequestDialogData } from '@interfaces/hr/leave-request-dialog-data.interface';
import { LeaveTypeDialogData } from '@interfaces/hr/leave-type-dialog-data.interface';
import { ManualAttendanceDialogData } from '@interfaces/hr/manual-attendance-dialog-data.interface';
import { PayPayrollDialogData } from '@interfaces/hr/pay-payroll-dialog-data.interface';
import { ErrorCode } from '@enums/api/error-code.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { Attendance } from '@interfaces/hr/attendance.interface';
import { LeaveRequest } from '@interfaces/hr/leave-request.interface';
import { LeaveType } from '@interfaces/hr/leave.interface';
import { PayrollRun } from '@interfaces/hr/payroll-run.interface';
import { AttendanceApi } from '@services/hr/attendance-api.service';
import { LeaveApi } from '@services/hr/leave-api.service';
import { PayrollApi } from '@services/hr/payroll-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { isApiError } from '@utilities/guards';
import { formatMoney } from '@utilities/money';
import { formatQty } from '@utilities/quantity';

/**
 * HR steps with their confirmations and messages — attendance, leave and payroll — for the list and detail pages.
 * Each returns the changed record, or undefined when the user backed out.
 */
@Injectable({ providedIn: 'root' })
export class HrActions {
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly attendance = inject(AttendanceApi);
  private readonly leaves = inject(LeaveApi);
  private readonly payroll = inject(PayrollApi);

  // Attendance

  async checkIn(): Promise<Attendance> {
    const day = await firstValueFrom(this.attendance.checkIn());
    this.notify.success(
      day.lateMinutes ? `Checked in — ${day.lateMinutes} min late.` : 'Checked in.',
    );
    return day;
  }

  async checkOut(): Promise<Attendance> {
    const day = await firstValueFrom(this.attendance.checkOut());
    this.notify.success(
      day.overtimeMinutes
        ? `Checked out — ${day.overtimeMinutes} min overtime sent for approval.`
        : 'Checked out. See you tomorrow.',
    );
    return day;
  }

  recordAttendance(data: ManualAttendanceDialogData): Promise<Attendance | undefined> {
    return this.dialogs.openAction<ManualAttendanceDialog, ManualAttendanceDialogData, Attendance>(
      ManualAttendanceDialog,
      data,
      () => 'Attendance saved.',
    );
  }

  async approveOvertime(day: Attendance): Promise<Attendance | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Approve ${day.overtimeMinutes} min overtime?`,
      message: `${day.employee?.fullName ?? ''} on ${day.date}. Approved overtime is paid with the month's salary.`,
      confirmLabel: 'Approve',
    });
    if (!ok) return undefined;
    const approved = await firstValueFrom(this.attendance.approveOvertime(day.id));
    this.notify.success('Overtime approved.');
    return approved;
  }

  // Leave

  requestLeave(
    employee: LeaveRequestDialogData['employee'] = null,
  ): Promise<LeaveRequest | undefined> {
    return this.dialogs.openAction<LeaveRequestDialog, LeaveRequestDialogData, LeaveRequest>(
      LeaveRequestDialog,
      { employee },
      (r) =>
        r.status === ApprovalStatus.Draft
          ? `${r.code} saved as a draft — attach the certificate to send it.`
          : r.status === ApprovalStatus.Pending
            ? `${r.code} sent for approval (${formatQty(r.totalDays)} day(s)).`
            : `${r.code} saved.`,
      '560px',
    );
  }

  async submitLeave(request: LeaveRequest): Promise<LeaveRequest | undefined> {
    const sent = await firstValueFrom(this.leaves.submit(request.id));
    this.notify.success(`${sent.code} sent for approval.`);
    return sent;
  }

  /** Approves; when the person has bookings on those days, asks before cancelling them. */
  async approveLeave(request: LeaveRequest): Promise<LeaveRequest | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Approve ${formatQty(request.totalDays)} day(s) of ${request.leaveType?.name ?? 'leave'}?`,
      message: `${request.employee?.fullName ?? ''}, ${request.startDate} – ${request.endDate}.`,
      confirmLabel: 'Approve',
    });
    if (!ok) return undefined;
    try {
      return this.approved(await firstValueFrom(this.leaves.approve(request.id, null)));
    } catch (error) {
      if (!isApiError(error) || error.code !== ErrorCode.ScheduleHasAppointments) throw error;
      const count = ((error.meta?.['appointments'] as unknown[] | undefined) ?? []).length;
      const cancel = await this.dialogs.confirm({
        title: `${count} booking(s) on these days`,
        message:
          'The patients are told their appointment is cancelled by the clinic. Approve and cancel them?',
        confirmLabel: 'Approve and cancel bookings',
        danger: true,
      });
      if (!cancel) return undefined;
      return this.approved(await firstValueFrom(this.leaves.approve(request.id, null, true)));
    }
  }

  async rejectLeave(request: LeaveRequest): Promise<LeaveRequest | undefined> {
    const notes = await this.dialogs.reason({
      title: `Reject ${request.code}?`,
      message: 'The employee sees your reason.',
      confirmLabel: 'Reject',
      danger: true,
    });
    if (!notes) return undefined;
    const rejected = await firstValueFrom(this.leaves.reject(request.id, notes));
    this.notify.success(`${rejected.code} rejected.`);
    return rejected;
  }

  async cancelLeave(request: LeaveRequest): Promise<LeaveRequest | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Cancel ${request.code}?`,
      message:
        request.status === ApprovalStatus.Approved
          ? 'The days go back to the balance and the schedule is reopened.'
          : 'The request is withdrawn.',
      confirmLabel: 'Cancel leave',
      cancelLabel: 'Keep',
      danger: true,
    });
    if (!ok) return undefined;
    const cancelled = await firstValueFrom(this.leaves.cancel(request.id));
    this.notify.success(`${cancelled.code} cancelled.`);
    return cancelled;
  }

  editLeaveType(type: LeaveType | null): Promise<LeaveType | undefined> {
    return this.dialogs.openAction<LeaveTypeDialog, LeaveTypeDialogData, LeaveType>(
      LeaveTypeDialog,
      { type },
      (t) => `${t.name} saved.`,
      '560px',
    );
  }

  // Payroll

  createPayroll(): Promise<PayrollRun | undefined> {
    return this.dialogs.openAction<PayrollRunDialog, null, PayrollRun>(
      PayrollRunDialog,
      null,
      (r) => `Payroll ${r.code} created.`,
    );
  }

  async calculatePayroll(run: PayrollRun): Promise<PayrollRun | undefined> {
    const calculated = await firstValueFrom(this.payroll.calculate(run.id));
    this.notify.success(
      `${calculated.employeeCount} payslips calculated — ${formatMoney(calculated.totalNet)} net.`,
    );
    return calculated;
  }

  async approvePayroll(run: PayrollRun): Promise<PayrollRun | undefined> {
    const ok = await this.dialogs.confirm({
      title: `Approve ${run.code}: ${formatMoney(run.totalNet)} net?`,
      message:
        "The salary cost is posted to the ledger and the month's attendance is locked. Staff can then see their payslips.",
      confirmLabel: 'Approve',
    });
    if (!ok) return undefined;
    const approved = await firstValueFrom(this.payroll.approve(run.id));
    this.notify.success(`${approved.code} approved.`);
    return approved;
  }

  payPayroll(run: PayrollRun): Promise<PayrollRun | undefined> {
    return this.dialogs.openAction<PayPayrollDialog, PayPayrollDialogData, PayrollRun>(
      PayPayrollDialog,
      { run },
      (r) => `${r.code} paid.`,
    );
  }

  async cancelPayroll(run: PayrollRun): Promise<PayrollRun | undefined> {
    const reason = await this.dialogs.reason({
      title: `Cancel ${run.code}?`,
      message: run.accrualJournalEntryId
        ? 'The salary entry is reversed and the attendance of the month is reopened.'
        : 'The month can be run again afterwards.',
      confirmLabel: 'Cancel payroll',
      danger: true,
    });
    if (!reason) return undefined;
    const cancelled = await firstValueFrom(this.payroll.cancel(run.id, reason));
    this.notify.success(`${cancelled.code} cancelled.`);
    return cancelled;
  }

  private approved(request: LeaveRequest): LeaveRequest {
    this.notify.success(`${request.code} approved.`);
    return request;
  }
}
