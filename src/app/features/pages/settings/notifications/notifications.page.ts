import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  NavController,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  notificationsOutline,
  trashOutline,
  checkmarkDoneOutline,
  timeOutline,
  alertCircleOutline,
  informationCircleOutline,
  mailOutline,
  calendarOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

import { ApiService } from '../../../../core/services/api';
import { ToastService } from '../../../../core/services/toast';
import { NotificationItem } from '../../../../core/models/notification.model';

@Component({
  selector: 'app-notifications',
  standalone: true,
  templateUrl: './notifications.page.html',
  styleUrls: ['./notifications.page.scss'],
  imports: [
    CommonModule,
    IonContent,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
  ],
})
export class NotificationsPage implements OnInit {
  notifications: NotificationItem[] = [];

  isLoading = true;
  isLoadingMore = false;

  limit = 10;
  nextCursor: string | null = null;
  hasNextPage = false;

  constructor(
    private readonly apiService: ApiService,
    private readonly toastService: ToastService,
    private readonly navCtrl: NavController
  ) {
    addIcons({
      arrowBackOutline,
      notificationsOutline,
      trashOutline,
      checkmarkDoneOutline,
      timeOutline,
      alertCircleOutline,
      informationCircleOutline,
      mailOutline,
      calendarOutline,
      checkmarkCircleOutline,
    });
  }

  ngOnInit(): void {
    this.loadNotifications();
  }

  ionViewWillEnter(): void {
    this.loadNotifications();
  }

  loadNotifications(event?: any): void {
    this.isLoading = !event;
    this.nextCursor = null;
    this.hasNextPage = false;

    this.apiService.getNotifications(undefined, this.limit).subscribe({
      next: (response: any) => {
        const data = response?.data || response;

        this.notifications = this.normalizeNotifications(
          data?.notifications || []
        );

        this.nextCursor = data?.pagination?.nextCursor || null;
        this.hasNextPage = !!data?.pagination?.hasNextPage;

        this.isLoading = false;
        event?.target?.complete();
      },
      error: () => {
        this.isLoading = false;
        event?.target?.complete();
        this.toastService.error('Unable to load notifications');
      },
    });
  }

  loadMore(event: any): void {
    if (!this.hasNextPage || !this.nextCursor || this.isLoadingMore) {
      event?.target?.complete();
      return;
    }

    this.isLoadingMore = true;

    this.apiService.getNotifications(this.nextCursor, this.limit).subscribe({
      next: (response: any) => {
        const data = response?.data || response;

        this.notifications = [
          ...this.notifications,
          ...this.normalizeNotifications(data?.notifications || []),
        ];

        this.nextCursor = data?.pagination?.nextCursor || null;
        this.hasNextPage = !!data?.pagination?.hasNextPage;

        this.isLoadingMore = false;
        event?.target?.complete();
      },
      error: () => {
        this.isLoadingMore = false;
        event?.target?.complete();
        this.toastService.error('Unable to load more notifications');
      },
    });
  }

  markAsRead(notification: NotificationItem): void {
    if (notification.isRead) {
      return;
    }

    this.apiService.markNotificationAsRead(notification.id).subscribe({
      next: () => {
        notification.isRead = true;
      },
      error: () => {
        this.toastService.error('Unable to mark notification as read');
      },
    });
  }

  markAllAsRead(): void {
    if (!this.notifications.length) {
      return;
    }

    this.apiService.markAllNotificationsAsRead().subscribe({
      next: () => {
        this.notifications = this.notifications.map((notification) => ({
          ...notification,
          isRead: true,
        }));

        this.toastService.success('All notifications marked as read');
      },
      error: () => {
        this.toastService.error('Unable to update notifications');
      },
    });
  }

  deleteNotification(event: Event, notificationId: string): void {
    event.stopPropagation();

    this.apiService.deleteNotification(notificationId).subscribe({
      next: () => {
        this.notifications = this.notifications.filter(
          (notification) => notification.id !== notificationId
        );

        this.toastService.success('Notification deleted');
      },
      error: () => {
        this.toastService.error('Unable to delete notification');
      },
    });
  }

  private normalizeNotifications(items: any[]): NotificationItem[] {
    return items.map((item) => ({
      ...item,
      id: item.id || item._id,
      type: item.type || item.source || 'SYSTEM',
      title: item.title || 'Notification',
      message: this.cleanMessage(item.message || ''),
      createdAt: item.createdAt || item.updatedAt,
      isRead: !!item.isRead,
    }));
  }

  private cleanMessage(message: string): string {
    return message
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .replace(/‌/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  }

  get unreadCount(): number {
    return this.notifications.filter((notification) => !notification.isRead)
      .length;
  }

  getIconName(notification: NotificationItem): string {
    const source = (notification.type || '').toUpperCase();

    if (source === 'GMAIL') {
      return 'mail-outline';
    }

    if (source === 'CALENDAR') {
      return 'calendar-outline';
    }

    if (source === 'TASK') {
      return 'checkmark-circle-outline';
    }

    if (source === 'ERROR' || source === 'WARNING') {
      return 'alert-circle-outline';
    }

    if (source === 'INFO') {
      return 'information-circle-outline';
    }

    return 'notifications-outline';
  }

  getTimeAgo(date?: string): string {
    if (!date) {
      return 'Just now';
    }

    const diff = Date.now() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;

    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  goBack(): void {
    this.navCtrl.navigateBack('/settings');
  }
}