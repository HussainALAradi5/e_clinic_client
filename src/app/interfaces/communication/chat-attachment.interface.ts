export interface ChatAttachment {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  /** Short-lived link; null until the file passed the scan. */
  url: string | null;
}
