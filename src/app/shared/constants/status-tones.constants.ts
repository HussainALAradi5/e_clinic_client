import { FileScanStatus } from '@shared/enums/attachment/file-scan-status.enum';
import { ApprovalStatus } from '@shared/enums/shared/approval-status.enum';
import { GenericStatus } from '@shared/enums/shared/generic-status.enum';
import { StatusTone } from '@shared/enums/ui/status-tone.enum';

const { Grey, Blue, Teal, Green, Amber, Red, RedOutline, Orange, Cyan, Indigo, Purple, Pink } =
  StatusTone;

/**
 * Hand-picked colours where a value carries meaning (components doc §6) — `completed` is always green, failures red.
 * Every other enum is coloured too: its values take CATEGORY_TONES in option order (EnumService.tone).
 * Values missing from a hand-picked map are grey.
 */
export const STATUS_TONES: Record<string, Record<string, StatusTone>> = {
  GenericStatus: { pending: Grey, in_progress: Blue, completed: Green, cancelled: RedOutline },
  TreatmentPriority: { medium: Grey, high: Amber, urgent: Red },
  // One colour per kind of treatment, so plans are told apart at a glance (lists, queue, calendar, portal).
  TreatmentType: {
    physiotherapy: Teal,
    rehabilitation: Green,
    wound_care: Orange,
    injection: Blue,
    infusion: Cyan,
    dialysis: Indigo,
    respiratory_therapy: Purple,
    laser: Pink,
    dental: Amber,
    other: Grey,
  },
  AppointmentType: {
    consultation: Blue,
    follow_up: Teal,
    procedure: Purple,
    emergency: Red,
    teleconsultation: Cyan,
    treatment_session: Indigo,
  },
  AppointmentSource: { walk_in: Orange, phone: Blue, portal: Teal, referral: Purple },
  AuditAction: {
    created: Green,
    updated: Blue,
    deleted: Red,
    restored: Teal,
    status_changed: Indigo,
    login: Cyan,
    logout: Grey,
    login_failed: Red,
    password_changed: Amber,
    permission_changed: Amber,
    exported: Purple,
    posted: Green,
    reversed: RedOutline,
    approved: Green,
  },
  BalanceSide: { debit: Blue, credit: Teal },
  TransactionDirection: { in: Green, out: Red, internal: Grey },
  LoginFailureReason: {
    invalid_credentials: Red,
    account_locked: Red,
    account_inactive: Grey,
    too_many_attempts: Amber,
    invalid_2fa_code: Amber,
  },
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
  CashSessionStatus: { open: Blue, closing: Amber, closed: Green },
  EmployeeStatus: { active: Green, suspended: Amber, terminated: Red },
  ExpiryStatus: { ok: Green, expiring: Amber, expired: Red },
  AttendanceStatus: {
    present: Green,
    late: Amber,
    absent: Red,
    half_day: Amber,
    on_leave: Blue,
    holiday: Teal,
    weekend: Grey,
  },
  PayrollStatus: {
    draft: Grey,
    calculated: Blue,
    approved: Teal,
    paid: Green,
    cancelled: RedOutline,
  },
  FileScanStatus: { clean: Green, infected: Red },
  FiscalStatus: { open: Green, closed: Grey, locked: Red },
  JournalEntryStatus: { draft: Grey, posted: Green, reversed: RedOutline },
  InvoiceStatus: { issued: Blue, partially_paid: Amber, paid: Green, cancelled: RedOutline },
  NotificationStatus: { sent: Blue, delivered: Green, failed: Red, cancelled: RedOutline },
  PaymentStatus: { completed: Green, voided: Red },
  StockMovementType: {
    receipt: Green,
    dispense: Blue,
    return: Teal,
    adjustment: Amber,
    expiry_writeoff: Red,
  },
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
  [Orange]: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
  [Cyan]: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200',
  [Indigo]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
  [Purple]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
  [Pink]: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
};

/** Colours handed out in option order to enums without a hand-picked map; red and grey stay reserved for meaning. */
export const CATEGORY_TONES: readonly StatusTone[] = [
  Blue,
  Teal,
  Purple,
  Orange,
  Cyan,
  Pink,
  Indigo,
  Amber,
  Green,
];

/** Hand-picked colours (status, priority, kinds people filter by) — these enums get a badge picker in the list toolbar. */
export function hasTones(enumName: string | null | undefined): boolean {
  return !!enumName && enumName in STATUS_TONES;
}

/** Colour of a value in a hand-picked map (fixed enums such as AppointmentStatus); use EnumService.tone for any enum. */
export function statusTone(enumName: string, value: string | null | undefined): StatusTone {
  return (value && STATUS_TONES[enumName]?.[value]) || Grey;
}
