/** Short-lived signed download link (`GET /api/v1/files?t=…`) — task results and attachments. */
export interface SignedLink {
  url: string;
  expiresAt: string;
}
