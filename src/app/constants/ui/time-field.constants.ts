import { TimePickerStyle } from '@enums/ui/time-picker-style.enum';

/** Android-style clock dial unless the user chose the wheels. */
export const DEFAULT_TIME_PICKER_STYLE = TimePickerStyle.Dial;

/** Minutes offered by the pickers (every 5 minutes; typed values keep any minute). */
export const TIME_MINUTE_STEP = 5;

/** Text of common/time-field, the time picker dialog and the account page's time picker card. */
export const TIME_FIELD_TEXT = {
  pick: 'Pick a time',
  set: 'Set',
  cancel: 'Cancel',
  clear: 'Clear',
  am: 'AM',
  pm: 'PM',
  hours: 'Hours',
  minutes: 'Minutes',
  cardTitle: 'Time picker',
  cardHint: 'How time fields open on this browser.',
  styles: {
    [TimePickerStyle.Wheel]: { label: 'Wheels (iPhone style)', icon: 'view_day' },
    [TimePickerStyle.Dial]: { label: 'Clock dial (Android style)', icon: 'schedule' },
  },
};
