import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardResponse } from '../models/dashboard.model';
import { environment } from '../../../environments/environment';

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
}