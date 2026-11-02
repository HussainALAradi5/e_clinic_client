import { clinicClock, openingStatus } from '@utilities/opening-hours';
import { CLINIC_INFO } from '@constants/clinic-info.constants';

/** Instants are UTC; Bahrain is UTC+3. 2026-10-15 is a Thursday, 2026-10-16 a Friday. */
describe('opening hours', () => {
  it('reads weekday and time in the clinic time zone', () => {
    expect(clinicClock(new Date('2026-10-15T21:30:00Z'))).toEqual({ day: 5, time: '00:30' });
  });

  it('is open on a Thursday morning until 21:00', () => {
    expect(openingStatus(CLINIC_INFO.hours, new Date('2026-10-15T07:00:00Z'))).toEqual({
      open: true,
      closesAt: '21:00',
      nextOpen: null,
    });
  });

  it('opens Friday afternoon when closed on Friday morning', () => {
    expect(openingStatus(CLINIC_INFO.hours, new Date('2026-10-16T06:00:00Z')).nextOpen).toEqual({
      day: 5,
      time: '16:00',
    });
  });

  it('points to Saturday morning after Friday closing time', () => {
    expect(openingStatus(CLINIC_INFO.hours, new Date('2026-10-16T19:00:00Z')).nextOpen).toEqual({
      day: 6,
      time: '08:00',
    });
  });
});
