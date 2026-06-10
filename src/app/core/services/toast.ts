import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface AppToast {
  message: string;
  type: ToastType;
  visible: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private readonly toastSubject = new BehaviorSubject<AppToast>({
    message: '',
    type: 'info',
    visible: false,
  });

  toast$ = this.toastSubject.asObservable();

  private timer: ReturnType<typeof setTimeout> | null = null;

  show(message: string, type: ToastType = 'info', duration = 3000): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }

    this.toastSubject.next({
      message,
      type,
      visible: true,
    });

    this.timer = setTimeout(() => {
      this.hide();
    }, duration);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  hide(): void {
    this.toastSubject.next({
      message: '',
      type: 'info',
      visible: false,
    });
  }
}