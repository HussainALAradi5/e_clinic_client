import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { RoomFormDialog } from '@components/clinic/room-form-dialog/room-form-dialog.component';
import { RoomFormDialogData } from '@interfaces/clinic/room-form-dialog-data.interface';
import { AppButton } from '@components/common/app-button/app-button.component';
import { CellDef } from '@components/common/data-table/cell.directive';
import { ResourceListPage } from '@components/common/resource-list/resource-list.component';
import { Room } from '@interfaces/clinic/room.interface';
import { RoomApi } from '@services/clinic/room-api.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';

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
