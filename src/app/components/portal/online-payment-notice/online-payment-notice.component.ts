import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  inject,
  OnInit,
  output,
  signal,
} from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ONLINE_PAY_TEXT, ONLINE_RESULT } from '@constants/portal/online-payment.constants';
import { OnlinePaymentStatus } from '@enums/billing/online-payment-status.enum';
import { OnlinePaymentApi } from '@services/billing/online-payment-api.service';

/**
 * The outcome banner after the patient returns from the payment page (`?online=<id>&status=…`). The status in the
 * URL is only a hint: the server is asked, and while it still confirms the banner checks again every few seconds.
 * Emits `settled` once the payment is final so the invoices reload.
 */
@Component({
  selector: 'app-online-payment-notice',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: { class: 'block' },
  template: `
    @if (result(); as r) {
      <div
        class="motion-rise flex items-start gap-3 rounded-2xl px-4 py-3"
        [class]="tone()"
        role="status"
        aria-live="polite"
      >
        <mat-icon class="shrink-0" [class.animate-pulse]="waiting()">{{ r.icon }}</mat-icon>
        <span>
          <strong class="block">{{ r.title }}</strong>
          <span class="text-sm">{{ r.message }}</span>
        </span>
      </div>
    }
  `,
})
export class OnlinePaymentNotice implements OnInit {
  readonly settled = output<void>();

  private readonly api = inject(OnlinePaymentApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);
  private readonly status = signal<OnlinePaymentStatus | null>(null);
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly result = computed(() => {
    const status = this.status();
    return status ? ONLINE_RESULT[status] : null;
  });
  protected readonly waiting = computed(() => this.status() === OnlinePaymentStatus.Initiated);
  protected readonly tone = computed(() =>
    this.status() === OnlinePaymentStatus.Captured
      ? 'bg-primary-container text-on-primary-container'
      : this.waiting()
        ? 'bg-surface-container text-on-surface'
        : 'bg-error-container text-on-error-container',
  );

  ngOnInit(): void {
    const id = this.route.snapshot.queryParamMap.get('online');
    if (!id) return;
    this.status.set(OnlinePaymentStatus.Initiated);
    this.destroyRef.onDestroy(() => clearTimeout(this.timer));
    // Drop the query so a reload does not show the banner again.
    void this.router.navigate([], { queryParams: {}, replaceUrl: true });
    void this.check(id, ONLINE_PAY_TEXT.pollTries);
  }

  private async check(id: string, triesLeft: number): Promise<void> {
    const online = await firstValueFrom(this.api.get(id)).catch(() => null);
    if (!online) {
      this.status.set(null);
      return;
    }
    this.status.set(online.status);
    if (online.status !== OnlinePaymentStatus.Initiated) {
      this.settled.emit();
      return;
    }
    if (triesLeft > 1) {
      this.timer = setTimeout(
        () => void this.check(id, triesLeft - 1),
        ONLINE_PAY_TEXT.pollSeconds * 1000,
      );
    }
  }
}
