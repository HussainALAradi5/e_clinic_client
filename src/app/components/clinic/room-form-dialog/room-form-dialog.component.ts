import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { RoomFormDialogData } from '@interfaces/clinic/room-form-dialog-data.interface';
import { EntitySelect } from '@components/common/entity-select/entity-select.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { SelectField } from '@components/common/select-field/select-field.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { RoomType } from '@enums/clinic/room-type.enum';
import { Room } from '@interfaces/clinic/room.interface';
import { RoomPayload } from '@interfaces/clinic/room-payload.interface';
import { Department } from '@interfaces/hr/department.interface';
import { dirtyPayload } from '@utilities/form-payload';
import { ROOM_FORM_DIALOG_TEXT } from '@constants/clinic/room-form-dialog.constants';

/** Create or edit a room (the type decides which bookings may use it). */
@Component({
  selector: 'app-room-form-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatDialogModule, GenericForm, TextField, SelectField, EntitySelect],
  templateUrl: './room-form-dialog.component.html',
})
export class RoomFormDialog {
  protected readonly text = ROOM_FORM_DIALOG_TEXT;

  protected readonly data = inject<RoomFormDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<RoomFormDialog, Room>);
  protected readonly room = this.data.room;
  protected readonly form = new FormGroup({
    code: new FormControl(this.room?.code ?? '', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.maxLength(20),
        Validators.pattern(/^[A-Za-z0-9_-]+$/),
      ],
    }),
    name: new FormControl(this.room?.name ?? '', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)],
    }),
    type: new FormControl<RoomType | null>(this.room?.type ?? RoomType.Consultation, [
      Validators.required,
    ]),
    departmentId: new FormControl<string | null>(this.room?.departmentId ?? null),
    floor: new FormControl<string | null>(this.room?.floor ?? null, [Validators.maxLength(10)]),
    capacity: new FormControl<number>(this.room?.capacity ?? 1, {
      nonNullable: true,
      validators: [Validators.required, Validators.min(1), Validators.max(100)],
    }),
    notes: new FormControl<string | null>(this.room?.notes ?? null, [Validators.maxLength(2000)]),
  });
  protected readonly departmentName = (d: Department): string => d.name;
  private saved: Room | undefined;

  protected readonly submit = async (): Promise<Room> => {
    this.saved = await this.data.save(dirtyPayload(this.form, [], !this.room) as RoomPayload);
    return this.saved;
  };

  protected close(): void {
    this.ref.close(this.saved);
  }
}
