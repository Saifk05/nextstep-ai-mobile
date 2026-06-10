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

@Component({
  selector: 'app-register',
  templateUrl: './register.page.html',
  styleUrls: ['./register.page.scss'],
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
export class RegisterPage {
  firstName = '';
  lastName = '';
  email = '';
  phoneNumber = '';
  password = '';
  confirmPassword = '';

  showPassword = false;
  showConfirmPassword = false;

  loading = false;
  errorMessage = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly navCtrl: NavController
  ) {
    addIcons({
      eyeOutline,
      eyeOffOutline,
      logoGoogle,
      logoFacebook,
    });
  }

  goToLogin(): void {
    (document.activeElement as HTMLElement)?.blur();
    this.navCtrl.navigateRoot('/login');
  }

  togglePassword(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  get passwordStrength(): 'Weak' | 'Medium' | 'Strong' {
    const password = this.password;

    if (!password) return 'Weak';

    const score = [
      password.length >= 8,
      /[A-Z]/.test(password),
      /[a-z]/.test(password),
      /[0-9]/.test(password),
      /[^A-Za-z0-9]/.test(password),
    ].filter(Boolean).length;

    if (score <= 2) return 'Weak';
    if (score <= 4) return 'Medium';
    return 'Strong';
  }

  get passwordStrengthClass(): string {
    return this.passwordStrength.toLowerCase();
  }

  private isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isStrongPassword(password: string): boolean {
    return (
      password.length >= 8 &&
      /[A-Z]/.test(password) &&
      /[a-z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[^A-Za-z0-9]/.test(password)
    );
  }

  register(): void {
    this.errorMessage = '';

    if (
      !this.firstName.trim() ||
      !this.lastName.trim() ||
      !this.email.trim() ||
      !this.phoneNumber.trim() ||
      !this.password.trim() ||
      !this.confirmPassword.trim()
    ) {
      this.errorMessage = 'Please fill all fields';
      return;
    }

    if (!this.isValidEmail(this.email.trim())) {
      this.errorMessage = 'Please enter a valid email address';
      return;
    }

    if (!/^[0-9]{10}$/.test(this.phoneNumber.trim())) {
      this.errorMessage = 'Please enter a valid 10 digit phone number';
      return;
    }

    if (!this.isStrongPassword(this.password)) {
      this.errorMessage =
        'Password must include uppercase, lowercase, number and special character';
      return;
    }

    if (this.password !== this.confirmPassword) {
      this.errorMessage = 'Password and confirm password do not match';
      return;
    }

    this.loading = true;

    this.apiService
      .register({
        firstName: this.firstName.trim(),
        lastName: this.lastName.trim(),
        email: this.email.trim().toLowerCase(),
        phoneNumber: this.phoneNumber.trim(),
        password: this.password,
      })
      .subscribe({
        next: () => {
          this.loading = false;
          (document.activeElement as HTMLElement)?.blur();
          this.navCtrl.navigateRoot('/login');
        },
        error: (error) => {
          this.loading = false;
          this.errorMessage =
            error?.error?.message ||
            'Registration failed. Please try again.';
        },
      });
  }
}