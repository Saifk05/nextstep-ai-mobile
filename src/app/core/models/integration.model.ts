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