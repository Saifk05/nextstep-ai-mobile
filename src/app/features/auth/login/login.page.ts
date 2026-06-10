import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonText,
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

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonText,
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
      return;
    }

    if (!this.password.trim()) {
      this.errorMessage = 'Please enter your password';
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
          await this.storageService.setAccessToken(
            response.data.accessToken
          );

          await this.storageService.setRefreshToken(
            response.data.refreshToken
          );

          await this.storageService.setUser(
            response.data.user
          );

          this.loading = false;

          (document.activeElement as HTMLElement)?.blur();

          setTimeout(() => {
            this.navCtrl.navigateRoot('/dashboard');
          }, 10);
        },

        error: (error) => {
          this.loading = false;

          this.errorMessage =
            error?.error?.message ||
            'Invalid email or password';
        },
      });
  }
}