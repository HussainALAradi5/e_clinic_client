import { ClockTimes } from '@utilities/clock-time';

describe('ClockTimes', () => {
  it('reads 24-hour values on the 12-hour clock, midnight and noon included', () => {
    expect(ClockTimes.parse('16:05')).toEqual({ hour: 4, minute: 5, pm: true });
    expect(ClockTimes.parse('00:30')).toEqual({ hour: 12, minute: 30, pm: false });
    expect(ClockTimes.parse('12:00:00')).toEqual({ hour: 12, minute: 0, pm: true });
    expect(ClockTimes.parse('')).toEqual({ hour: 9, minute: 0, pm: false });
  });

  it('writes back 24-hour values and AM / PM labels', () => {
    expect(ClockTimes.toValue({ hour: 12, minute: 0, pm: false })).toBe('00:00');
    expect(ClockTimes.toValue({ hour: 12, minute: 15, pm: true })).toBe('12:15');
    expect(ClockTimes.toValue({ hour: 4, minute: 5, pm: true })).toBe('16:05');
    expect(ClockTimes.label('08:27')).toBe('8:27 AM');
    expect(ClockTimes.label('23:59')).toBe('11:59 PM');
    expect(ClockTimes.label(null)).toBe('');
  });
});
