import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Skeleton } from '@components/common/skeleton/skeleton.component';
import { LeaveBalance } from '@interfaces/hr/leave-balance.interface';
import { QtyPipe } from '@pipes/qty.pipe';
import { LeaveApi } from '@services/hr/leave-api.service';
import { LEAVE_BALANCES_TEXT } from '@constants/hr/leave-balances.constants';

/** An employee's leave this year by type: what is left, taken and waiting. */
@Component({
  selector: 'app-leave-balances',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Skeleton, QtyPipe],
  templateUrl: './leave-balances.component.html',
})
export class LeaveBalances {
  protected readonly text = LEAVE_BALANCES_TEXT;

  readonly employeeId = input.required<string>();
  /** Bump to reload (e.g. after a new request). */
  readonly version = input(0);

  private readonly api = inject(LeaveApi);
  protected readonly balances = signal<LeaveBalance[] | null>(null);

  constructor() {
    effect(() => {
      const id = this.employeeId();
      this.version();
      void firstValueFrom(this.api.balances(id)).then((b) => this.balances.set(b));
    });
  }
}
