import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { TimeFormat } from '@enums/identity/time-format.enum';
import { User } from '@interfaces/identity/user.interface';
import { AuthStore } from '@services/auth/auth.store';
import { AuthApi } from '@services/identity/auth-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { clockFormat, dateTimeFormat, wallClock } from '@utilities/clock-format';
import { ClockFormatCard } from './clock-format-card.component';

describe('ClockFormatCard', () => {
  afterEach(() => clockFormat.set(TimeFormat.TwelveHour));

  it('reads 12-hour by default and switches every time once 24-hour is chosen and saved', () => {
    const setTimeFormat = vi.fn(() => of(undefined));
    TestBed.configureTestingModule({
      providers: [
        { provide: AuthApi, useValue: { setTimeFormat } },
        { provide: NotifyService, useValue: { success: vi.fn() } },
      ],
    });
    TestBed.inject(AuthStore).setUser({ id: 'u1' } as User);
    expect(wallClock('16:05:00')).toBe('4:05 PM');

    const fixture = TestBed.createComponent(ClockFormatCard);
    fixture.detectChanges();
    const buttons = (fixture.nativeElement as HTMLElement).querySelectorAll('button');
    buttons[1].click();

    expect(setTimeFormat).toHaveBeenCalledWith(TimeFormat.TwentyFourHour);
    expect(wallClock('16:05:00')).toBe('16:05');
    expect(dateTimeFormat()).toContain('HH:mm');
  });
});
