import { RoomType } from '@enums/clinic/room-type.enum';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';
import { Appointment } from './appointment.interface';

/** Mirror of RoomResource. */
export interface Room extends GenericEntity {
  name: string;
  nameAr: string | null;
  type: RoomType;
  departmentId: string | null;
  department?: { id: string; name: string } | null;
  floor: string | null;
  capacity: number;
  isInService: boolean;
  outOfServiceReason: string | null;
  notes: string | null;
}

/** POST / PUT /rooms. */
export interface RoomPayload {
  code?: string;
  name?: string;
  nameAr?: string | null;
  type?: RoomType;
  departmentId?: string | null;
  floor?: string | null;
  capacity?: number;
  notes?: string | null;
}

/** PATCH /rooms/{id}/service result: the room and the upcoming bookings to move when it goes out of service. */
export interface RoomServiceResult extends Room {
  affectedAppointments: Appointment[];
}
