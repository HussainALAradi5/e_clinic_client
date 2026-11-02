import { AppointmentStatus } from '@enums/clinic/appointment-status.enum';

/** Pause after typing before the note is saved. */
export const AUTOSAVE_MS = 1200;

/** Visit statuses in which the note can be written (vitals from check-in). */
export const DOCUMENTABLE: readonly AppointmentStatus[] = [
  AppointmentStatus.CheckedIn,
  AppointmentStatus.InProgress,
  AppointmentStatus.Completed,
];

/** The vital signs a visit records, in form order. */
export const VITAL_KEYS = [
  'temperatureC',
  'pulseBpm',
  'systolicBp',
  'diastolicBp',
  'respiratoryRate',
  'spo2Percent',
  'weightKg',
  'heightCm',
] as const;
