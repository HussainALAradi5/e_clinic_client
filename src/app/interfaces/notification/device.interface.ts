import { DevicePlatform } from '@enums/notification/device-platform.enum';
import { MobileApp } from '@enums/notification/mobile-app.enum';

/** POST /notifications/devices (Flutter apps). */
export interface DevicePayload {
  token: string;
  app: MobileApp;
  platform: DevicePlatform;
  deviceName?: string;
  appVersion?: string;
}
