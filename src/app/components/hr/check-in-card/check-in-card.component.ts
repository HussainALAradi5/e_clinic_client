import { ClockPipe } from '@pipes/clock.pipe';
import { timeFormat } from '@utilities/clock-format';
import { DatePipe } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { firstValueFrom } from 'rxjs';
import { HrActions } from '@services/hr/hr-actions.service';
import { AppButton } from '@components/common/app-button/app-button.component';
import { StatusChip } from '@components/common/status-chip/status-chip.component';
import { ButtonVariant } from '@enums/ui/button.enum';
import { AttendanceToday } from '@interfaces/hr/attendance-today.interface';
import { AttendanceApi } from '@services/hr/attendance-api.service';
import { CHECK_IN_CARD_TEXT } from '@constants/hr/check-in-card.constants';

/** Today at work: the shift, check-in / check-out (clinic network only) and minutes late or over. */
@Component({
  selector: 'app-check-in-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ClockPipe, MatCardModule, MatIconModule, AppButton, StatusChip, DatePipe],
  templateUrl: './check-in-card.component.html',
})
export class CheckInCard implements OnInit {
  private readonly api = inject(AttendanceApi);
  private readonly actions = inject(HrActions);

  protected readonly text = CHECK_IN_CARD_TEXT;
  protected readonly today = signal<AttendanceToday | null>(null);
  protected readonly variants = ButtonVariant;
  protected readonly timeFormat = timeFormat;
  protected readonly zone = '+0300';

  protected readonly day = computed(() => this.today()?.attendance ?? null);
  protected readonly canCheckIn = computed(() => !this.day()?.checkInAt);
  protected readonly canCheckOut = computed(
    () => !!this.day()?.checkInAt && !this.day()?.checkOutAt,
  );

  async ngOnInit(): Promise<void> {
    await this.load();
  }

  protected async load(): Promise<void> {
    this.today.set(await firstValueFrom(this.api.today()));
  }

  protected readonly checkIn = async (): Promise<void> => {
    await this.actions.checkIn();
    await this.load();
  };

  protected readonly checkOut = async (): Promise<void> => {
    await this.actions.checkOut();
    await this.load();
  };
}
