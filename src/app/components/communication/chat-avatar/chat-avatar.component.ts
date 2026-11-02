import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { initials, tintFor } from '@utilities/communication/chat-style';

/** Profile photo, or initials on a steady colour; a group shows the group icon. */
@Component({
  selector: 'app-chat-avatar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  template: `
    <span
      class="avatar"
      [style.width.px]="size()"
      [style.height.px]="size()"
      [style.font-size.px]="size() * 0.4"
      [style.background]="url() && !failed() ? 'transparent' : tint()"
      [attr.aria-label]="name()"
      role="img"
    >
      @if (url() && !failed()) {
        <img [src]="url()" [alt]="name()" (error)="failed.set(true)" />
      } @else if (group()) {
        <mat-icon
          [style.font-size.px]="size() * 0.55"
          [style.width.px]="size() * 0.55"
          [style.height.px]="size() * 0.55"
          >groups</mat-icon
        >
      } @else {
        {{ letters() }}
      }
    </span>
  `,
  styles: `
    .avatar {
      display: inline-flex;
      flex-shrink: 0;
      align-items: center;
      justify-content: center;
      overflow: hidden;
      border-radius: 9999px;
      color: #fff;
      font-weight: 600;
      letter-spacing: 0.02em;
      user-select: none;
    }
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  `,
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
