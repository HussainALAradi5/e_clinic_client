import { effect, Injectable, signal } from '@angular/core';
import { STORAGE_KEYS } from '@constants/app.constants';
import { DEFAULT_TIME_PICKER_STYLE } from '@constants/ui/time-field.constants';
import { TimePickerStyle } from '@enums/ui/time-picker-style.enum';

/** The user's choice of time picker (wheels or dial), kept per browser like the theme; the dial by default. */
@Injectable({ providedIn: 'root' })
export class TimePickerPreference {
  readonly style = signal<TimePickerStyle>(this.read());

  constructor() {
    effect(() => {
      try {
        localStorage.setItem(STORAGE_KEYS.timePicker, this.style());
      } catch {
        /* storage unavailable: the choice lasts for this visit */
      }
    });
  }

  private read(): TimePickerStyle {
    try {
      const stored = localStorage.getItem(STORAGE_KEYS.timePicker);
      return Object.values(TimePickerStyle).includes(stored as TimePickerStyle)
        ? (stored as TimePickerStyle)
        : DEFAULT_TIME_PICKER_STYLE;
    } catch {
      return DEFAULT_TIME_PICKER_STYLE;
    }
  }
}
