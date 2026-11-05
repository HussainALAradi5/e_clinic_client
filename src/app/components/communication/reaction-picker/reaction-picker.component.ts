import { ChangeDetectionStrategy, Component, input, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { REACTION_PICKER_TEXT } from '@constants/communication/reaction-picker.constants';
import { TapMotionDirective } from '@directives/tap-motion.directive';

/**
 * The bar over (or under) a message: Reply, the quick emojis, "+" for the full grid, and Copy when the message has
 * text. My current reaction is ringed; picking it again takes it back.
 */
@Component({
  selector: 'app-reaction-picker',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule, TapMotionDirective],
  templateUrl: './reaction-picker.component.html',
  styleUrl: './reaction-picker.component.scss',
  host: {
    class: 'picker glass',
    role: 'menu',
    '[class.below]': 'below()',
    '[attr.aria-label]': 'text.react',
  },
})
export class ReactionPicker {
  readonly quick = input.required<string[]>();
  /** Emojis behind "+", not already in the quick row. */
  readonly extra = input<string[]>([]);
  readonly chosen = input<string | null>(null);
  /** Open under the message (no room above it). */
  readonly below = input(false);
  /** The message has text to copy. */
  readonly canCopy = input(false);
  readonly reply = output<void>();
  readonly picked = output<string>();
  readonly copy = output<void>();

  protected readonly text = REACTION_PICKER_TEXT;
  /** The full emoji grid behind "+". */
  protected readonly more = signal(false);
}
