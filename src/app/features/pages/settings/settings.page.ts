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
  mailOutline,
  trashOutline,
} from 'ionicons/icons';

import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';
import { ApiService, User } from '../../../core/services/api';
import { StorageService } from '../../../core/services/storage';
import { GoogleConnectedAccount } from '../../../core/models/integration.model';

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

  connectedAccounts: GoogleConnectedAccount[] = [];
  selectedAccountId = '';

  isGoogleConnected = false;
  isGoogleLoading = false;
  isDisconnecting = false;

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
      mailOutline,
      trashOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadUserFromStorage();
    this.loadSelectedGoogleAccount();
    this.checkGoogleStatus();
  }

  async ionViewWillEnter(): Promise<void> {
    await this.loadUserFromStorage();
    this.loadSelectedGoogleAccount();
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

  private loadSelectedGoogleAccount(): void {
    this.selectedAccountId =
      localStorage.getItem('selectedGoogleAccountId') || '';
  }

  checkGoogleStatus(): void {
    this.apiService.getGoogleStatus().subscribe({
      next: (response) => {
        this.connectedAccounts = response.data.accounts || [];

        this.isGoogleConnected = this.connectedAccounts.length > 0;

        if (this.connectedAccounts.length === 0) {
          this.selectedAccountId = '';
          localStorage.removeItem('selectedGoogleAccountId');
          return;
        }

        const selectedExists = this.connectedAccounts.some(
          (account) => account.id === this.selectedAccountId
        );

        if (!this.selectedAccountId || !selectedExists) {
          this.selectAccount(this.connectedAccounts[0].id);
        }
      },
      error: () => {
        this.connectedAccounts = [];
        this.isGoogleConnected = false;
        this.selectedAccountId = '';
        localStorage.removeItem('selectedGoogleAccountId');
      },
    });
  }

  connectGoogleCalendar(): void {
    if (this.isGoogleLoading) {
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

  selectAccount(accountId: string): void {
    this.selectedAccountId = accountId;
    localStorage.setItem('selectedGoogleAccountId', accountId);
  }

  disconnectAccount(accountId: string): void {
    if (this.isDisconnecting) {
      return;
    }

    this.isDisconnecting = true;

    this.apiService.disconnectGoogleAccount(accountId).subscribe({
      next: async () => {
        this.isDisconnecting = false;
        await this.showToast('Google account disconnected');
        this.checkGoogleStatus();
      },
      error: async (error) => {
        this.isDisconnecting = false;
        await this.showToast(
          error?.error?.message || 'Unable to disconnect account'
        );
      },
    });
  }

  get selectedAccount(): GoogleConnectedAccount | undefined {
    return this.connectedAccounts.find(
      (account) => account.id === this.selectedAccountId
    );
  }

  get connectedAccountsCount(): number {
    return this.connectedAccounts.length;
  }

  get hasCalendarConnected(): boolean {
    return this.connectedAccounts.some((account) => account.calendarConnected);
  }

  get hasGmailConnected(): boolean {
    return this.connectedAccounts.some((account) => account.gmailConnected);
  }

  getAccountStatusLabel(account: GoogleConnectedAccount): string {
    if (account.gmailConnected && account.calendarConnected) {
      return 'Gmail and Calendar connected';
    }

    if (account.gmailConnected) {
      return 'Gmail connected';
    }

    if (account.calendarConnected) {
      return 'Calendar connected';
    }

    return 'Connected';
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
    localStorage.removeItem('selectedGoogleAccountId');
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