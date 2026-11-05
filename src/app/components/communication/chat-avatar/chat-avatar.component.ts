import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { initials, tintFor } from '@utilities/communication/chat-style';

/** Profile photo, or initials on a steady colour; a group shows the group icon. */
@Component({
  selector: 'app-chat-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  templateUrl: './chat-avatar.component.html',
  styleUrl: './chat-avatar.component.scss',
})
export class ChatAvatar {
  readonly name = input.required<string>();
  readonly id = input<string>('');
  readonly url = input<string | null>(null);
  readonly size = input(40);
  readonly group = input(false);

  protected readonly failed = signal(false);
  protected readonly letters = computed(() => initials(this.name()));
  protected readonly tint = computed(() => tintFor(this.id() || this.name()));
}
