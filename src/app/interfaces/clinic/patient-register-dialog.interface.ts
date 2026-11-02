import { Patient } from '@interfaces/clinic/patient.interface';

/** What the register dialog closes with: the new file, or the file the person already has. */
export type RegisterResult = { patient: Patient } | { existingId: string };
