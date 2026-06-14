import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { finalize, forkJoin } from 'rxjs';
import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';
import { IonContent } from '@ionic/angular/standalone';

import { ApiService } from '../../../core/services/api';
import {
  DashboardData,
  DashboardResponse,
} from '../../../core/models/dashboard.model';
import {
  GmailMessage,
  GmailSummary,
  GoogleCalendarEvent,
} from '../../../core/models/integration.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [CommonModule, IonContent, AppFooterComponent],
})
export class DashboardPage implements OnInit {
  loading = false;
  dashboard: DashboardData | null = null;
  errorMessage = '';

  calendarEvents: GoogleCalendarEvent[] = [];
  isGoogleCalendarConnected = false;
  calendarLoading = false;

  gmailSummary: GmailSummary | null = null;
  gmailMessages: GmailMessage[] = [];
  isGmailConnected = false;
  gmailLoading = false;

  constructor(private readonly apiService: ApiService) {}

  ngOnInit(): void {
    this.loadDashboard();
    this.loadGoogleWorkspaceData();
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
      // next: (statusResponse) => {
      //   this.isGoogleCalendarConnected =
      //     statusResponse.data.calendarConnected || false;

      //   this.isGmailConnected = statusResponse.data.gmailConnected || false;

      //   if (this.isGoogleCalendarConnected) {
      //     this.loadGoogleCalendarEvents();
      //   } else {
      //     this.calendarEvents = [];
      //     this.calendarLoading = false;
      //   }

      //   if (this.isGmailConnected) {
      //     this.loadGmailDashboardData();
      //   } else {
      //     this.gmailSummary = null;
      //     this.gmailMessages = [];
      //     this.gmailLoading = false;
      //   }
      // },
      next: (statusResponse) => {
  console.log('GOOGLE STATUS RESPONSE:', statusResponse);

  this.isGoogleCalendarConnected =
    statusResponse.data.calendarConnected || false;

  this.isGmailConnected = statusResponse.data.gmailConnected || false;

  console.log('CALENDAR CONNECTED:', this.isGoogleCalendarConnected);
  console.log('GMAIL CONNECTED:', this.isGmailConnected);

  if (this.isGoogleCalendarConnected) {
    this.loadGoogleCalendarEvents();
  } else {
    this.calendarEvents = [];
    this.calendarLoading = false;
  }

  if (this.isGmailConnected) {
    console.log('CALLING GMAIL DASHBOARD DATA');
    this.loadGmailDashboardData();
  } else {
    console.log('GMAIL NOT CONNECTED FROM STATUS API');
    this.gmailSummary = null;
    this.gmailMessages = [];
    this.gmailLoading = false;
  }
},
      error: () => {
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

  loadGoogleCalendarEvents(): void {
    this.calendarLoading = true;

    this.apiService
      .getGoogleCalendarEvents()
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
    this.gmailLoading = true;

    forkJoin({
      summary: this.apiService.getGoogleGmailSummary(),
      messages: this.apiService.getGoogleGmailMessages(),
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

  getSenderName(from: string): string {
    if (!from) {
      return 'Unknown sender';
    }

    if (from.includes('<')) {
      return from.split('<')[0].trim().replace(/"/g, '') || from;
    }

    return from;
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
}