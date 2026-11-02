import { ShiftType } from '@enums/hr/shift-type.enum';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { ShiftMember } from '@interfaces/hr/shift-member.interface';

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
