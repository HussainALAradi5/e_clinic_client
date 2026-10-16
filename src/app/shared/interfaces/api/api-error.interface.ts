/**
 * Error envelope (ApiExceptionRenderer) normalised by the error interceptor.
 * Switch on `code` (stable error_code), never on message text.
 */
export interface ApiError {
  status: number;
  code: string;
  message: string;
  errors: Record<string, string[]> | null;
  meta: Record<string, unknown> | null;
  requestId: string | null;
}
