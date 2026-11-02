/** What the composer sends: text, files (or a voice note) and the members it @mentions. */
export interface SendMessagePayload {
  body?: string;
  files?: File[];
  voice?: boolean;
  mentions?: string[];
  /** The message this one answers. */
  replyToId?: string;
}
