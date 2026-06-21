import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  NavController,
} from '@ionic/angular/standalone';
import { AppPopupComponent } from '../../../shared/components/app-popup/app-popup.component';

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
  addCircleOutline,
  shieldCheckmarkOutline,
  documentTextOutline,
  lockClosedOutline,
} from 'ionicons/icons';

import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';
import { ApiService, User } from '../../../core/services/api';
import { StorageService } from '../../../core/services/storage';
import { ToastService } from '../../../core/services/toast';
import { GoogleConnectedAccount } from '../../../core/models/integration.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  templateUrl: './settings.page.html',
  styleUrls: ['./settings.page.scss'],
  imports: [CommonModule, IonContent, IonIcon, AppFooterComponent, AppPopupComponent],
})
export class SettingsPage implements OnInit {
  private readonly privacyPolicyUrl =
    'https://nextstep-ai-legal.vercel.app/privacy-policy';

  private readonly termsConditionsUrl =
    'https://nextstep-ai-legal.vercel.app/terms-and-conditions';

  private readonly dataAcquisitionUrl =
    'https://nextstep-ai-legal.vercel.app/data-access';

  private readonly deleteAccountUrl =
    'https://nextstep-ai-legal.vercel.app/delete-account';

  user: User | null = null;

  userName = 'User';
  userEmail = 'user@example.com';
  productivityScore = 0;

  connectedAccounts: GoogleConnectedAccount[] = [];
  selectedAccountId = '';

  isGoogleConnected = false;
  isGoogleLoading = false;
  isDisconnecting = false;
  showLogoutPopup = false;

  constructor(
    private readonly navCtrl: NavController,
    private readonly apiService: ApiService,
    private readonly storageService: StorageService,
    private readonly toastService: ToastService,
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
      addCircleOutline,
      shieldCheckmarkOutline,
      documentTextOutline,
      lockClosedOutline,
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadUserFromStorage();
    this.loadSelectedGoogleAccount();
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
        const accounts = response.data?.accounts || [];

        this.connectedAccounts = accounts;
        this.isGoogleConnected = accounts.length > 0;

        if (accounts.length === 0) {
          this.selectedAccountId = '';
          localStorage.removeItem('selectedGoogleAccountId');
          return;
        }

        const selectedExists = accounts.some(
          (account) => account.id === this.selectedAccountId
        );

        if (!this.selectedAccountId || !selectedExists) {
          this.selectAccount(accounts[0].id);
        }
      },
      error: () => {
        this.connectedAccounts = [];
        this.isGoogleConnected = false;
        this.selectedAccountId = '';
        localStorage.removeItem('selectedGoogleAccountId');

        this.showError('Unable to fetch Google connection status');
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
      error: (error) => {
        this.isGoogleLoading = false;

        this.showError(
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
      next: () => {
        this.isDisconnecting = false;
        this.showSuccess('Google account disconnected');
        this.checkGoogleStatus();
      },
      error: (error) => {
        this.isDisconnecting = false;

        this.showError(error?.error?.message || 'Unable to disconnect account');
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
    const services: string[] = [];

    if (account.gmailConnected) {
      services.push('Gmail');
    }

    if (account.calendarConnected) {
      services.push('Calendar');
    }

    if (services.length === 0) {
      return 'Connected';
    }

    return `${services.join(' & ')} connected`;
  }

  getAccountTypeLabel(account: GoogleConnectedAccount): string {
    if (account.accountType === 'WORK') {
      return 'Work';
    }

    return 'Personal';
  }

  getAccountServiceLabel(account: GoogleConnectedAccount): string {
    return `${this.getAccountStatusLabel(account)} · ${this.getAccountTypeLabel(
      account
    )}`;
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

  goToNotifications(event?: Event): void {
    this.blurActiveElement(event);

    this.router.navigate(['/settings/notifications'], {
      replaceUrl: true,
    });
  }

  goToAppearance(event?: Event): void {
    this.blurActiveElement(event);

    this.router.navigate(['/settings/appearance'], {
      replaceUrl: true,
    });
  }

  goToGoogleOtp(): void {
    this.router.navigate(['/settings/google-connect']);
  }

  openPrivacyPolicy(): void {
    this.openExternalUrl(this.privacyPolicyUrl);
  }

  openTermsConditions(): void {
    this.openExternalUrl(this.termsConditionsUrl);
  }

  openDataAcquisition(): void {
    this.openExternalUrl(this.dataAcquisitionUrl);
  }

  openDeleteAccount(): void {
    this.openExternalUrl(this.deleteAccountUrl);
  }

  comingSoon(label: string): void {
    this.showInfo(`${label} coming soon`);
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

  private openExternalUrl(url: string): void {
    window.open(url, '_blank', 'noopener,noreferrer');
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

  private showSuccess(message: string): void {
    this.toastService.success(message);
  }

  private showError(message: string): void {
    this.toastService.error(message);
  }

  private showInfo(message: string): void {
    this.toastService.success(message);
  }

  openLogoutPopup(event?: Event): void {
    this.blurActiveElement(event);
    this.showLogoutPopup = true;
  }

  closeLogoutPopup(): void {
    this.showLogoutPopup = false;
  }

  confirmLogout(): void {
    this.showLogoutPopup = false;
    this.logout();
  }



}