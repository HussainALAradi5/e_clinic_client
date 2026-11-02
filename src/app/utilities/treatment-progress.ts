import {
  AT_RISK_ATTENDANCE,
  AT_RISK_CONSECUTIVE_ABSENCES,
  SLIPPING_ATTENDANCE,
} from '@constants/progress-health.constants';
import { ProgressHealth } from '@enums/clinic/progress-health.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';
import { TreatmentProgress } from '@interfaces/clinic/treatment.interface';

/** How a plan is going: done, stopped, at risk (missed twice in a row / low attendance), slipping, not started or on track. */
export function progressHealth(
  p: Pick<
    TreatmentProgress,
    | 'plannedSessions'
    | 'attendedSessions'
    | 'absentSessions'
    | 'consecutiveAbsences'
    | 'attendanceRate'
  >,
  status?: GenericStatus | null,
): ProgressHealth {
  if (status === GenericStatus.Cancelled) return ProgressHealth.Stopped;
  if (
    status === GenericStatus.Completed ||
    (p.plannedSessions > 0 && p.attendedSessions >= p.plannedSessions)
  ) {
    return ProgressHealth.Done;
  }
  const rate = p.attendanceRate;
  if (
    p.consecutiveAbsences >= AT_RISK_CONSECUTIVE_ABSENCES ||
    (rate !== null && rate < AT_RISK_ATTENDANCE)
  ) {
    return ProgressHealth.AtRisk;
  }
  if (p.absentSessions > 0 || (rate !== null && rate < SLIPPING_ATTENDANCE)) {
    return ProgressHealth.Slipping;
  }
  return p.attendedSessions === 0 ? ProgressHealth.NotStarted : ProgressHealth.OnTrack;
}
