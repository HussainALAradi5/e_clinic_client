import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AppointmentRows } from '@components/clinic/appointment-rows/appointment-rows.component';
import { RoomFormDialog } from '@components/clinic/room-form-dialog/room-form-dialog.component';
import { RoomFormDialogData } from '@interfaces/clinic/room-form-dialog-data.interface';
import { HasAccessDirective } from '@directives/has-access.directive';
import { AppButton } from '@components/common/app-button/app-button.component';
import { AuditHistory } from '@components/common/audit-history/audit-history.component';
import { EntityActions } from '@components/common/entity-actions/entity-actions.component';
import { ErrorState } from '@components/common/error-state/error-state.component';
import { Facts } from '@components/common/facts/facts.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { ButtonVariant } from '@enums/ui/button.enum';
import { Appointment } from '@interfaces/clinic/appointment.interface';
import { Room } from '@interfaces/clinic/room.interface';
import { Fact } from '@interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { RoomApi } from '@services/clinic/room-api.service';
import { EntityDetail } from '@services/data/entity-detail';
import { EnumService } from '@services/data/enum.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { ROOM_DETAIL_TEXT } from '@constants/clinic/room-detail.constants';

/** `/clinic/rooms/:id` — facts, bookings of a day, service switch (with the bookings to move), history. */
@Component({
  selector: 'app-room-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    EntityActions,
    AppButton,
    ErrorState,
    Skeleton,
    Facts,
    TextField,
    AuditHistory,
    AppointmentRows,
    MatCardModule,
    MatIconModule,
    MatTabsModule,
    HasAccessDirective,
    EnumLabelPipe,
  ],
  templateUrl: './room-detail.page.html',
})
export class RoomDetailPage implements OnInit {
  readonly id = input.required<string>();

  private readonly api = inject(RoomApi);
  protected readonly detail = new EntityDetail(this.api);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly router = inject(Router);
  private readonly enums = inject(EnumService);

  protected readonly variants = ButtonVariant;
  protected readonly day = new FormControl(clinicIsoDate(), { nonNullable: true });
  protected readonly bookings = signal<Appointment[]>([]);
  protected readonly affected = signal<Appointment[]>([]);
  protected readonly facts = computed<Fact[]>(() => {
    const r = this.detail.record();
    if (!r) return [];
    return [
      { label: ROOM_DETAIL_TEXT.code, value: r.code, mono: true },
      { label: ROOM_DETAIL_TEXT.type, value: this.enums.label('RoomType', r.type) },
      { label: ROOM_DETAIL_TEXT.department, value: r.department?.name },
      { label: ROOM_DETAIL_TEXT.floor, value: r.floor },
      { label: ROOM_DETAIL_TEXT.capacity, value: r.capacity },
      {
        label: ROOM_DETAIL_TEXT.status,
        value: r.isInService
          ? ROOM_DETAIL_TEXT.inService
          : ROOM_DETAIL_TEXT.outOfService2(r.outOfServiceReason ?? ''),
      },
      { label: ROOM_DETAIL_TEXT.equipmentNotes, value: r.notes },
    ];
  });

  ngOnInit(): void {
    void this.detail.load(this.id()).then(() => this.loadDay());
    this.day.valueChanges.subscribe(() => void this.loadDay());
  }

  protected async loadDay(): Promise<void> {
    this.bookings.set(
      await firstValueFrom(this.api.availability(this.id(), this.day.value)).catch(() => []),
    );
  }

  protected readonly outOfService = async (): Promise<void> => {
    const reason = await this.dialogs.reason({
      title: ROOM_DETAIL_TEXT.takeThisRoomOutOf,
      message: ROOM_DETAIL_TEXT.itDisappearsFromBookingExisting,
      confirmLabel: ROOM_DETAIL_TEXT.outOfService,
    });
    if (reason === null) return;
    const result = await firstValueFrom(this.api.setInService(this.id(), false, reason));
    this.detail.set(result);
    this.affected.set(result.affectedAppointments);
    this.notify.success(
      result.affectedAppointments.length
        ? ROOM_DETAIL_TEXT.roomOutOfServiceBooking(result.affectedAppointments.length)
        : ROOM_DETAIL_TEXT.roomOutOfService,
    );
  };

  protected readonly backInService = async (): Promise<void> => {
    const result = await firstValueFrom(this.api.setInService(this.id(), true));
    this.detail.set(result);
    this.affected.set([]);
    this.notify.success(ROOM_DETAIL_TEXT.roomBackInService);
  };

  protected readonly edit = async (): Promise<void> => {
    const saved = await this.dialogs.open<RoomFormDialog, RoomFormDialogData, Room>(
      RoomFormDialog,
      { room: this.detail.record(), save: (payload) => this.detail.update(payload) },
      { width: '600px' },
    );
    if (saved) this.notify.success(ROOM_DETAIL_TEXT.roomSaved);
  };

  protected readonly archive = async (): Promise<void> => {
    await this.detail.archive();
    this.notify.success(ROOM_DETAIL_TEXT.roomArchived);
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.detail.unarchive();
    this.notify.success(ROOM_DETAIL_TEXT.roomBackInPickers);
  };

  protected readonly restore = async (): Promise<void> => {
    await this.detail.restore();
    this.notify.success(ROOM_DETAIL_TEXT.roomRestored);
  };

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success(ROOM_DETAIL_TEXT.roomDeleted);
    await this.router.navigateByUrl('/clinic/rooms');
  };
}
