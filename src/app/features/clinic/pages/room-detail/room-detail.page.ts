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
import { AppointmentRows } from '../../components/appointment-rows/appointment-rows.component';
import { RoomFormDialog } from '../../components/room-form-dialog/room-form-dialog.component';
import { RoomFormDialogData } from '../../interfaces/dialog-data.interface';
import { HasAccessDirective } from '@core/directives/has-access.directive';
import { AppButton } from '@shared/components/app-button/app-button.component';
import { AuditHistory } from '@shared/components/audit-history/audit-history.component';
import { EntityActions } from '@shared/components/entity-actions/entity-actions.component';
import { ErrorState } from '@shared/components/error-state/error-state.component';
import { Facts } from '@shared/components/facts/facts.component';
import { PageHeader } from '@shared/components/page-header/page-header.component';
import { Skeleton } from '@shared/components/skeleton/skeleton.component';
import { TextField } from '@shared/components/text-field/text-field.component';
import { ButtonVariant } from '@shared/enums/ui/button.enum';
import { Appointment } from '@shared/interfaces/clinic/appointment.interface';
import { Room } from '@shared/interfaces/clinic/room.interface';
import { Fact } from '@shared/interfaces/ui/fact.interface';
import { EnumLabelPipe } from '@shared/pipes/enum-label.pipe';
import { RoomApi } from '@shared/services/clinic/room-api.service';
import { EntityDetail } from '@shared/services/data/entity-detail';
import { EnumService } from '@shared/services/data/enum.service';
import { DialogService } from '@shared/services/ui/dialog.service';
import { NotifyService } from '@shared/services/ui/notify.service';
import { clinicIsoDate } from '@shared/utils/clinic-time';

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
      { label: 'Code', value: r.code, mono: true },
      { label: 'Type', value: this.enums.label('RoomType', r.type) },
      { label: 'Department', value: r.department?.name },
      { label: 'Floor', value: r.floor },
      { label: 'Capacity', value: r.capacity },
      {
        label: 'Status',
        value: r.isInService ? 'In service' : `Out of service — ${r.outOfServiceReason ?? ''}`,
      },
      { label: 'Equipment / notes', value: r.notes },
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
      title: 'Take this room out of service?',
      message:
        'It disappears from booking. Existing bookings stay — you get the list to move them.',
      confirmLabel: 'Out of service',
    });
    if (reason === null) return;
    const result = await firstValueFrom(this.api.setInService(this.id(), false, reason));
    this.detail.set(result);
    this.affected.set(result.affectedAppointments);
    this.notify.success(
      result.affectedAppointments.length
        ? `Room out of service — ${result.affectedAppointments.length} booking(s) to move.`
        : 'Room out of service.',
    );
  };

  protected readonly backInService = async (): Promise<void> => {
    const result = await firstValueFrom(this.api.setInService(this.id(), true));
    this.detail.set(result);
    this.affected.set([]);
    this.notify.success('Room back in service.');
  };

  protected readonly edit = async (): Promise<void> => {
    const saved = await this.dialogs.open<RoomFormDialog, RoomFormDialogData, Room>(
      RoomFormDialog,
      { room: this.detail.record(), save: (payload) => this.detail.update(payload) },
      { width: '600px' },
    );
    if (saved) this.notify.success('Room saved.');
  };

  protected readonly archive = async (): Promise<void> => {
    await this.detail.archive();
    this.notify.success('Room archived.');
  };

  protected readonly unarchive = async (): Promise<void> => {
    await this.detail.unarchive();
    this.notify.success('Room back in pickers.');
  };

  protected readonly restore = async (): Promise<void> => {
    await this.detail.restore();
    this.notify.success('Room restored.');
  };

  protected readonly remove = async (): Promise<void> => {
    await this.detail.remove();
    this.notify.success('Room deleted.');
    await this.router.navigateByUrl('/clinic/rooms');
  };
}
