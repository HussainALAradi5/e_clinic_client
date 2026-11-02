import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { BubbleColor } from '@enums/communication/bubble-color.enum';
import { BubbleStyle } from '@enums/communication/bubble-style.enum';
import { ChatSettings } from '@interfaces/communication/chat-settings.interface';
import { ChatApi } from './chat-api.service';

const DEFAULTS: ChatSettings = {
  bubbleStyle: BubbleStyle.Rounded,
  myColor: BubbleColor.Blue,
  othersColor: BubbleColor.Green,
  notifyMessages: true,
  countInBadge: true,
  reactions: ['👍', '❤️', '😂', '😮', '😢', '🙏'],
  allReactions: ['👍', '❤️', '😂', '😮', '😢', '🙏'],
};

/** My chat settings, loaded once per session and shared by the chat page and the toolbar badge. */
@Injectable({ providedIn: 'root' })
export class ChatSettingsStore {
  private readonly api = inject(ChatApi);
  private loaded = false;

  readonly settings = signal<ChatSettings>(DEFAULTS);

  load(): void {
    if (this.loaded) return;
    this.loaded = true;
    this.api.settings().subscribe({
      next: (s) => this.settings.set(s),
      error: () => (this.loaded = false),
    });
  }

  save(values: Partial<ChatSettings>): Observable<ChatSettings> {
    this.settings.update((s) => ({ ...s, ...values }));
    return this.api.saveSettings(values).pipe(tap((s) => this.settings.set(s)));
  }

  reset(): void {
    this.loaded = false;
    this.settings.set(DEFAULTS);
  }
}
