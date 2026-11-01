import { ShiftType } from '@shared/enums/hr/shift-type.enum';
import { GenericEntity } from '@shared/interfaces/common/generic-entity.interface';

/** Someone on a shift (ShiftResource.employees). */
export interface ShiftMember {
  id: string;
  code: string;
  fullName: string;
  avatarUrl: string | null;
  jobTitle: string;
  department: string | null;
}

/** Mirror of ShiftResource. Fixed: start → end. Flexible: any time start → end, in by `latestStart`, hours due. */
export interface Shift extends GenericEntity {
  name: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  latestStart: string | null;
  requiredMinutes: number;
  /** Late after this (the start, or the latest start when flexible). */
  arriveBy: string;
  notes: string | null;
  employeesCount?: number;
  employees?: ShiftMember[];
}

/** POST / PUT /hr/shifts. */
export interface ShiftPayload {
  name: string;
  type: ShiftType;
  startTime: string;
  endTime: string;
  latestStart?: string | null;
  requiredMinutes?: number | null;
  notes?: string | null;
}
