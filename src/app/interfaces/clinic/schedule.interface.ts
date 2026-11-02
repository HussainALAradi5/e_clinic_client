/** Mirror of ProviderScheduleResource — one weekly working block. */
export interface ScheduleBlock {
  id: string;
  code: string;
  providerId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  slotMinutes: number | null;
  effectiveFrom: string;
  effectiveTo: string | null;
}
