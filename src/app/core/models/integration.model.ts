export interface GoogleConnectResponse {
  success: boolean;
  message: string;
  data: {
    url: string;
  };
}

export interface GoogleStatusResponse {
  success: boolean;
  message: string;
  data: {
    isConnected: boolean;
    provider: 'GOOGLE';
    email: string | null;
    connectedAt: string | null;
    calendarConnected: boolean;
    gmailConnected: boolean;
  };
}

export interface GoogleCalendarEvent {
  id: string;
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
  };
}

export interface GmailMessage {
  id: string;
  threadId: string;
  subject: string;
  from: string;
  snippet: string;
  receivedAt: string | null;
  isUnread: boolean;
}

export interface GmailMessagesResponse {
  success: boolean;
  message: string;
  data: GmailMessage[];
}

export interface GmailSummary {
  totalEmails: number;
  unreadEmails: number;
  importantEmails: number;
}

export interface GmailSummaryResponse {
  success: boolean;
  message: string;
  data: GmailSummary;
}