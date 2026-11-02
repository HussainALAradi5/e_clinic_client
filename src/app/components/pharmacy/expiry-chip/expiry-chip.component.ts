import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { statusTone, TONE_CLASSES } from '@constants/status-tones.constants';
import { ExpiryStatus } from '@enums/pharmacy/expiry-status.enum';

const LABELS: Record<ExpiryStatus, string> = {
  [ExpiryStatus.Ok]: 'In date',
  [ExpiryStatus.Expiring]: 'Expires soon',
  [ExpiryStatus.Expired]: 'Expired',
};

/** `<app-expiry-chip [status]="lot.expiryStatus" />` — in date / expires soon / expired, in the status colours. */
@Component({
  selector: 'app-expiry-chip',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'inline-flex' },
  templateUrl: './expiry-chip.component.html',
})
export class ExpiryChip {
  readonly status = input.required<ExpiryStatus>();

  protected readonly label = computed(() => LABELS[this.status()]);
  protected readonly classes = computed(
    () => TONE_CLASSES[statusTone('ExpiryStatus', this.status())],
  );
}
