import { BubbleColor } from '@enums/communication/bubble-color.enum';
import { BubbleStyle } from '@enums/communication/bubble-style.enum';

export interface ChatSettings {
  bubbleStyle: BubbleStyle;
  myColor: BubbleColor;
  othersColor: BubbleColor;
  /** New messages pop up as toasts. */
  notifyMessages: boolean;
  /** Unread chat messages count in the chat badge. */
  countInBadge: boolean;
  /** The quick reaction row (read-only). */
  reactions: string[];
  /** Everything behind "+" (read-only). */
  allReactions: string[];
}
