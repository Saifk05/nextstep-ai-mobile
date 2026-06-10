import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
   * Logout User
   */
  logout(payload: LogoutPayload): Observable<any> {
    return this.http.post(
      `${this.clientUrl}/auth/logout`,
      payload
    );
  }
}