import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  signal,
} from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ScheduleExceptionDialog } from '@components/clinic/schedule-exception-dialog/schedule-exception-dialog.component';
import { ScheduleExceptionDialogData } from '@interfaces/clinic/schedule-exception-dialog-data.interface';
import { WEEK_DAYS } from '@utilities/clinic/schedule';
import { AppButton } from '@components/common/app-button/app-button.component';
import { GenericForm } from '@components/common/generic-form/generic-form.component';
import { PageHeader } from '@components/common/page-header/page-header.component';
import { TextField } from '@components/common/text-field/text-field.component';
import { DATE_FORMAT } from '@constants/app.constants';
import { ErrorCode } from '@enums/api/error-code.enum';
import { ButtonVariant } from '@enums/ui/button.enum';
import { AffectedBooking } from '@interfaces/clinic/affected-booking.interface';
import { ScheduleBlock } from '@interfaces/clinic/schedule.interface';
import { ScheduleException } from '@interfaces/clinic/schedule-exception.interface';
import { EnumLabelPipe } from '@pipes/enum-label.pipe';
import { AccessService } from '@services/auth/access.service';
import { DoctorApi } from '@services/clinic/doctor-api.service';
import { ScheduleApi } from '@services/clinic/schedule-api.service';
import { EnumService } from '@services/data/enum.service';
import { DialogService } from '@services/ui/dialog.service';
import { NotifyService } from '@services/ui/notify.service';
import { clinicIsoDate } from '@utilities/clinic-time';
import { isApiError } from '@utilities/guards';
import { BlockForm } from '@interfaces/clinic/schedule-editor.interface';
import { SCHEDULE_EDITOR_TEXT } from '@constants/clinic/schedule-editor.constants';

/** Days ahead the exception list covers (server allows 92). */
const EXCEPTION_DAYS = 90;

/**
 * `/clinic/providers/:providerId/schedule` — weekly working blocks per day (from a date onward) and the days off,
 * special hours and holidays of the next three months.
 */
@Component({
  selector: 'app-schedule-editor-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    PageHeader,
    GenericForm,
    TextField,
    AppButton,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    RouterLink,
    DatePipe,
    EnumLabelPipe,
  ],
  templateUrl: './schedule-editor.page.html',
})
export class ScheduleEditorPage implements OnInit {
  protected readonly text = SCHEDULE_EDITOR_TEXT;

  readonly providerId = input.required<string>();

  private readonly api = inject(ScheduleApi);
  private readonly doctors = inject(DoctorApi);
  private readonly dialogs = inject(DialogService);
  private readonly notify = inject(NotifyService);
  private readonly enums = inject(EnumService);
  protected readonly canEdit = inject(AccessService).can('schedules.write');

  protected readonly name = signal<string>(SCHEDULE_EDITOR_TEXT.weeklySchedule);
  /** Computed: the enum catalog may still be loading on a direct visit. */
  protected readonly days = computed(() =>
    WEEK_DAYS.map((d) => ({
      value: d,
      label: this.enums.label('DayOfWeek', d),
    })),
  );
  protected readonly blocks = new FormArray<BlockForm>([]);
  protected readonly form = new FormGroup({
    effectiveFrom: new FormControl(clinicIsoDate(), {
      nonNullable: true,
      validators: [Validators.required],
    }),
    blocks: this.blocks,
  });
  protected readonly exceptions = signal<ScheduleException[]>([]);
  protected readonly conflicts = signal<AffectedBooking[]>([]);
  protected readonly variants = ButtonVariant;
  protected readonly dateFormat = DATE_FORMAT;
  /** Re-evaluated on every add / remove (FormArray is not a signal). */
  private readonly version = signal(0);
  protected readonly byDay = computed(() => {
    this.version();
    return WEEK_DAYS.map((day) =>
      this.blocks.controls.filter((c) => c.controls.dayOfWeek.value === day),
    );
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    const doctor = await firstValueFrom(this.doctors.get(this.providerId())).catch(() => null);
    if (doctor) this.name.set(doctor.displayName);
    this.setBlocks(await firstValueFrom(this.api.week(this.providerId())));
    await this.loadExceptions();
  }

  protected addBlock(day: number, start = '08:00', end = '13:00'): void {
    this.blocks.push(
      this.blockForm({ dayOfWeek: day, startTime: start, endTime: end, slotMinutes: null }),
    );
    this.changed();
  }

  protected removeBlock(block: BlockForm): void {
    this.blocks.removeAt(this.blocks.controls.indexOf(block));
    this.changed();
  }

  /** Sunday's hours for Monday–Thursday (the usual clinic week). */
  protected copySundayToWeekdays(): void {
    const sunday = this.byDay()[0].map((b) => b.getRawValue());
    for (const day of [1, 2, 3, 4]) {
      for (const block of this.byDay()[day])
        this.blocks.removeAt(this.blocks.controls.indexOf(block));
      for (const b of sunday) this.blocks.push(this.blockForm({ ...b, dayOfWeek: day }));
    }
    this.changed();
  }

  protected readonly save = async (): Promise<void> => {
    this.conflicts.set([]);
    try {
      const v = this.form.getRawValue();
      this.setBlocks(
        await firstValueFrom(
          this.api.replaceWeek(this.providerId(), {
            effectiveFrom: v.effectiveFrom,
            blocks: v.blocks,
          }),
        ),
      );
      this.notify.success(SCHEDULE_EDITOR_TEXT.scheduleSavedFrom(v.effectiveFrom));
    } catch (error) {
      if (isApiError(error) && error.code === ErrorCode.ScheduleHasAppointments) {
        this.conflicts.set((error.meta?.['appointments'] as AffectedBooking[] | undefined) ?? []);
      }
      throw error;
    }
  };

  protected readonly addException = async (): Promise<void> => {
    const added = await this.dialogs.open<
      ScheduleExceptionDialog,
      ScheduleExceptionDialogData,
      ScheduleException
    >(ScheduleExceptionDialog, { providerId: this.providerId() }, { width: '560px' });
    if (added) {
      this.notify.success(SCHEDULE_EDITOR_TEXT.savedFreeTimesFollowThe);
      await this.loadExceptions();
    }
  };

  protected readonly removeException = async (exception: ScheduleException): Promise<void> => {
    await firstValueFrom(this.api.removeException(this.providerId(), exception.id));
    this.notify.success(SCHEDULE_EDITOR_TEXT.removedTheUsualHoursApply);
    await this.loadExceptions();
  };

  private async loadExceptions(): Promise<void> {
    const from = clinicIsoDate();
    const to = clinicIsoDate(new Date(Date.now() + EXCEPTION_DAYS * 86_400_000));
    this.exceptions.set(
      await firstValueFrom(this.api.exceptions(this.providerId(), from, to)).catch(() => []),
    );
  }

  private setBlocks(blocks: ScheduleBlock[]): void {
    this.blocks.clear();
    for (const b of blocks) this.blocks.push(this.blockForm(b));
    if (!this.canEdit) this.form.disable();
    this.form.markAsPristine();
    this.changed();
  }

  private blockForm(
    b: Pick<ScheduleBlock, 'dayOfWeek' | 'startTime' | 'endTime' | 'slotMinutes'>,
  ): BlockForm {
    return new FormGroup({
      dayOfWeek: new FormControl(b.dayOfWeek, { nonNullable: true }),
      startTime: new FormControl(b.startTime, {
        nonNullable: true,
        validators: [Validators.required],
      }),
      endTime: new FormControl(b.endTime, { nonNullable: true, validators: [Validators.required] }),
      slotMinutes: new FormControl<number | null>(b.slotMinutes, [
        Validators.min(5),
        Validators.max(240),
      ]),
    });
  }

  private changed(): void {
    this.blocks.markAsDirty();
    this.version.update((v) => v + 1);
  }
}
