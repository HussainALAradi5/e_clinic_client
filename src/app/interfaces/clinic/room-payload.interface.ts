import { RoomType } from '@enums/clinic/room-type.enum';

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
