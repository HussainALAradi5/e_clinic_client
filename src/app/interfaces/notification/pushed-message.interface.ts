/** What the service worker posts to open tabs for each pushed message (public/push-sw.js). */
export interface PushedMessage {
  type: 'clinic-push';
  template?: string;
}
