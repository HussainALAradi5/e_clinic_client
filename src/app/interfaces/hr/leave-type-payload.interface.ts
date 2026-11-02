export interface LeaveTypePayload {
  code: string;
  name: string;
  nameAr: string | null;
  annualQuotaDays: number;
  isPaid: boolean;
  requiresAttachment: boolean;
  maxCarryForwardDays: number;
  minNoticeDays: number;
}
