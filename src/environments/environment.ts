import { ReverbConfig } from './environment.development';

/** Production: the API is served from the same origin (reverse proxy) — override at deploy time if not. */
export const environment = {
  production: true,
  apiUrl: '',
  /** Live updates need a Reverb server; without one the chat refreshes by polling. */
  reverb: null as ReverbConfig | null,
};
