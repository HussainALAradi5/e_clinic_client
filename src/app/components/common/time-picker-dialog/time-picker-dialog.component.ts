import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { TimeDial } from '@components/common/time-dial/time-dial.component';
import { TimeWheel } from '@components/common/time-wheel/time-wheel.component';
import { TIME_FIELD_TEXT } from '@constants/ui/time-field.constants';
import { TimePickerStyle } from '@enums/ui/time-picker-style.enum';
import { TimePickerDialogData } from '@interfaces/ui/time-picker-dialog-data.interface';
import { TimePickerPreference } from '@services/ui/time-picker-preference.service';
import { ClockTimes } from '@utilities/clock-time';

/**
 * Picks a time with the user's style (wheels or dial). Closes with "HH:mm", "" when cleared, or nothing when
 * cancelled.
 */
@Component({
  selector: 'app-time-picker-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatButtonModule, MatDialogModule, TimeDial, TimeWheel],
  templateUrl: './time-picker-dialog.component.html',
})
export class TimePickerDialog {
  protected readonly data = inject<TimePickerDialogData>(MAT_DIALOG_DATA);
  protected readonly ref = inject(MatDialogRef<TimePickerDialog, string>);
  protected readonly style = inject(TimePickerPreference).style;

  protected readonly text = TIME_FIELD_TEXT;
  protected readonly styles = TimePickerStyle;
  protected readonly time = signal(ClockTimes.parse(this.data.value));

  protected set(): void {
    this.ref.close(ClockTimes.toValue(this.time()));
  }
}
