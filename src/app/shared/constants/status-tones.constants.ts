import { FileScanStatus } from '@shared/enums/attachment/file-scan-status.enum';
import { ApprovalStatus } from '@shared/enums/shared/approval-status.enum';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import { StatusTone } from '@shared/enums/ui/status-tone.enum';

const { Grey, Blue, Teal, Green, Amber, Red, RedOutline } = StatusTone;

/** One colour map for every status enum (components doc §6) — `completed` is always green. Unlisted values are grey. */
export const STATUS_TONES: Record<string, Record<string, StatusTone>> = {
  GenericStatus: { pending: Grey, in_progress: Blue, completed: Green, cancelled: RedOutline },
  ApprovalStatus: {
    draft: Grey,
    pending: Grey,
    approved: Green,
    rejected: Red,
    cancelled: RedOutline,
  },
  AppointmentStatus: {
    pending: Grey,
    confirmed: Blue,
    checked_in: Teal,
    in_progress: Blue,
    completed: Green,
    cancelled: RedOutline,
    no_show: Red,
    rescheduled: Amber,
  },
  AttendanceStatus: { late: Amber, on_leave: Amber },
  EmployeeStatus: { active: Green, terminated: Red },
  FileScanStatus: { clean: Green, infected: Red },
  FiscalStatus: { locked: Red },
  InvoiceStatus: { issued: Blue, partially_paid: Amber, paid: Green, cancelled: RedOutline },
  NotificationStatus: { sent: Blue, delivered: Green, failed: Red, cancelled: RedOutline },
  PaymentStatus: { completed: Green, voided: Red },
  PayrollStatus: { approved: Green, paid: Green, cancelled: RedOutline },
  UserStatus: { active: Green, locked: Red },
};

export const TONE_CLASSES: Record<StatusTone, string> = {
  [Grey]: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-200',
  [Blue]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  [Teal]: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200',
  [Green]: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  [Amber]: 'bg-amber-100 text-amber-900 dark:bg-amber-900/50 dark:text-amber-200',
  [Red]: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  [RedOutline]: 'border border-red-400 text-red-700 dark:border-red-500 dark:text-red-300',
};

export function statusTone(enumName: string, value: string | null | undefined): StatusTone {
  return (value && STATUS_TONES[enumName]?.[value]) || Grey;
}
