import { TimeFormat } from '@enums/identity/time-format.enum';

/** Text of settings/clock-format-card. */
export const CLOCK_FORMAT_TEXT = {
  title: 'Time format',
  hint: 'How times read across the system, on the web and on your phone.',
  saved: 'Time format saved.',
  choices: {
    [TimeFormat.TwelveHour]: { label: '12-hour', example: '2:30 PM' },
    [TimeFormat.TwentyFourHour]: { label: '24-hour', example: '14:30' },
  },
};
