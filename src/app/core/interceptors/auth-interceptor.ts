import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable, catchError, from, switchMap, throwError } from 'rxjs';

import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';

function isTokenExpired(token: string): boolean {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiryTime = payload.exp * 1000;

    return Date.now() >= expiryTime;
  } catch {
    return true;
  }
}

function refreshAndRetry(
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
  apiService: ApiService,
  storageService: StorageService
): Observable<HttpEvent<unknown>> {
  return from(storageService.getRefreshToken()).pipe(
    switchMap((refreshToken) => {
      if (!refreshToken) {
        return from(storageService.clearAuthStorage()).pipe(
          switchMap(() =>
            throwError(() => new Error('Refresh token not found'))
          )
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
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newAccessToken}`,
                },
              });

              return next(retryReq);
            })
          );
        }),
        catchError((refreshError: HttpErrorResponse) => {
          return from(storageService.clearAuthStorage()).pipe(
            switchMap(() => throwError(() => refreshError))
          );
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

  if (isAuthApi) {
    return next(req);
  }

  return from(storageService.getAccessToken()).pipe(
    switchMap((accessToken) => {
      if (accessToken && !isTokenExpired(accessToken)) {
        const authReq = req.clone({
          setHeaders: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        return next(authReq).pipe(
          catchError((error: HttpErrorResponse) => {
            if (error.status !== 401) {
              return throwError(() => error);
            }

            return refreshAndRetry(
              req,
              next,
              apiService,
              storageService
            );
          })
        );
      }

      return refreshAndRetry(req, next, apiService, storageService);
    })
  );
};