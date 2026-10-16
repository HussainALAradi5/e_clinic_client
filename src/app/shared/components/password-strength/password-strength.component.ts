import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { passwordChecks, passwordScore } from '@shared/utils/password';

const BAR_CLASSES = [
  'bg-outline-variant',
  'bg-error',
  'bg-amber-500',
  'bg-amber-500',
  'bg-emerald-600',
];

/** Strength meter + checklist of the server password policy: `<ui-password-strength [value]="password" />`. */
@Component({
  selector: 'ui-password-strength',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: { class: 'block' },
  templateUrl: './password-strength.component.html',
})
export class PasswordStrength {
  readonly value = input<string | null | undefined>('');

  protected readonly checks = computed(() => passwordChecks(this.value() ?? ''));
  protected readonly score = computed(() => passwordScore(this.value() ?? ''));
  protected readonly bars = [1, 2, 3, 4];
  protected barClass(bar: number): string {
    return bar <= this.score() ? BAR_CLASSES[this.score()] : BAR_CLASSES[0];
  }
}
