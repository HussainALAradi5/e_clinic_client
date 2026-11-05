import { ReverbConfig } from '../app/interfaces/config/reverb-config.interface';

export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000',
  /** Local Reverb (php artisan reverb:start). The app key is public; the secret stays on the server. */
  reverb: {
    key: 'e51a81b62540d2866355',
    host: 'localhost',
    port: 8085,
    scheme: 'http',
  } as ReverbConfig | null,
};
