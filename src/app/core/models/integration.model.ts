export type GoogleAccountType = 'PERSONAL' | 'WORK';

export interface GoogleConnectResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
  };
}

export interface GoogleConnectedAccount {
  id: string;
  provider?: 'GOOGLE';
  email: string;
  scopes?: string[];
  isPrimary?: boolean;
  isDefault?: boolean;
  enabledServices?: string[];
  accountType?: GoogleAccountType;
  calendarConnected?: boolean;
  gmailConnected?: boolean;
  connectedAt?: string | null;
}

export interface GoogleStatusResponse {
  success: boolean;
  message: string;
  data: {
    isConnected: boolean;
    provider?: 'GOOGLE';
    totalConnectedAccounts?: number;
    defaultAccount?: GoogleConnectedAccount | null;
    accounts: GoogleConnectedAccount[];
  };
}

export interface GoogleOtpSendPayload {
  email?: string;
}

export interface GoogleOtpVerifyPayload {
  email?: string;
  otp: string;
}

export interface GoogleOtpResponse {
  success: boolean;
  message: string;
  data?: {
    email?: string;
    expiryMinutes?: number;
  };
}

export interface GoogleCalendarEvent {
  id: string;
  accountId?: string;
  accountEmail?: string;
  title: string;
  description: string;
  location: string;
  start: string | null;
  end: string | null;
  htmlLink?: string;
  status?: string;
}

export interface GoogleCalendarEventsResponse {
  success: boolean;
  message: string;
  data: GoogleCalendarEvent[];
}

export interface GmailStatusResponse {
  success: boolean;
  message: string;
  data: {
    accountId?: string;
    email?: string;
    isConnected: boolean;
    accounts?: GoogleConnectedAccount[];
  };
}

export type GmailCategory =
  | 'INTERVIEW'
  | 'SUBSCRIPTION'
  | 'DEADLINE'
  | 'MEETING'
  | 'WORK'
  | 'MEETINGS'
  | 'FINANCE'
  | 'INVOICES'
  | 'SUBSCRIPTIONS'
  | 'PROMOTIONS'
  | 'SOCIAL'
  | 'PERSONAL'
  | 'TRAVEL'
  | 'OTHER';

export type GmailPriority = 'HIGH' | 'MEDIUM' | 'LOW';

export interface GmailMessage {
  id: string;
  threadId: string;
  accountId?: string;
  accountEmail?: string;
  subject: string;
  from: string;
  snippet: string;
  receivedAt: string | null;
  isUnread: boolean;
  category?: GmailCategory;
  priority?: GmailPriority;
}

export interface GmailSummary {
  accountId?: string;
  accountEmail?: string;
  totalEmails: number;
  unreadEmails: number;
  importantEmails: number;
  categories?: {
    work?: number;
    meetings?: number;
    finance?: number;
    invoices?: number;
    subscriptions?: number;
    promotions?: number;
    social?: number;
    personal?: number;
    travel?: number;
    interview?: number;
    deadline?: number;
    subscription?: number;
    meeting?: number;
    other?: number;
  };
}

export interface GmailPagination {
  nextPageToken: string | null;
  resultSizeEstimate: number;
  limit: number;
}

export interface GmailMessagesResponse {
  success: boolean;
  message: string;
  summary?: GmailSummary;
  data: GmailMessage[];
  pagination?: GmailPagination;
}

export interface GmailSummaryResponse {
  success: boolean;
  message: string;
  data: GmailSummary;
}