import { progressHealth } from '@utilities/treatment-progress';
import { ProgressHealth } from '@enums/clinic/progress-health.enum';
import { GenericStatus } from '@enums/shared/generic-status.enum';

const plan = (over: Partial<Parameters<typeof progressHealth>[0]> = {}) => ({
  plannedSessions: 6,
  attendedSessions: 2,
  absentSessions: 0,
  consecutiveAbsences: 0,
  attendanceRate: 100,
  ...over,
});

describe('progressHealth', () => {
  it('reads attendance', () => {
    expect(progressHealth(plan())).toBe(ProgressHealth.OnTrack);
    expect(progressHealth(plan({ absentSessions: 1, attendanceRate: 67 }))).toBe(
      ProgressHealth.Slipping,
    );
    expect(
      progressHealth(plan({ absentSessions: 2, consecutiveAbsences: 2, attendanceRate: 50 })),
    ).toBe(ProgressHealth.AtRisk);
    expect(progressHealth(plan({ attendedSessions: 6 }))).toBe(ProgressHealth.Done);
    expect(progressHealth(plan({ attendedSessions: 0, attendanceRate: null }))).toBe(
      ProgressHealth.NotStarted,
    );
  });

  it('follows the plan status', () => {
    expect(progressHealth(plan(), GenericStatus.Cancelled)).toBe(ProgressHealth.Stopped);
    expect(progressHealth(plan(), GenericStatus.Completed)).toBe(ProgressHealth.Done);
  });
});
