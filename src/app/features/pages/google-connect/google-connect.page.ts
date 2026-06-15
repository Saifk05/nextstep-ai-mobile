import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonIcon,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  mailOutline,
  shieldCheckmarkOutline,
  refreshOutline,
  linkOutline,
} from 'ionicons/icons';

import { ApiService } from '../../../core/services/api';
import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-google-connect',
  templateUrl: './google-connect.page.html',
  styleUrls: ['./google-connect.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonContent, IonIcon],
})
export class GoogleConnectPage {
  email = '';
  otp = '';

  otpSent = false;
  loading = false;
  verifying = false;

  constructor(
    private readonly apiService: ApiService,
    private readonly toastService: ToastService,
    private readonly navCtrl: NavController
  ) {
    addIcons({
      arrowBackOutline,
      mailOutline,
      shieldCheckmarkOutline,
      refreshOutline,
      linkOutline,
    });
  }

  goBack(): void {
    this.navCtrl.navigateBack('/settings');
  }

  sendOtp(): void {
    const email = this.email.trim().toLowerCase();

    if (!email) {
      this.toastService.error('Please enter email address');
      return;
    }

    this.loading = true;

    this.apiService.sendGoogleConnectOtp({ email }).subscribe({
      next: (response) => {
        this.loading = false;
        this.email = email;
        this.otpSent = true;
        this.toastService.success(response.message || 'OTP sent successfully');
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error?.error?.message || 'Unable to send OTP');
      },
    });
  }

  verifyOtp(): void {
    const email = this.email.trim().toLowerCase();
    const otp = this.otp.trim();

    if (!otp || otp.length < 4) {
      this.toastService.error('Please enter valid OTP');
      return;
    }

    this.verifying = true;

    this.apiService.verifyGoogleConnectOtp({ email, otp }).subscribe({
      next: () => {
        this.verifying = false;
        this.openGoogleOAuth();
      },
      error: (error) => {
        this.verifying = false;
        this.toastService.error(error?.error?.message || 'Invalid OTP');
      },
    });
  }

  resendOtp(): void {
    const email = this.email.trim().toLowerCase();

    if (!email) {
      this.toastService.error('Please enter email address');
      return;
    }

    this.loading = true;

    this.apiService.resendGoogleConnectOtp({ email }).subscribe({
      next: (response) => {
        this.loading = false;
        this.toastService.success(response.message || 'OTP resent successfully');
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(error?.error?.message || 'Unable to resend OTP');
      },
    });
  }

  private openGoogleOAuth(): void {
    this.loading = true;

    this.apiService.getGoogleConnectUrl().subscribe({
      next: (response) => {
        this.loading = false;
        window.location.href = response.data.url;
      },
      error: (error) => {
        this.loading = false;
        this.toastService.error(
          error?.error?.message || 'Unable to open Google connection'
        );
      },
    });
  }
}