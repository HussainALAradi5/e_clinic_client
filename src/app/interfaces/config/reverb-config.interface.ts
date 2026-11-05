/** Where the browser reaches the Reverb websocket server (live chat and tickets). The key is public. */
export interface ReverbConfig {
  key: string;
  host: string;
  port: number;
  scheme: 'http' | 'https';
}
