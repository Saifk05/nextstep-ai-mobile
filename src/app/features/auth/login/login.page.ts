import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FirebaseService } from '../../../core/firebase/firebase.service';

import {
  IonContent,
  IonSpinner,
  IonIcon,
  NavController,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  eyeOutline,
  eyeOffOutline,
  logoGoogle,
  logoFacebook,
} from 'ionicons/icons';

import { ApiService } from '../../../core/services/api';
import { StorageService } from '../../../core/services/storage';
import { ToastService } from '../../../core/services/toast';
import { PushNotificationService } from '../../../core/services/push-notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonSpinner,
    IonIcon,
  ],
})
export class LoginPage implements OnInit {
  email = '';
  password = '';

  showPassword = false;
  rememberMe = false;

  loading = false;
  errorMessage = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly storageService: StorageService,
    private readonly toastService: ToastService,
    private readonly navCtrl: NavController,
    private readonly firebaseService: FirebaseService,
    private readonly pushNotificationService: PushNotificationService
  ) {
    addIcons({
      eyeOutline,
      eyeOffOutline,
      logoGoogle,
      logoFacebook,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.firebaseService.initializeGoogleLogin();
  }

  goToRegister(): void {
    (document.activeElement as HTMLElement)?.blur();
    this.navCtrl.navigateRoot('/register');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  login(): void {
    this.errorMessage = '';

    if (!this.email.trim()) {
      this.errorMessage = 'Please enter your email';
      this.toastService.warning('Please enter your email');
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Please enter your password';
      this.toastService.warning('Please enter your password');
      return;
    }

    this.loading = true;

    this.apiService
      .login({
        email: this.email.trim(),
        password: this.password,
      })
      .subscribe({
        next: async (response) => {
          await this.storageService.setAuthData(
            response.data.accessToken,
            response.data.refreshToken,
            response.data.user
          );
          this.pushNotificationService
            .initPushNotifications()
            .catch((error) => {
              console.error(
                'Push notification initialization failed',
                error,
              );
            });

          // await this.pushNotificationService.initPushNotifications();
          this.loading = false;

          this.toastService.success('Login successful');

          (document.activeElement as HTMLElement)?.blur();

          await this.navCtrl.navigateRoot('/dashboard');
        },

        error: (error) => {
          this.loading = false;

          const message =
            error?.error?.message || 'Invalid email or password';

          this.errorMessage = message;
          this.toastService.error(message);
        },
      });
  }

  async loginWithGoogle(): Promise<void> {
    await this.socialLogin('GOOGLE');
  }

  async loginWithFacebook(): Promise<void> {
    await this.socialLogin('FACEBOOK');
  }

  private async socialLogin(provider: 'GOOGLE' | 'FACEBOOK'): Promise<void> {
  try {
    this.loading = true;
    this.errorMessage = '';

    console.log('Starting social login:', provider);

    const idToken =
      provider === 'GOOGLE'
        ? await this.firebaseService.googleLogin()
        : await this.firebaseService.facebookLogin();

    console.log('Firebase ID Token:', idToken);

    this.apiService.socialLogin({ provider, idToken }).subscribe({
      next: async (response) => {
        console.log('Backend social login response:', response);

        await this.storageService.setAuthData(
          response.data.accessToken,
          response.data.refreshToken,
          response.data.user
        );

          this.pushNotificationService
            .initPushNotifications()
            .catch((error) => {
              console.error(
                'Push notification initialization failed',
                error,
              );
            });
                    
        // await this.pushNotificationService.initPushNotifications();
        this.loading = false;
        this.toastService.success('Login successful');
        await this.navCtrl.navigateRoot('/dashboard');
      },

      error: (error) => {
        console.error('Backend social login error:', error);

        this.loading = false;

        const message =
          error?.error?.message ||
          error?.message ||
          'Social login failed';

        this.errorMessage = message;
        this.toastService.error(message);
      },
    });
  } catch (error) {
    console.error('Firebase Google login error:', error);

    this.loading = false;
    this.errorMessage = 'Google login cancelled or failed';
    this.toastService.error(this.errorMessage);
  }
}

}