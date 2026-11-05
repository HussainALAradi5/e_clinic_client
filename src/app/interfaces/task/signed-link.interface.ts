/** Short-lived signed download link (`GET /files?t=…`) — task results and attachments. */
export interface SignedLink {
  url: string;
  expiresAt: string;
}
