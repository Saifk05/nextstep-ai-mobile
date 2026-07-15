import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { finalize } from 'rxjs';
import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';
// import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api';

import {
  DashboardData,
  DashboardResponse,
} from '../../../core/models/dashboard.model';

import {
  GmailMessage,
  GmailSummary,
  GoogleCalendarEvent,
  GoogleConnectedAccount,
} from '../../../core/models/integration.model';

import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  createOutline,
  chevronForward,
} from 'ionicons/icons';

import {
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe, IonContent, IonIcon, AppFooterComponent, IonRefresher, IonRefresherContent],
})
export class DashboardPage implements OnInit {
  loading = false;
  dashboard: DashboardData | null = null;
  errorMessage = '';

  connectedAccounts: GoogleConnectedAccount[] = [];
  selectedAccountId = '';

  calendarEvents: GoogleCalendarEvent[] = [];
  isGoogleCalendarConnected = false;
  calendarLoading = false;

  gmailSummary: GmailSummary | null = null;
  gmailMessages: GmailMessage[] = [];
  isGmailConnected = false;
  gmailLoading = false;

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {
    addIcons({
      checkmarkCircle,
      createOutline,
      chevronForward,
    });
  }

  ngOnInit(): void {
    this.loadSelectedGoogleAccount();
    this.loadDashboard();
    this.loadGoogleWorkspaceData();
  }

  private loadSelectedGoogleAccount(): void {
    this.selectedAccountId =
      localStorage.getItem('selectedGoogleAccountId') || '';
  }

  private getAccountId(account: GoogleConnectedAccount): string {
    return account.id || (account as any)._id || '';
  }

  get selectedAccount(): GoogleConnectedAccount | undefined {
    return this.connectedAccounts.find(
      (account) => this.getAccountId(account) === this.selectedAccountId
    );
  }

  loadDashboard(): void {
    this.loading = true;
    this.dashboard = null;
    this.errorMessage = '';

    this.apiService
      .getDashboardOverview()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: DashboardResponse) => {
          this.dashboard = response.data;
        },
        error: () => {
          this.dashboard = null;
          this.errorMessage = 'Unable to load dashboard. Please try again.';
        },
      });
  }

  loadGoogleWorkspaceData(): void {
    this.calendarLoading = true;
    this.gmailLoading = true;

    this.apiService.getGoogleStatus().subscribe({
      next: (statusResponse) => {
        this.connectedAccounts = statusResponse.data.accounts || [];

        if (!this.connectedAccounts.length) {
          this.resetGoogleWorkspaceState();
          return;
        }

        const selectedExists = this.connectedAccounts.some(
          (account) => this.getAccountId(account) === this.selectedAccountId
        );

        if (!this.selectedAccountId || !selectedExists) {
          const firstAccountId = this.getAccountId(this.connectedAccounts[0]);

          if (firstAccountId) {
            this.selectGoogleAccount(firstAccountId);
            return;
          }
        }

        this.loadSelectedAccountServices();
      },
      error: () => {
        this.resetGoogleWorkspaceState();
      },
    });
  }

  selectGoogleAccount(accountId: string): void {
    if (!accountId) {
      this.resetGoogleWorkspaceState();
      return;
    }

    this.selectedAccountId = accountId;
    localStorage.setItem('selectedGoogleAccountId', accountId);

    this.loadSelectedAccountServices();
  }

  private loadSelectedAccountServices(): void {
    const account = this.selectedAccount;

    this.isGoogleCalendarConnected =
      account?.calendarConnected ||
      account?.enabledServices?.includes('CALENDAR') ||
      false;

    this.isGmailConnected =
      account?.gmailConnected ||
      account?.enabledServices?.includes('GMAIL') ||
      false;

    if (this.isGoogleCalendarConnected) {
      this.loadGoogleCalendarEvents();
    } else {
      this.calendarEvents = [];
      this.calendarLoading = false;
    }

    if (this.isGmailConnected) {
      this.loadGmailDashboardData();
    } else {
      this.gmailSummary = null;
      this.gmailMessages = [];
      this.gmailLoading = false;
    }
  }

  private resetGoogleWorkspaceState(): void {
    this.connectedAccounts = [];
    this.selectedAccountId = '';
    localStorage.removeItem('selectedGoogleAccountId');

    this.isGoogleCalendarConnected = false;
    this.isGmailConnected = false;

    this.calendarEvents = [];
    this.gmailSummary = null;
    this.gmailMessages = [];

    this.calendarLoading = false;
    this.gmailLoading = false;
  }

  loadGoogleCalendarEvents(): void {
    if (!this.selectedAccountId) {
      this.calendarEvents = [];
      this.calendarLoading = false;
      return;
    }

    this.calendarLoading = true;

    this.apiService
      .getGoogleCalendarEvents(this.selectedAccountId)
      .pipe(finalize(() => (this.calendarLoading = false)))
      .subscribe({
        next: (eventsResponse) => {
          this.calendarEvents = eventsResponse.data || [];
        },
        error: () => {
          this.calendarEvents = [];
        },
      });
  }

  loadGmailDashboardData(): void {
    if (!this.selectedAccountId) {
      this.gmailSummary = null;
      this.gmailMessages = [];
      this.gmailLoading = false;
      return;
    }

    this.gmailLoading = true;

    this.apiService
      .getGoogleGmailSummary(this.selectedAccountId)
      .pipe(finalize(() => (this.gmailLoading = false)))
      .subscribe({
        next: (response) => {
          this.gmailSummary = response.data;
          this.gmailMessages = response.data.emails || [];
        },
        error: () => {
          this.gmailSummary = null;
          this.gmailMessages = [];
        },
      });
  }

  getSenderName(from: string): string {
    if (!from) {
      return 'Unknown sender';
    }

    if (from.includes('<')) {
      return from.split('<')[0].trim().replace(/"/g, '') || from;
    }

    return from;
  }

  formatCalendarTime(value: string | null): string {
    if (!value) {
      return 'No time';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatEmailTime(value: string | null): string {
    if (!value) {
      return 'No date';
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return date.toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  handleRefresh(event: CustomEvent): void {
    this.apiService
      .getDashboardOverview()
      .pipe(
        finalize(() => {
          (event.target as HTMLIonRefresherElement).complete();
        })
      )
      .subscribe({
        next: (response: DashboardResponse) => {
          this.dashboard = response.data;
          this.errorMessage = '';
          this.loadGoogleWorkspaceData();
        },
        error: () => {
          this.errorMessage = 'Unable to refresh dashboard. Please try again.';
        },
      });
  }

  goToAddTask(): void {
    this.router.navigateByUrl('/tasks/add');
  }

  createGoal(): void {
    this.router.navigateByUrl('/goals/add');
  }

  goToGoalDetails(goalId: string): void {
    this.router.navigateByUrl(`/goals/${goalId}`);
  }
}