import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  checkmarkCircleOutline,
  closeCircleOutline,
  alertCircleOutline,
  informationCircleOutline,
  closeOutline,
} from 'ionicons/icons';

import { ToastService } from '../../../core/services/toast';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './app-toast.component.html',
  styleUrls: ['./app-toast.component.scss'],
})
export class AppToastComponent {
  toast$ = this.toastService.toast$;

  constructor(public readonly toastService: ToastService) {
    addIcons({
      checkmarkCircleOutline,
      closeCircleOutline,
      alertCircleOutline,
      informationCircleOutline,
      closeOutline,
    });
  }

  getIcon(type: string): string {
    switch (type) {
      case 'success':
        return 'checkmark-circle-outline';
      case 'error':
        return 'close-circle-outline';
      case 'warning':
        return 'alert-circle-outline';
      default:
        return 'information-circle-outline';
    }
  }

  close(): void {
    this.toastService.hide();
  }
}