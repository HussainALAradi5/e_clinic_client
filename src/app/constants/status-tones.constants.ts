import { FileScanStatus } from '@enums/attachment/file-scan-status.enum';
import { ApprovalStatus } from '@enums/shared/approval-status.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { StatusTone } from '@enums/ui/status-tone.enum';

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
  Gender: { male: Blue, female: Pink },
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
  // One colour per kind of message (inbox icons); urgent is red everywhere. Same as the phone app.
  NotificationKind: {
    visit: Blue,
    treatment: Teal,
    result: Purple,
    pharmacy: Green,
    billing: Amber,
    hr: Indigo,
    chat: Cyan,
    support: Orange,
    urgent: Red,
    system: Grey,
  },
  // Where a visit sits in time: rows and cards carry this colour, the filter shows the same dots.
  VisitTiming: { coming: Blue, today: Orange, past: Grey, missed: Red },
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
    transfer: Indigo,
  },
  StockLocation: { pharmacy: Teal, treatment_room: Purple },
  UserStatus: { active: Green, locked: Red },
  TicketConfirmation: { awaiting: Amber, confirmed: Green, declined: Red },
  ShiftType: { fixed: Blue, flexible: Purple },
  // Late is amber everywhere (attendance, requests, payslips); overtime blue.
  StaffRequestType: { late_excuse: Amber, overtime: Blue },
  PayslipItemType: {
    basic: Grey,
    allowance: Teal,
    overtime: Blue,
    deduction: Orange,
    absence: Red,
    lateness: Amber,
    unpaid_leave: Purple,
    social_insurance: Indigo,
    adjustment: Cyan,
  },
  TicketCategory: { technical: Indigo, access: Purple, equipment: Orange, data: Cyan, other: Grey },
  ConversationType: { direct: Blue, group: Purple },
  ParticipantRole: { admin: Teal, member: Grey },
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

/** A coloured left edge in a tone (table rows, cards). */
export const TONE_STRIPE_CLASSES: Record<StatusTone, string> = {
  [Grey]: 'border-l-4 border-l-zinc-400 dark:border-l-zinc-500',
  [Blue]: 'border-l-4 border-l-blue-500 dark:border-l-blue-400',
  [Teal]: 'border-l-4 border-l-teal-500 dark:border-l-teal-400',
  [Green]: 'border-l-4 border-l-green-500 dark:border-l-green-400',
  [Amber]: 'border-l-4 border-l-amber-500 dark:border-l-amber-400',
  [Red]: 'border-l-4 border-l-red-500 dark:border-l-red-400',
  [RedOutline]: 'border-l-4 border-l-red-400 dark:border-l-red-500',
  [Orange]: 'border-l-4 border-l-orange-500 dark:border-l-orange-400',
  [Cyan]: 'border-l-4 border-l-cyan-500 dark:border-l-cyan-400',
  [Indigo]: 'border-l-4 border-l-indigo-500 dark:border-l-indigo-400',
  [Purple]: 'border-l-4 border-l-purple-500 dark:border-l-purple-400',
  [Pink]: 'border-l-4 border-l-pink-500 dark:border-l-pink-400',
};

/** A small dot in a tone (filter chips, legends). */
export const TONE_DOT_CLASSES: Record<StatusTone, string> = {
  [Grey]: 'bg-zinc-400 dark:bg-zinc-500',
  [Blue]: 'bg-blue-500 dark:bg-blue-400',
  [Teal]: 'bg-teal-500 dark:bg-teal-400',
  [Green]: 'bg-green-500 dark:bg-green-400',
  [Amber]: 'bg-amber-500 dark:bg-amber-400',
  [Red]: 'bg-red-500 dark:bg-red-400',
  [RedOutline]: 'bg-red-400 dark:bg-red-500',
  [Orange]: 'bg-orange-500 dark:bg-orange-400',
  [Cyan]: 'bg-cyan-500 dark:bg-cyan-400',
  [Indigo]: 'bg-indigo-500 dark:bg-indigo-400',
  [Purple]: 'bg-purple-500 dark:bg-purple-400',
  [Pink]: 'bg-pink-500 dark:bg-pink-400',
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
