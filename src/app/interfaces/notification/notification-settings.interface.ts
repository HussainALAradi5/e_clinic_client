/** GET /notifications/settings — the person's phone and browser notifications switch, and the Web Push key. */
export interface NotificationSettings {
  push: boolean;
  /** VAPID public key a browser needs to subscribe; null when the server has no Web Push set up. */
  webPushKey: string | null;
}
