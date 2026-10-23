import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RoomFormDialog } from '../../components/room-form-dialog/room-form-dialog.component';
import { RoomFormDialogData } from '../../interfaces/dialog-data.interface';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { CellDef } from '@shared/components/data-table/cell.directive';
import { ResourceListPage } from '@shared/components/resource-list/resource-list.component';
import { Room } from '@shared/interfaces/clinic/room.interface';
import { RoomApi } from '@shared/services/clinic/room-api.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';

/** `/clinic/rooms` — rooms with service status and bulk archive / delete / restore. */
@Component({
  selector: 'app-room-list-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ResourceListPage, CellDef, AppButton],
  templateUrl: './room-list.page.html',
})
export class RoomListPage {
  private readonly api = inject(RoomApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);

  protected readonly create = async (): Promise<void> => {
    const room = await this.dialogs.open<RoomFormDialog, RoomFormDialogData, Room>(
      RoomFormDialog,
      { room: null, save: (payload) => firstValueFrom(this.api.create(payload)) },
      { width: '600px' },
    );
    if (room) {
      this.notify.success(`Room ${room.code} created.`);
      await this.router.navigate(['/clinic/rooms', room.id]);
    }
  };
}
