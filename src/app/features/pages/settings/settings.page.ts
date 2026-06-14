import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  NavController,
  ToastController,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  personOutline,
  locationOutline,
  notificationsOutline,
  colorPaletteOutline,
  helpCircleOutline,
  informationCircleOutline,
  logOutOutline,
  chevronForwardOutline,
  sparklesOutline,
  settingsOutline,
  calendarOutline,
  checkmarkCircleOutline,
  linkOutline,
} from 'ionicons/icons';

import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';
import { ApiService, User } from '../../../core/services/api';
import { StorageService } from '../../../core/services/storage';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [CommonModule, IonContent, IonIcon, AppFooterComponent],
})
export class SettingsPage implements OnInit {
  user: User | null = null;

  userName = 'User';
  userEmail = 'user@example.com';
  productivityScore = 0;

  isGoogleConnected = false;
  googleEmail: string | null = null;
  isGoogleLoading = false;

  calendarConnected = false;
  gmailConnected = false;

  constructor(
    private readonly navCtrl: NavController,
    private readonly apiService: ApiService,
    private readonly storageService: StorageService,
    private readonly toastCtrl: ToastController,
    private readonly router: Router
  ) {
    addIcons({
      arrowBackOutline,
      personOutline,
      locationOutline,
      notificationsOutline,
      colorPaletteOutline,
      helpCircleOutline,
      informationCircleOutline,
      logOutOutline,
      chevronForwardOutline,
      sparklesOutline,
      settingsOutline,
      calendarOutline,
      checkmarkCircleOutline,
      linkOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadUserFromStorage();
    this.checkGoogleStatus();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadUserFromStorage();
    this.checkGoogleStatus();
  }

  private async loadUserFromStorage(): Promise<void> {
    this.user = await this.storageService.getUser();

    if (!this.user) {
      this.userName = 'User';
      this.userEmail = 'user@example.com';
      return;
    }

    this.userName =
      `${this.user.firstName || ''} ${this.user.lastName || ''}`.trim() ||
      'User';

    this.userEmail = this.user.email || 'user@example.com';
  }

  checkGoogleStatus(): void {
    this.apiService.getGoogleStatus().subscribe({
      next: (response) => {
        this.calendarConnected = response.data.calendarConnected;
        this.gmailConnected = response.data.gmailConnected;

        this.isGoogleConnected =
          response.data.calendarConnected && response.data.gmailConnected;

        this.googleEmail = response.data.email;
      },
      error: () => {
        this.isGoogleConnected = false;
        this.calendarConnected = false;
        this.gmailConnected = false;
        this.googleEmail = null;
      },
    });
  }

  connectGoogleCalendar(): void {
    if (this.isGoogleLoading || this.isGoogleConnected) {
      return;
    }

    this.isGoogleLoading = true;

    this.apiService.getGoogleConnectUrl().subscribe({
      next: (response) => {
        this.isGoogleLoading = false;
        window.location.href = response.data.url;
      },
      error: async (error) => {
        this.isGoogleLoading = false;
        await this.showToast(
          error?.error?.message || 'Unable to connect Google Workspace'
        );
      },
    });
  }

  goBack(): void {
    this.blurActiveElement();
    this.navCtrl.navigateBack('/dashboard');
  }

  goToProfile(event?: Event): void {
    this.blurActiveElement(event);

    this.router.navigate(['/settings/profile'], {
      replaceUrl: true,
    });
  }

  comingSoon(label: string): void {
    this.showToast(`${label} coming soon`);
  }

  async logout(): Promise<void> {
    this.blurActiveElement();

    const user = await this.storageService.getUser();

    if (!user?.id) {
      await this.clearAndRedirectToLogin();
      return;
    }

    this.apiService.logout({ userId: user.id }).subscribe({
      next: async () => {
        await this.clearAndRedirectToLogin();
      },
      error: async () => {
        await this.clearAndRedirectToLogin();
      },
    });
  }

  private blurActiveElement(event?: Event): void {
    const activeElement = document.activeElement as HTMLElement | null;
    activeElement?.blur();

    if (event?.target instanceof HTMLElement) {
      event.target.blur();
    }
  }

  private async clearAndRedirectToLogin(): Promise<void> {
    await this.storageService.clearAuthStorage();
    this.navCtrl.navigateRoot('/login');
  }

  private async showToast(message: string): Promise<void> {
    const toast = await this.toastCtrl.create({
      message,
      duration: 1600,
      position: 'bottom',
    });

    await toast.present();
  }
}