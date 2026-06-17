import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardResponse } from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

import {
  ApiResponse,
  CreateTaskRequest,
  Task,
  TaskSummary,
  UpdateTaskRequest,
} from '../models/task.model';

import {
  GoogleConnectResponse,
  GoogleStatusResponse,
  GoogleCalendarEventsResponse,
  GmailStatusResponse,
  GmailMessagesResponse,
  GmailSummaryResponse,
  GoogleOtpSendPayload,
  GoogleOtpVerifyPayload,
  GoogleOtpResponse,
} from '../models/integration.model';

import {
  ProfileResponse,
  UpdateProfilePayload,
  AddressSuggestionsResponse,
  UpdateAddressPayload,
} from '../models/profile.model';

export interface RegisterPayload {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LogoutPayload {
  userId: string;
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  status: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    accessToken: string;
    refreshToken: string;
  };
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private readonly clientUrl = environment.clientUrl;

  constructor(private readonly http: HttpClient) {}

  /**
   * Register User
   */
  register(payload: RegisterPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.clientUrl}/auth/register`,
      payload
    );
  }

  /**
   * Login User
   */
  login(payload: LoginPayload): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.clientUrl}/auth/login`,
      payload
    );
  }

  /**
   * Refresh Access Token
   */
  refreshToken(payload: RefreshTokenPayload): Observable<RefreshTokenResponse> {
    return this.http.post<RefreshTokenResponse>(
      `${this.clientUrl}/auth/refresh-token`,
      payload
    );
  }

  /**
   * Logout User
   */
  logout(payload: LogoutPayload): Observable<any> {
    return this.http.post(
      `${this.clientUrl}/auth/logout`,
      payload
    );
  }

  /*
   * Dashboard Overview
   */
  getDashboardOverview(): Observable<DashboardResponse> {
    return this.http.get<DashboardResponse>(
      `${this.clientUrl}/dashboard/overview`
    );
  } 
  
  /*
   * User Profile
   */
  getProfile(): Observable<ProfileResponse> {
    return this.http.get<ProfileResponse>(
      `${this.clientUrl}/users/profile`
    );
  }

  updateProfile(
    payload: UpdateProfilePayload
  ): Observable<ProfileResponse> {
    return this.http.patch<ProfileResponse>(
      `${this.clientUrl}/users/profile`,
      payload
    );
  }

  getAddressSuggestions(
    query: string
  ): Observable<AddressSuggestionsResponse> {
    return this.http.get<AddressSuggestionsResponse>(
      `${this.clientUrl}/users/address/suggestions?query=${query}`
    );
  }

  updateAddress(
    payload: UpdateAddressPayload
  ): Observable<any> {
    return this.http.patch(
      `${this.clientUrl}/users/address`,
      payload
    );
  }

  updateProfilePicture(
    payload: FormData
  ): Observable<ProfileResponse> {
    return this.http.patch<ProfileResponse>(
      `${this.clientUrl}/users/profile-picture`,
      payload
    );
  }

  /*
   * Tasks
   */
  getTasks(): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(
      `${this.clientUrl}/tasks`
    );
  }

  getTodayTasks(): Observable<ApiResponse<Task[]>> {
    return this.http.get<ApiResponse<Task[]>>(
      `${this.clientUrl}/tasks/today`
    );
  }

  getTaskById(taskId: string): Observable<ApiResponse<Task>> {
    return this.http.get<ApiResponse<Task>>(
      `${this.clientUrl}/tasks/${taskId}`
    );
  }

  createTask(
    payload: CreateTaskRequest
  ): Observable<ApiResponse<Task>> {
    return this.http.post<ApiResponse<Task>>(
      `${this.clientUrl}/tasks`,
      payload
    );
  }

  updateTask(
    taskId: string,
    payload: UpdateTaskRequest
  ): Observable<ApiResponse<Task>> {
    return this.http.patch<ApiResponse<Task>>(
      `${this.clientUrl}/tasks/${taskId}`,
      payload
    );
  }

  deleteTask(taskId: string): Observable<ApiResponse<null>> {
    return this.http.delete<ApiResponse<null>>(
      `${this.clientUrl}/tasks/${taskId}`
    );
  }

  completeTask(taskId: string): Observable<ApiResponse<Task>> {
    return this.http.patch<ApiResponse<Task>>(
      `${this.clientUrl}/tasks/${taskId}/complete`,
      {}
    );
  }

  completeTaskWithProof(
    taskId: string,
    payload: FormData
  ): Observable<ApiResponse<Task>> {
    return this.http.patch<ApiResponse<Task>>(
      `${this.clientUrl}/tasks/${taskId}/complete-with-proof`,
      payload
    );
  }

  getTaskSummary(): Observable<ApiResponse<TaskSummary>> {
    return this.http.get<ApiResponse<TaskSummary>>(
      `${this.clientUrl}/tasks/summary`
    );
  }

  /*
 * Google Integrations
 */
getGoogleConnectUrl(): Observable<GoogleConnectResponse> {
  return this.http.get<GoogleConnectResponse>(
    `${this.clientUrl}/integrations/google/connect`
  );
}

getGoogleStatus(): Observable<GoogleStatusResponse> {
  return this.http.get<GoogleStatusResponse>(
    `${this.clientUrl}/integrations/google/status`
  );
}

sendGoogleConnectOtp(
  payload: GoogleOtpSendPayload
): Observable<GoogleOtpResponse> {
  return this.http.post<GoogleOtpResponse>(
    `${this.clientUrl}/integrations/google/connect/init`,
    payload
  );
}

verifyGoogleConnectOtp(
  payload: GoogleOtpVerifyPayload
): Observable<GoogleOtpResponse> {
  return this.http.post<GoogleOtpResponse>(
    `${this.clientUrl}/integrations/google/connect/verify-otp`,
    payload
  );
}

resendGoogleConnectOtp(
  payload: GoogleOtpSendPayload
): Observable<GoogleOtpResponse> {
  return this.http.post<GoogleOtpResponse>(
    `${this.clientUrl}/integrations/google/resend-otp`,
    payload
  );
}

disconnectGoogleAccount(accountId: string): Observable<any> {
  return this.http.delete(
    `${this.clientUrl}/integrations/google/accounts/${accountId}`
  );
}

getGoogleCalendarEvents(
  accountId?: string
): Observable<GoogleCalendarEventsResponse> {
  const query = accountId ? `?accountId=${accountId}` : '';

  return this.http.get<GoogleCalendarEventsResponse>(
    `${this.clientUrl}/integrations/google/calendar/events${query}`
  );
}

getGoogleGmailStatus(): Observable<GmailStatusResponse> {
  return this.http.get<GmailStatusResponse>(
    `${this.clientUrl}/integrations/google/gmail/status`
  );
}

getGoogleGmailMessages(
  accountId?: string,
  pageToken?: string,
  limit: number = 10
): Observable<GmailMessagesResponse> {
  const params: string[] = [];

  if (accountId) {
    params.push(`accountId=${accountId}`);
  }

  if (pageToken) {
    params.push(`pageToken=${pageToken}`);
  }

  if (limit) {
    params.push(`limit=${limit}`);
  }

  const query = params.length ? `?${params.join('&')}` : '';

  return this.http.get<GmailMessagesResponse>(
    `${this.clientUrl}/integrations/google/gmail/messages${query}`
  );
}

getGoogleUnreadMessages(
  accountId?: string
): Observable<GmailMessagesResponse> {
  const query = accountId ? `?accountId=${accountId}` : '';

  return this.http.get<GmailMessagesResponse>(
    `${this.clientUrl}/integrations/google/gmail/unread${query}`
  );
}

getGoogleGmailSummary(
  accountId?: string
): Observable<GmailSummaryResponse> {
  const query = accountId ? `?accountId=${accountId}` : '';

  return this.http.get<GmailSummaryResponse>(
    `${this.clientUrl}/integrations/google/gmail/summary${query}`
  );
}

}