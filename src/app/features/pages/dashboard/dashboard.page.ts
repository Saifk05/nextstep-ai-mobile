import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { finalize, forkJoin } from 'rxjs';
import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast';
import { ApiService } from '../../../core/services/api';
import {
  DashboardData,
  DashboardResponse,
} from '../../../core/models/dashboard.model';
import { addIcons } from 'ionicons';
import {
  checkmarkCircle,
  createOutline,
} from 'ionicons/icons';

import {
  GmailMessage,
  GmailSummary,
  GoogleCalendarEvent,
  GoogleConnectedAccount,
} from '../../../core/models/integration.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe, IonContent, IonIcon, AppFooterComponent],
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
    private readonly router: Router,
    private readonly toastService: ToastService
  ) {
    addIcons({
      checkmarkCircle,
      createOutline,
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

        if (this.connectedAccounts.length === 0) {
          this.selectedAccountId = '';
          localStorage.removeItem('selectedGoogleAccountId');

          this.isGoogleCalendarConnected = false;
          this.isGmailConnected = false;
          this.calendarEvents = [];
          this.gmailSummary = null;
          this.gmailMessages = [];
          this.calendarLoading = false;
          this.gmailLoading = false;
          return;
        }

        const selectedExists = this.connectedAccounts.some(
          (account) => account.id === this.selectedAccountId
        );

        if (!this.selectedAccountId || !selectedExists) {
          this.selectGoogleAccount(this.connectedAccounts[0].id);
        }

        const selectedAccount = this.selectedAccount;

        this.isGoogleCalendarConnected =
          selectedAccount?.calendarConnected ||
          selectedAccount?.enabledServices?.includes('CALENDAR') ||
          false;

        this.isGmailConnected =
          selectedAccount?.gmailConnected ||
          selectedAccount?.enabledServices?.includes('GMAIL') ||
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
      },
      error: () => {
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
      },
    });
  }

  selectGoogleAccount(accountId: string): void {
    this.selectedAccountId = accountId;
    localStorage.setItem('selectedGoogleAccountId', accountId);

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
    }

    if (this.isGmailConnected) {
      this.loadGmailDashboardData();
    } else {
      this.gmailSummary = null;
      this.gmailMessages = [];
    }
  }

  get selectedAccount(): GoogleConnectedAccount | undefined {
    return this.connectedAccounts.find(
      (account) => account.id === this.selectedAccountId
    );
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

    forkJoin({
      summary: this.apiService.getGoogleGmailSummary(this.selectedAccountId),
      messages: this.apiService.getGoogleGmailMessages(this.selectedAccountId),
    })
      .pipe(finalize(() => (this.gmailLoading = false)))
      .subscribe({
        next: (response) => {
          this.gmailSummary = response.summary.data;
          this.gmailMessages = response.messages.data || [];
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
    this.toastService.info('Goals feature coming soon.');
  }
}