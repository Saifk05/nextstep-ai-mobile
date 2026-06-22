import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';

import {
  IonContent,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  IonSelect,
  IonSelectOption,
} from '@ionic/angular/standalone';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule } from '@angular/material/core';

import { addIcons } from 'ionicons';
import {
  airplaneOutline,
  alertCircleOutline,
  briefcaseOutline,
  calendarOutline,
  funnelOutline,
  locationOutline,
  notificationsOutline,
  peopleOutline,
  personOutline,
  searchOutline,
} from 'ionicons/icons';

import { ApiService } from '../../../core/services/api';
import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';

type CalendarFilter = 'today' | 'tomorrow' | 'week' | 'month';

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonIcon,
    IonSelect,
    IonSelectOption,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatNativeDateModule,
    AppFooterComponent,
  ],
  templateUrl: './calendar.page.html',
  styleUrls: ['./calendar.page.scss'],
})
export class CalendarPage implements OnInit {
  accounts: any[] = [];
  events: any[] = [];

  selectedAccountId = localStorage.getItem('selectedGoogleAccountId') || '';
  selectedFilter: CalendarFilter = 'today';

  searchText = '';

  startDate: Date | null = null;
  endDate: Date | null = null;

  showFilterDropdown = false;
  nextPageToken: string | null = null;
  hasMore = true;

  loading = false;
  loadingMore = false;

  private searchTimer: any;

  filters: { label: string; value: CalendarFilter }[] = [
    { label: 'Today', value: 'today' },
    { label: 'Tomorrow', value: 'tomorrow' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
  ];

  summary = {
    todayEvents: 0,
    upcomingMeetings: 0,
    deadlines: 0,
    interviews: 0,
  };

  constructor(private readonly api: ApiService) {
    addIcons({
      calendarOutline,
      searchOutline,
      funnelOutline,
      peopleOutline,
      briefcaseOutline,
      notificationsOutline,
      airplaneOutline,
      locationOutline,
      alertCircleOutline,
      personOutline,
    });
  }

  ngOnInit(): void {
    this.loadAccounts();
  }

  ionViewWillEnter(): void {
    if (this.selectedAccountId) {
      this.loadCalendar(true);
    }
  }

  loadAccounts(): void {
    this.api.getGoogleAccounts().subscribe({
      next: (res: any) => {
        this.accounts = res?.data || [];

        if (!this.accounts.length) {
          this.selectedAccountId = '';
          this.events = [];
          this.resetSummary();
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
          const defaultAccount =
            this.accounts.find((account) => account.isDefault) ||
            this.accounts[0];

          this.selectedAccountId = savedAccountExists
            ? savedAccountId
            : defaultAccount.id;
        }

        localStorage.setItem('selectedGoogleAccountId', this.selectedAccountId);
        this.loadCalendar(true);
      },
      error: () => {
        this.accounts = [];
        this.events = [];
        this.selectedAccountId = '';
        this.resetSummary();
      },
    });
  }

  onAccountChange(event: any): void {
    const accountId = event.detail.value;

    if (!accountId || this.selectedAccountId === accountId) {
      return;
    }

    this.selectedAccountId = accountId;
    localStorage.setItem('selectedGoogleAccountId', accountId);

    this.loadCalendar(true);
  }

  toggleFilterDropdown(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.showFilterDropdown = !this.showFilterDropdown;
  }

  selectFilter(filter: CalendarFilter): void {
    this.showFilterDropdown = false;
    this.changeFilter(filter);
  }

  onDateRangeChange(): void {
    if (!this.startDate || !this.endDate) {
      return;
    }

    this.showFilterDropdown = false;
    this.nextPageToken = null;
    this.hasMore = true;

    this.loadCalendar(true);
  }

  clearDateRange(): void {
    this.startDate = null;
    this.endDate = null;

    this.loadCalendar(true);
  }

  changeFilter(filter: CalendarFilter): void {
    this.startDate = null;
    this.endDate = null;

    if (this.selectedFilter === filter) {
      this.loadCalendar(true);
      return;
    }

    this.selectedFilter = filter;
    this.loadCalendar(true);
  }

  onSearchChange(): void {
    clearTimeout(this.searchTimer);

    this.searchTimer = setTimeout(() => {
      this.loadCalendar(true);
    }, 400);
  }

  loadCalendar(reset = false, infiniteEvent?: any): void {
    if (!this.selectedAccountId) {
      this.events = [];
      this.hasMore = false;
      this.resetSummary();
      infiniteEvent?.target?.complete();
      return;
    }

    if (reset) {
      this.loading = true;
      this.events = [];
      this.nextPageToken = null;
      this.hasMore = true;
    } else {
      this.loadingMore = true;
    }

    const rangeOrFilter =
      this.startDate && this.endDate
        ? this.buildDateRangeQuery(this.startDate, this.endDate)
        : this.selectedFilter;

    this.api
      .getGoogleCalendarEvents(
        this.selectedAccountId,
        rangeOrFilter,
        this.searchText,
        this.nextPageToken || undefined,
        10
      )
      .subscribe({
        next: (res: any) => {
          const newEvents = res?.data || [];

          this.events = reset ? newEvents : [...this.events, ...newEvents];

          this.summary =
            res?.summary || {
              todayEvents: this.events.length,
              upcomingMeetings: this.events.filter(
                (event) => event.category === 'MEETING'
              ).length,
              deadlines: this.events.filter(
                (event) => event.category === 'DEADLINE'
              ).length,
              interviews: this.events.filter(
                (event) => event.category === 'INTERVIEW'
              ).length,
            };

          this.nextPageToken = res?.pagination?.nextPageToken || null;
          this.hasMore = !!this.nextPageToken;

          this.loading = false;
          this.loadingMore = false;

          infiniteEvent?.target?.complete();
        },
        error: () => {
          this.loading = false;
          this.loadingMore = false;
          infiniteEvent?.target?.complete();
        },
      });
  }

  loadMore(event: any): void {
    if (!this.hasMore || this.loadingMore) {
      event.target.complete();
      event.target.disabled = !this.hasMore;
      return;
    }

    this.loadCalendar(false, event);
  }

  getCategoryIcon(category: string): string {
    const icons: Record<string, string> = {
      INTERVIEW: 'briefcase-outline',
      MEETING: 'people-outline',
      DEADLINE: 'alert-circle-outline',
      PERSONAL: 'person-outline',
      REMINDER: 'notifications-outline',
      TRAVEL: 'airplane-outline',
    };

    return icons[category] || 'calendar-outline';
  }

  getCategoryLabel(category: string): string {
    if (!category) {
      return 'Event';
    }

    return category.charAt(0) + category.slice(1).toLowerCase();
  }

  formatEventTime(event: any): string {
    if (event.isAllDay) {
      return 'All day';
    }

    if (!event.startTime) {
      return '';
    }

    return new Date(event.startTime).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  formatEventDate(event: any): string {
    if (!event.startTime) {
      return '';
    }

    return new Date(event.startTime).toLocaleDateString([], {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
    });
  }

  get selectedDateRangeLabel(): string {
    if (!this.startDate || !this.endDate) {
      return '';
    }

    return `${this.formatDateLabel(this.startDate)} - ${this.formatDateLabel(
      this.endDate
    )}`;
  }

  private buildDateRangeQuery(start: Date, end: Date): string {
    const startValue = this.formatApiDate(start);
    const endValue = this.formatApiDate(end);

    return `${startValue}_${endValue}`;
  }

  private formatApiDate(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  private formatDateLabel(date: Date): string {
    return date.toLocaleDateString([], {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  private resetSummary(): void {
    this.summary = {
      todayEvents: 0,
      upcomingMeetings: 0,
      deadlines: 0,
      interviews: 0,
    };
  }
}