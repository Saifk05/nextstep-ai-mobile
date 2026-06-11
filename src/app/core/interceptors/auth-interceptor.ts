import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';

import { ApiService } from '../services/api';
import { StorageService } from '../services/storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);
  const apiService = inject(ApiService);

  console.log('================================');
  console.log('Request URL:', req.url);

  const isAuthApi =
    req.url.includes('/auth/login') ||
    req.url.includes('/auth/register') ||
    req.url.includes('/auth/refresh-token');

  if (isAuthApi) {
    console.log('Auth API detected. Skipping token attachment.');
    return next(req);
  }

  return from(storageService.getAccessToken()).pipe(
    switchMap((accessToken) => {
      console.log('Access Token from Storage:', accessToken);

      const authReq = accessToken
        ? req.clone({
            setHeaders: {
              Authorization: `Bearer ${accessToken}`,
            },
          })
        : req;

      if (accessToken) {
        console.log('Authorization Header Attached');
      } else {
        console.warn('No Access Token Found');
      }

      return next(authReq).pipe(
        catchError((error: HttpErrorResponse) => {
          console.error(
            'API Error:',
            error.status,
            error.error
          );

          if (error.status !== 401) {
            return throwError(() => error);
          }

          console.warn('401 Received. Trying Refresh Token Flow...');

          return from(storageService.getRefreshToken()).pipe(
            switchMap((refreshToken) => {
              console.log(
                'Refresh Token from Storage:',
                refreshToken
              );

              if (!refreshToken) {
                console.error('No Refresh Token Found');

                return from(storageService.clearAuthStorage()).pipe(
                  switchMap(() => throwError(() => error))
                );
              }

              console.log('Calling Refresh Token API...');

              return apiService.refreshToken({ refreshToken }).pipe(
                switchMap((response) => {
                  console.log(
                    'Refresh Token Success:',
                    response
                  );

                  const newAccessToken =
                    response.data.accessToken;

                  const newRefreshToken =
                    response.data.refreshToken;

                  console.log(
                    'New Access Token:',
                    newAccessToken
                  );

                  console.log(
                    'New Refresh Token:',
                    newRefreshToken
                  );

                  return from(
                    Promise.all([
                      storageService.setAccessToken(
                        newAccessToken
                      ),
                      storageService.setRefreshToken(
                        newRefreshToken
                      ),
                    ])
                  ).pipe(
                    switchMap(() => {
                      console.log(
                        'New tokens saved. Retrying original request...'
                      );

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
                  console.error(
                    'Refresh Token Failed:',
                    refreshError
                  );

                  return from(
                    storageService.clearAuthStorage()
                  ).pipe(
                    switchMap(() =>
                      throwError(() => refreshError)
                    )
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