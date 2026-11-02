import { RoomType } from '@enums/clinic/room-type.enum';
import { GenericEntity } from '@interfaces/common/generic-entity.interface';

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
