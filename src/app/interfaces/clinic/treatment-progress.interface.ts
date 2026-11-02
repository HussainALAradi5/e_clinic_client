/** Attendance and progress computed by the server from the session appointments. */
export interface TreatmentProgress {
  plannedSessions: number;
  attendedSessions: number;
  completedSessions: number;
  absentSessions: number;
  cancelledSessions: number;
  upcomingSessions: number;
  remainingSessions: number;
  /** % of held sessions attended; null before the first one. */
  attendanceRate: number | null;
  consecutiveAbsences: number;
  lastAttendedAt: string | null;
  nextSession: { id: string; scheduledDate: string; startTime: string } | null;
}
