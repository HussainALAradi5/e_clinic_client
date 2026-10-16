/** Success envelope (ApiResponse trait): `{ success, message, data, meta?, links? }`. */
export interface ApiEnvelope<T, M = unknown> {
  success: true;
  message: string | null;
  data: T;
  meta?: M;
  links?: { next: string | null; prev: string | null };
}
