import { DevicePlatform } from '@shared/enums/notification/device-platform.enum';
import { MobileApp } from '@shared/enums/notification/mobile-app.enum';

/** POST /notifications/devices (Flutter apps). */
export interface DevicePayload {
  token: string;
  app: MobileApp;
  platform: DevicePlatform;
  deviceName?: string;
  appVersion?: string;
}
