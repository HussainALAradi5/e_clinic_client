/** Mirror of LeaveTypeResource — `isLimited`: paid with a yearly quota (checked against the balance). */
export interface LeaveType {
  id: string;
  code: string;
  name: string;
  nameAr: string | null;
  annualQuotaDays: string;
  isPaid: boolean;
  isLimited: boolean;
  requiresAttachment: boolean;
  maxCarryForwardDays: string;
  minNoticeDays: number;
  isArchived: boolean;
}
