export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead: boolean;
  createdAt: string;
}

export interface NotificationPagination {
  limit: number;
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface NotificationsResponse {
  success: boolean;
  message: string;
  data: {
    notifications: NotificationItem[];
    pagination: NotificationPagination;
  };
}