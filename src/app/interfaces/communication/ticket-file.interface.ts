export interface TicketFile {
  id: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  scanStatus: string;
  /** Short-lived link; null until the file passed the scan. */
  url: string | null;
}
