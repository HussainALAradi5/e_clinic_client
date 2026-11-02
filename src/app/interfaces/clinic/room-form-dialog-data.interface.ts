import { Room } from '@interfaces/clinic/room.interface';
import { RoomPayload } from '@interfaces/clinic/room-payload.interface';

/** New or edited room. */
export interface RoomFormDialogData {
  room: Room | null;
  save: (payload: RoomPayload) => Promise<Room>;
}
