import { Injectable } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import {
  PushNotifications,
  Token,
  PushNotificationSchema,
  ActionPerformed,
} from '@capacitor/push-notifications';

import { ApiService } from './api';

@Injectable({
  providedIn: 'root',
})
export class PushNotificationService {
  private currentToken: string | null = null;

  constructor(private readonly apiService: ApiService) {}

  async initPushNotifications(): Promise<void> {
    if (!Capacitor.isNativePlatform()) {
      console.log('Push notifications skipped: not native platform');
      return;
    }

    let permission = await PushNotifications.checkPermissions();

    if (permission.receive !== 'granted') {
      permission = await PushNotifications.requestPermissions();
    }

    if (permission.receive !== 'granted') {
      console.log('Push notification permission denied');
      return;
    }

    await PushNotifications.register();

    PushNotifications.addListener('registration', (token: Token) => {
      this.currentToken = token.value;

      this.apiService
        .registerNotificationDevice({
          token: token.value,
          platform: 'ANDROID',
          deviceName: 'Android Device',
        })
        .subscribe({
          next: () => console.log('FCM device registered'),
          error: (error) =>
            console.error('FCM device registration failed', error),
        });
    });

    PushNotifications.addListener('registrationError', (error: any) => {
      console.error('Push registration error', error);
    });

    PushNotifications.addListener(
      'pushNotificationReceived',
      (notification: PushNotificationSchema) => {
        console.log('Push received in foreground', notification);
      },
    );

    PushNotifications.addListener(
      'pushNotificationActionPerformed',
      (action: ActionPerformed) => {
        console.log('Push notification tapped', action);
      },
    );
  }

  unregisterDevice(): void {
    if (!this.currentToken) {
      return;
    }

    this.apiService.unregisterNotificationDevice(this.currentToken).subscribe({
      next: () => console.log('FCM device unregistered'),
      error: (error) =>
        console.error('FCM device unregister failed', error),
    });
  }
}