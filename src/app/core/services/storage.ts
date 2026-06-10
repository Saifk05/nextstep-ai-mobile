import { Injectable } from '@angular/core';
import { Preferences } from '@capacitor/preferences';

import { User } from './api';

@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private readonly ACCESS_TOKEN_KEY = 'accessToken';
  private readonly REFRESH_TOKEN_KEY = 'refreshToken';
  private readonly USER_KEY = 'user';

  async setAccessToken(token: string): Promise<void> {
    await Preferences.set({
      key: this.ACCESS_TOKEN_KEY,
      value: token,
    });
  }

  async getAccessToken(): Promise<string | null> {
    const result = await Preferences.get({
      key: this.ACCESS_TOKEN_KEY,
    });

    return result.value;
  }

  async setRefreshToken(token: string): Promise<void> {
    await Preferences.set({
      key: this.REFRESH_TOKEN_KEY,
      value: token,
    });
  }

  async getRefreshToken(): Promise<string | null> {
    const result = await Preferences.get({
      key: this.REFRESH_TOKEN_KEY,
    });

    return result.value;
  }

  async setUser(user: User): Promise<void> {
    await Preferences.set({
      key: this.USER_KEY,
      value: JSON.stringify(user),
    });
  }

  async getUser(): Promise<User | null> {
    const result = await Preferences.get({
      key: this.USER_KEY,
    });

    if (!result.value) {
      return null;
    }

    return JSON.parse(result.value) as User;
  }

  async isLoggedIn(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  async clearAuthStorage(): Promise<void> {
    await Preferences.remove({
      key: this.ACCESS_TOKEN_KEY,
    });

    await Preferences.remove({
      key: this.REFRESH_TOKEN_KEY,
    });

    await Preferences.remove({
      key: this.USER_KEY,
    });
  }
}