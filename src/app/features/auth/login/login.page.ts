import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  // IonText,
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

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    // IonText,
    IonSpinner,
    IonIcon,
  ],
})
export class LoginPage {
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
    private readonly navCtrl: NavController
  ) {
    addIcons({
      eyeOutline,
      eyeOffOutline,
      logoGoogle,
      logoFacebook,
    });
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
          console.log('Login Response:', response);

          await this.storageService.setAuthData(
            response.data.accessToken,
            response.data.refreshToken,
            response.data.user
          );

          const savedAccessToken =
            await this.storageService.getAccessToken();

          const savedRefreshToken =
            await this.storageService.getRefreshToken();

          console.log('Saved Access Token:', savedAccessToken);
          console.log('Saved Refresh Token:', savedRefreshToken);

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
}