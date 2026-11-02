import { Appointment } from '@interfaces/clinic/appointment.interface';
import { Room } from '@interfaces/clinic/room.interface';

/** PATCH /rooms/{id}/service result: the room and the upcoming bookings to move when it goes out of service. */
export interface RoomServiceResult extends Room {
  affectedAppointments: Appointment[];
}
