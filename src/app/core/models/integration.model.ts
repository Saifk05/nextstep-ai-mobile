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
  accountType?: string;
  calendarConnected?: boolean;
  gmailConnected?: boolean;
  connectedAt?: string | null;
}

export interface GoogleStatusResponse {
  success: boolean;
  message: string;
  data: {
    isConnected: boolean;
    accounts: GoogleConnectedAccount[];
  };
}

export interface GoogleOtpSendPayload {
  email: string;
}

export interface GoogleOtpVerifyPayload {
  email: string;
  otp: string;
}

export interface GoogleOtpResponse {
  success: boolean;
  message: string;
  data?: {
    email: string;
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
  htmlLink: string;
  status: string;
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
    isConnected: boolean;
    accounts: GoogleConnectedAccount[];
  };
}

export type GmailCategory =
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

export interface GmailMessage {
  id: string;
  threadId: string;
  accountId: string;
  accountEmail: string;
  subject: string;
  from: string;
  snippet: string;
  receivedAt: string | null;
  isUnread: boolean;
  category?: GmailCategory;
}

export interface GmailMessagesResponse {
  success: boolean;
  message: string;
  data: GmailMessage[];
}

export interface GmailSummary {
  accountId?: string;
  accountEmail?: string;
  totalEmails: number;
  unreadEmails: number;
  importantEmails: number;
  categories?: {
    work: number;
    meetings: number;
    finance: number;
    invoices: number;
    subscriptions: number;
    promotions: number;
    social: number;
    personal: number;
    travel: number;
    other: number;
  };
}

export interface GmailSummaryResponse {
  success: boolean;
  message: string;
  data: GmailSummary;
}