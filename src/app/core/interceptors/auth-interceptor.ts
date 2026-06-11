import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
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
      const authReq = accessToken
        ? req.clone({
            setHeaders: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
        : req;

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          if (error.status !== 401) {
            return throwError(() => error);
          }

          return from(storageService.getRefreshToken()).pipe(
            switchMap((refreshToken) => {
              if (!refreshToken) {
                return from(storageService.clearAuthStorage()).pipe(
                  switchMap(() => throwError(() => error))
                );
              }

              return apiService.refreshToken({ refreshToken }).pipe(
                switchMap((response) => {
                  const newAccessToken = response.data.accessToken;
                  const newRefreshToken = response.data.refreshToken;

                  return from(storageService.setAccessToken(newAccessToken)).pipe(
                    switchMap(() =>
                      from(storageService.setRefreshToken(newRefreshToken))
                    ),
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
                catchError((refreshError) => {
                  return from(storageService.clearAuthStorage()).pipe(
                    switchMap(() => throwError(() => refreshError))
                  );
                })
              );
            })
          );
        })
      );
    })
  );
};