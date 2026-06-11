import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { StorageService } from '../services/storage';

export const guestGuard: CanActivateFn = async () => {
  const storageService = inject(StorageService);
  const router = inject(Router);

  const isLoggedIn = await storageService.isLoggedIn();

  if (isLoggedIn) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};