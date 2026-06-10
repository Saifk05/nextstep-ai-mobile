import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { from, switchMap } from 'rxjs';

import { StorageService } from '../services/storage';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const storageService = inject(StorageService);

  return from(storageService.getAccessToken()).pipe(
    switchMap((token) => {
      if (!token) {
        return next(req);
      }

      const authReq = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      });

      return next(authReq);
    })
  );
};