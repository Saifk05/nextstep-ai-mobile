import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  BehaviorSubject,
  Observable,
  catchError,
  filter,
  finalize,
  from,
  switchMap,
  take,
  throwError,
} from 'rxjs';

import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';

let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<string | null>(null);

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return Date.now() >= payload.exp * 1000;
  } catch {
    return true;
  }
}

function addToken(
  req: HttpRequest<unknown>,
  token: string
): HttpRequest<unknown> {
  return req.clone({
    setHeaders: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function refreshAndRetry(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  apiService: ApiService,
  storageService: StorageService
): Observable<HttpEvent<unknown>> {
  if (isRefreshing) {
    return refreshTokenSubject.pipe(
      filter((token): token is string => token !== null),
      take(1),
      switchMap((token) => next(addToken(req, token)))
    );
  }

  isRefreshing = true;
  refreshTokenSubject.next(null);

  return from(storageService.getRefreshToken()).pipe(
    switchMap((refreshToken) => {
      if (!refreshToken) {
        return from(storageService.clearAuthStorage()).pipe(
          switchMap(() => throwError(() => new Error('Refresh token not found')))
        );
      }

      return apiService.refreshToken({ refreshToken }).pipe(
        switchMap((response) => {
          const newAccessToken = response.data.accessToken;
          const newRefreshToken = response.data.refreshToken;

          return from(
            Promise.all([
              storageService.setAccessToken(newAccessToken),
              storageService.setRefreshToken(newRefreshToken),
            ])
          ).pipe(
            switchMap(() => {
              refreshTokenSubject.next(newAccessToken);
              return next(addToken(req, newAccessToken));
            })
          );
        }),
        catchError((error: HttpErrorResponse) => {
          refreshTokenSubject.next(null);

          return from(storageService.clearAuthStorage()).pipe(
            switchMap(() => throwError(() => error))
          );
        }),
        finalize(() => {
          isRefreshing = false;
        })
      );
    })
  );
}

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> => {
  const storageService = inject(StorageService);
  const apiService = inject(ApiService);

  const isAuthApi =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh-token');

  const isGoogleIntegrationApi = req.url.includes('/integrations/google');

  if (isAuthApi) {
    return next(req);
  }

  return from(storageService.getAccessToken()).pipe(
    switchMap((accessToken) => {
      if (!accessToken || isTokenExpired(accessToken)) {
        return refreshAndRetry(req, next, apiService, storageService);
      }

      return next(addToken(req, accessToken)).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status !== 401) {
            return throwError(() => error);
          }

          if (isGoogleIntegrationApi) {
            return throwError(() => error);
          }

          return refreshAndRetry(req, next, apiService, storageService);
        })
      );
    })
  );
};