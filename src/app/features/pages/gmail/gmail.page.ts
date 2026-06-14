import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { IonContent, IonIcon, IonModal } from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  arrowBackOutline,
  checkmarkCircleOutline,
  closeOutline,
  mailOutline,
  personCircleOutline,
  refreshOutline,
} from 'ionicons/icons';

import { ApiService } from '../../../core/services/api';

@Component({
  selector: 'app-gmail',
  templateUrl: './gmail.page.html',
  styleUrls: ['./gmail.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    DatePipe,
    IonContent,
    IonIcon,
    IonModal,
  ],
})
export class GmailPage implements OnInit {
  loading = false;
  errorMessage = '';

  selectedAccountId = '';

  accounts: any[] = [];
  messages: any[] = [];

  selectedMessage: any = null;
  isMessageModalOpen = false;

  summary = {
    accountId: '',
    accountEmail: '',
    totalEmails: 0,
    unreadEmails: 0,
    importantEmails: 0,
  };

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {
    addIcons({
      alertCircleOutline,
      arrowBackOutline,
      checkmarkCircleOutline,
      closeOutline,
      mailOutline,
      personCircleOutline,
      refreshOutline,
    });
  }

  ngOnInit(): void {
    this.loadInbox();
  }

  loadInbox(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getGoogleGmailStatus().subscribe({
      next: (statusRes) => {
        const statusData: any = statusRes.data;

        this.accounts = statusData?.accounts?.length
          ? statusData.accounts
          : statusData?.isConnected
            ? [
                {
                  id: statusData.accountId,
                  email: statusData.email,
                  isConnected: statusData.isConnected,
                },
              ]
            : [];

        if (!statusData?.isConnected || this.accounts.length === 0) {
          this.loading = false;
          this.errorMessage = 'No Gmail account connected.';
          return;
        }

        if (!this.selectedAccountId) {
          this.selectedAccountId = this.accounts[0].id;
        }

        this.loadSummaryAndMessages();
      },
      error: (error) => {
        console.error('Gmail status error:', error);
        this.loading = false;
        this.errorMessage = 'Unable to fetch Gmail connection status.';
      },
    });
  }

  loadSummaryAndMessages(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService.getGoogleGmailSummary(this.selectedAccountId).subscribe({
      next: (summaryRes) => {
        this.summary = {
          accountId: summaryRes.data?.accountId || '',
          accountEmail: summaryRes.data?.accountEmail || '',
          totalEmails: summaryRes.data?.totalEmails || 0,
          unreadEmails: summaryRes.data?.unreadEmails || 0,
          importantEmails: summaryRes.data?.importantEmails || 0,
        };

        this.loadMessages();
      },
      error: (error) => {
        console.error('Gmail summary error:', error);
        this.loading = false;

        if (error?.status === 401) {
          this.errorMessage =
            'Gmail permission expired. Please reconnect your Google account.';
          return;
        }

        this.errorMessage = 'Unable to fetch Gmail summary.';
      },
    });
  }

  loadMessages(): void {
    this.apiService.getGoogleGmailMessages(this.selectedAccountId).subscribe({
      next: (messagesRes) => {
        this.messages = messagesRes.data || [];
        this.loading = false;
      },
      error: (error) => {
        console.error('Gmail messages error:', error);
        this.loading = false;
        this.errorMessage = 'Unable to fetch Gmail messages.';
      },
    });
  }

  selectAccount(accountId: string): void {
    if (this.selectedAccountId === accountId) {
      return;
    }

    this.selectedAccountId = accountId;
    this.loadSummaryAndMessages();
  }

  openMessage(message: any): void {
    console.log('Opened Gmail message:', message);

    this.selectedMessage = message;
    this.isMessageModalOpen = true;
  }

  closeMessage(): void {
    this.isMessageModalOpen = false;

    setTimeout(() => {
      this.selectedMessage = null;
    }, 200);
  }

  refreshInbox(): void {
    this.loadInbox();
  }

  goBack(): void {
    this.router.navigateByUrl('/dashboard');
  }

  trackByMessage(index: number, item: any): string {
    return item.id;
  }
}