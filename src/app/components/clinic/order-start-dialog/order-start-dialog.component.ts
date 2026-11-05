import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { firstValueFrom } from 'rxjs';
import { OrderDialogData } from '@interfaces/clinic/order-dialog-data.interface';
import { orderRoomType } from '@utilities/clinic/clinical';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { ClinicalOrder } from '@interfaces/clinic/clinical-order.interface';
import { Room } from '@interfaces/clinic/room.interface';
import { FilterGroup } from '@interfaces/list/filter-group.interface';
import { ClinicalOrderApi } from '@services/clinic/clinical-order-api.service';
import { ORDER_START_DIALOG_TEXT } from '@constants/clinic/order-start-dialog.constants';

/**
 * Start an order: the patient is identified (wristband / card QR + order barcode) and the room is chosen. Outside
 * referrals start when the letter is sent (no room).
 */
@Component({
  selector: 'app-order-start-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, EntitySelect],
  templateUrl: './order-start-dialog.component.html',
})
export class OrderStartDialog {
  protected readonly text = ORDER_START_DIALOG_TEXT;

  protected readonly data = inject<OrderDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<OrderStartDialog, ClinicalOrder>);
  private readonly api = inject(ClinicalOrderApi);

  protected readonly roomType = orderRoomType(this.data.order.type);
  protected readonly form = new FormGroup({
    roomId: new FormControl<string | null>(null, this.roomType ? [Validators.required] : []),
  });
  protected readonly rooms: FilterGroup = {
    and: [{ type: { eq: this.roomType ?? '' } }, { isInService: { eq: true } }],
  };
  protected readonly roomName = (r: Room): string => `${r.code} · ${r.name}`;

  protected readonly submit = async (): Promise<ClinicalOrder> => {
    const saved = await firstValueFrom(
      this.api.start(this.data.order.id, this.form.controls.roomId.value),
    );
    this.ref.close(saved);
    return saved;
  };
}
