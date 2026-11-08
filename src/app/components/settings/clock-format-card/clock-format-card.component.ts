import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { CLOCK_FORMAT_TEXT } from '@constants/settings/clock-format-card.constants';
import { TimeFormat } from '@enums/identity/time-format.enum';
import { AuthStore } from '@services/auth/auth.store';
import { AuthApi } from '@services/identity/auth-api.service';
import { NotifyService } from '@services/ui/notify.service';
import { DEFAULT_TIME_FORMAT } from '@utilities/clock-format';

/** Account page card: read times on the 12-hour clock (the default) or the 24-hour clock. */
@Component({
  selector: 'app-clock-format-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './clock-format-card.component.html',
})
export class ClockFormatCard {
  private readonly store = inject(AuthStore);
  private readonly api = inject(AuthApi);
  private readonly notify = inject(NotifyService);

  protected readonly text = CLOCK_FORMAT_TEXT;
  protected readonly choices = Object.values(TimeFormat);
  protected readonly selected = computed(
    () => this.store.user()?.timeFormat ?? DEFAULT_TIME_FORMAT,
  );

  protected choose(timeFormat: TimeFormat): void {
    const user = this.store.user();
    if (!user || timeFormat === this.selected()) {
      return;
    }
    this.api.setTimeFormat(timeFormat).subscribe(() => {
      this.store.setUser({ ...user, timeFormat });
      this.notify.success(this.text.saved);
    });
  }
}
