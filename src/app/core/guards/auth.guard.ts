import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { StorageService } from '../services/storage';

export const authGuard: CanActivateFn = async () => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  const isLoggedIn = await storageService.isLoggedIn();

  if (isLoggedIn) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};