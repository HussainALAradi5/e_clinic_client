import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { NOTIFICATION_KIND_ICONS } from '@constants/notification/notification-kinds.constants';
import { TONE_CLASSES, TONE_DOT_CLASSES } from '@constants/status-tones.constants';
import { EnumService } from '@services/data/enum.service';
import { notificationKindOf } from '@utilities/notification-kind';

/** `<app-notification-kind-icon [template]="n.template" [unread]="!n.readAt" />` — the message's kind as a coloured round icon. */
@Component({
  selector: 'app-notification-kind-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [MatIconModule],
  host: { class: 'inline-flex shrink-0' },
  template: `<span
    class="inline-flex size-9 items-center justify-center rounded-full"
    [class]="classes()"
    aria-hidden="true"
    ><mat-icon class="!text-[20px]">{{ icon() }}</mat-icon></span
  >`,
})
export class NotificationKindIcon {
  readonly template = input<string | null | undefined>(null);
  readonly unread = input(true);

  private readonly enums = inject(EnumService);
  private readonly kind = computed(() => notificationKindOf(this.template()));
  protected readonly icon = computed(() => NOTIFICATION_KIND_ICONS[this.kind()]);
  /** Unread: the strong colour with a white icon; read: the soft chip colours. */
  protected readonly classes = computed(() => {
    const tone = this.enums.tone('NotificationKind', this.kind());
    return this.unread() ? `${TONE_DOT_CLASSES[tone]} text-white` : TONE_CLASSES[tone];
  });
}
