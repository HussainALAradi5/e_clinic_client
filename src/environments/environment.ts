import { ReverbConfig } from './environment.development';

/**
 * Production: the API origin, set at deploy time (`scripts/set-api-url.mjs`, e.g. https://api.example.com). The API
 * paths have no prefix, so the API needs its own origin: on the site's origin `/patients` would be both a page and
 * an API path.
 */
export const environment = {
  production: true,
  apiUrl: '',
  /** Live updates need a Reverb server; without one the chat refreshes by polling. */
  reverb: null as ReverbConfig | null,
};
