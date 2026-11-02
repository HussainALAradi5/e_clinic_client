import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';
import { BubbleColor } from '@enums/communication/bubble-color.enum';
import { BubbleStyle } from '@enums/communication/bubble-style.enum';
import { ChatSettings } from '@interfaces/communication/chat-settings.interface';
import { ChatSettingsStore } from '@services/communication/chat-settings.store';
import { NotifyService } from '@services/ui/notify.service';
import { BUBBLE_COLORS, LEADER_BUBBLE } from '@utilities/communication/chat-style';

/** Chat settings: notifications switches and how bubbles look, with a live preview. Saves on every change. */
@Component({
  selector: 'app-chat-settings-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    MatButtonModule,
    MatDialogModule,
    MatIconModule,
    MatSlideToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './chat-settings-dialog.component.html',
  styleUrl: './chat-settings-dialog.component.scss',
})
export class ChatSettingsDialog {
  private readonly store = inject(ChatSettingsStore);
  private readonly notify = inject(NotifyService);

  protected readonly settings = this.store.settings;
  protected readonly colors = Object.values(BubbleColor).map((value) => ({
    value,
    ...BUBBLE_COLORS[value],
  }));
  protected readonly styles = [
    { value: BubbleStyle.Rounded, label: 'Rounded', icon: 'chat_bubble' },
    { value: BubbleStyle.Square, label: 'Square', icon: 'crop_square' },
    { value: BubbleStyle.Minimal, label: 'Minimal', icon: 'notes' },
  ];
  protected readonly leader = LEADER_BUBBLE;
  protected readonly mine = computed(() => BUBBLE_COLORS[this.settings().myColor]);
  protected readonly others = computed(() => BUBBLE_COLORS[this.settings().othersColor]);

  protected set(values: Partial<ChatSettings>): void {
    this.store.save(values).subscribe({ error: (e: unknown) => this.notify.error(e) });
  }
}
