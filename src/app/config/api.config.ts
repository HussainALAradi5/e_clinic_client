import { environment } from '@env';

/** API server origin, from the environment files (`src/environments`, set per build). */
export const API_BASE_URL = environment.apiUrl;

/** Every endpoint in `config/endpoints.ts` lives under this prefix. */
export const API_PREFIX = '/api/v1/';

/** Full URL of an API path (`API_BASE_URL` + `API_PREFIX` + path). */
export const apiUrl = (path: string): string =>
  API_BASE_URL + API_PREFIX + path.replace(/^\/+/, '');
