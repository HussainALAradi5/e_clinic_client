import { HttpClient, HttpContext } from '@angular/common/http';
import { effect, inject, Injectable, signal } from '@angular/core';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';
import { finalize, Observable, share } from 'rxjs';
import { environment } from '@env';
import { SKIP_CASE } from '@middlewares/interceptors/http-context';
import { AuthStore } from '@services/auth/auth.store';
import { convertKeys, toCamel } from '@utilities/case';

/**
 * The live connection (Reverb, Pusher protocol). One socket per signed-in session; private channels are joined
 * on first listener and left when the last one unsubscribes. Payloads arrive camelCased like HTTP responses.
 * Without a Reverb config (or before sign-in) `listen` never emits and pages fall back to polling.
 */
@Injectable({ providedIn: 'root' })
export class RealtimeService {
  private readonly http = inject(HttpClient);
  private readonly auth = inject(AuthStore);
  private echo: Echo<'reverb'> | null = null;
  private readonly streams = new Map<string, Observable<unknown>>();

  /** True while the socket is connected (pages poll less when it is). */
  readonly connected = signal(false);

  constructor() {
    // Connect after sign-in, drop the socket on sign-out.
    effect(() => (this.auth.token() ? this.connect() : this.disconnect()));
  }

  /** Events `event` on private channel `channel` (e.g. `user.<id>`, `.message.sent`). */
  listen<T>(channel: string, event: string): Observable<T> {
    const key = `${channel}|${event}`;
    let stream = this.streams.get(key) as Observable<T> | undefined;
    if (!stream) {
      stream = new Observable<T>((subscriber) => {
        // The first listener may come before the sign-in effect has run: connect now.
        if (!this.echo && this.auth.token()) this.connect();
        const echo = this.echo;
        if (!echo) return;
        const handler = (payload: unknown) => subscriber.next(convertKeys(payload, toCamel) as T);
        const joined = echo.private(channel);
        joined.listen(`.${event}`, handler);
        return () => joined.stopListening(`.${event}`, handler);
      }).pipe(
        finalize(() => {
          this.streams.delete(key);
          if (![...this.streams.keys()].some((k) => k.startsWith(`${channel}|`))) {
            this.echo?.leave(channel);
          }
        }),
        share(),
      );
      this.streams.set(key, stream);
    }
    return stream;
  }

  private connect(): void {
    const config = environment.reverb;
    if (!config || this.echo) return;
    (window as unknown as { Pusher: typeof Pusher }).Pusher = Pusher;
    this.echo = new Echo({
      broadcaster: 'reverb',
      key: config.key,
      wsHost: config.host,
      wsPort: config.port,
      wssPort: config.port,
      forceTLS: config.scheme === 'https',
      enabledTransports: ['ws', 'wss'],
      // Channel sign-in with the API token (the interceptors add base URL and Authorization).
      authorizer: (channel: { name: string }) => ({
        authorize: (
          socketId: string,
          callback: (error: Error | null, data: { auth: string } | null) => void,
        ) => {
          this.http
            .post<{ auth: string }>(
              'broadcasting/auth',
              { socket_id: socketId, channel_name: channel.name },
              {
                context: new HttpContext().set(SKIP_CASE, true),
              },
            )
            .subscribe({
              next: (data) => callback(null, data),
              error: (error: Error) => callback(error, null),
            });
        },
      }),
    });
    const pusher = this.echo.connector.pusher;
    pusher.connection.bind('state_change', (states: { current: string }) =>
      this.connected.set(states.current === 'connected'),
    );
  }

  private disconnect(): void {
    this.echo?.disconnect();
    this.echo = null;
    this.streams.clear();
    this.connected.set(false);
  }
}
