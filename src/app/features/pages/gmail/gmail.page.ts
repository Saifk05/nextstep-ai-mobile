import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  IonModal,
  IonSpinner,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';

import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';
import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  arrowBackOutline,
  checkmarkCircleOutline,
  closeOutline,
  filterOutline,
  mailOutline,
  personCircleOutline,
  refreshOutline,
  searchOutline,
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
    IonSpinner,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    IonSelect,
    IonSelectOption,
    AppFooterComponent,
  ],
})
export class GmailPage implements OnInit {
  loading = false;
  pageLoading = false;
  errorMessage = '';

  selectedAccountId = '';

  searchTerm = '';
  selectedCategory = 'ALL';
  selectedDays = 30;
  isFilterModalOpen = false;

  accounts: any[] = [];
  messages: any[] = [];

  selectedMessage: any = null;
  isMessageModalOpen = false;

  nextPageToken: string | null = null;
  pageLimit = 10;
  isLoadingMore = false;

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
      filterOutline,
      mailOutline,
      personCircleOutline,
      refreshOutline,
      searchOutline,
    });
  }

  ngOnInit(): void {
    this.loadInbox();
  }

  loadInbox(): void {
    this.loading = true;
    this.pageLoading = true;
    this.errorMessage = '';
    this.nextPageToken = null;

    this.apiService.getGoogleStatus().subscribe({
      next: (statusRes) => {
        const statusData: any = statusRes.data;

        this.accounts = statusData?.accounts || [];

        if (!statusData?.isConnected || this.accounts.length === 0) {
          this.loading = false;
          this.pageLoading = false;
          this.errorMessage = 'No Gmail account connected.';
          return;
        }

        const savedAccountId =
          localStorage.getItem('selectedGoogleAccountId') || '';

        const savedAccountExists = this.accounts.some(
          (account) => account.id === savedAccountId
        );

        if (this.selectedAccountId) {
          const selectedExists = this.accounts.some(
            (account) => account.id === this.selectedAccountId
          );

          if (!selectedExists) {
            this.selectedAccountId = '';
          }
        }

        if (!this.selectedAccountId) {
          this.selectedAccountId = savedAccountExists
            ? savedAccountId
            : statusData.defaultAccount?.id || this.accounts[0].id;
        }

        localStorage.setItem('selectedGoogleAccountId', this.selectedAccountId);

        this.loadMessages();
      },
      error: (error) => {
        console.error('Google status error:', error);
        this.loading = false;
        this.pageLoading = false;
        this.errorMessage = 'Unable to fetch Google accounts.';
      },
    });
  }

  loadMessages(pageToken?: string): void {
    const isLoadMore = !!pageToken;

    if (isLoadMore) {
      this.isLoadingMore = true;
    } else {
      this.loading = true;
      this.pageLoading = true;
      this.messages = [];
      this.nextPageToken = null;
    }

    this.errorMessage = '';

    this.apiService
      .getGoogleGmailMessages(
        this.selectedAccountId,
        pageToken,
        this.pageLimit,
        this.selectedCategory,
        this.selectedDays,
        this.searchTerm
      )
      .subscribe({
        next: (messagesRes) => {
          this.summary = {
            accountId: this.selectedAccountId,
            accountEmail: this.selectedAccount?.email || '',
            totalEmails: messagesRes.summary?.totalEmails || 0,
            unreadEmails: messagesRes.summary?.unreadEmails || 0,
            importantEmails: messagesRes.summary?.importantEmails || 0,
          };

          const newMessages = messagesRes.data || [];

          this.messages = isLoadMore
            ? [...this.messages, ...newMessages]
            : newMessages;

          this.nextPageToken = messagesRes.pagination?.nextPageToken || null;

          this.loading = false;
          this.pageLoading = false;
          this.isLoadingMore = false;
        },
        error: (error) => {
          console.error('Gmail messages error:', error);

          this.loading = false;
          this.pageLoading = false;
          this.isLoadingMore = false;

          if (error?.status === 401 || error?.status === 403) {
            this.errorMessage =
              'Gmail permission expired. Please reconnect your Google account.';
            return;
          }

          this.errorMessage = 'Unable to fetch Gmail messages.';
        },
      });
  }

  loadMoreMessages(event: any): void {
    if (!this.nextPageToken || this.isLoadingMore) {
      event.target.complete();
      return;
    }

    this.isLoadingMore = true;

    this.apiService
      .getGoogleGmailMessages(
        this.selectedAccountId,
        this.nextPageToken,
        this.pageLimit,
        this.selectedCategory,
        this.selectedDays,
        this.searchTerm
      )
      .subscribe({
        next: (messagesRes) => {
          this.messages = [...this.messages, ...(messagesRes.data || [])];
          this.nextPageToken = messagesRes.pagination?.nextPageToken || null;
          this.isLoadingMore = false;

          event.target.complete();

          if (!this.nextPageToken) {
            event.target.disabled = true;
          }
        },
        error: (error) => {
          console.error('Load more Gmail error:', error);
          this.isLoadingMore = false;
          event.target.complete();
        },
      });
  }

  onAccountChange(event: any): void {
    const accountId = event.detail.value;

    if (!accountId || this.selectedAccountId === accountId) {
      return;
    }

    this.selectAccount(accountId);
  }

  selectAccount(accountId: string): void {
    if (this.selectedAccountId === accountId) {
      return;
    }

    this.selectedAccountId = accountId;
    localStorage.setItem('selectedGoogleAccountId', accountId);

    this.messages = [];
    this.nextPageToken = null;
    this.resetSummary();

    this.loadMessages();
  }

  onSearchEnter(): void {
    this.messages = [];
    this.nextPageToken = null;
    this.loadMessages();
  }

  openFilter(): void {
    this.isFilterModalOpen = true;
  }

  closeFilter(): void {
    this.isFilterModalOpen = false;
  }

  applyFilters(): void {
    this.isFilterModalOpen = false;
    this.messages = [];
    this.nextPageToken = null;
    this.loadMessages();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = 'ALL';
    this.selectedDays = 30;
    this.applyFilters();
  }

  get selectedAccount(): any {
    return this.accounts.find(
      (account) => account.id === this.selectedAccountId
    );
  }

  openMessage(message: any): void {
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
    if (this.loading || this.pageLoading) {
      return;
    }

    this.loadInbox();
  }

  goBack(): void {
    this.router.navigateByUrl('/dashboard');
  }

  trackByMessage(index: number, item: any): string {
    return item.id;
  }

  private resetSummary(): void {
    this.summary = {
      accountId: '',
      accountEmail: '',
      totalEmails: 0,
      unreadEmails: 0,
      importantEmails: 0,
    };
  }
}