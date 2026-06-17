import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';

@Component({
  selector: 'app-popup',
  standalone: true,
  imports: [CommonModule, IonIcon],
  templateUrl: './app-popup.component.html',
  styleUrls: ['./app-popup.component.scss'],
})
export class AppPopupComponent {
  @Input() open = false;
  @Input() title = '';
  @Input() message = '';
  @Input() confirmText = 'Confirm';
  @Input() cancelText = 'Cancel';
  @Input() type: 'success' | 'warning' | 'danger' | 'info' = 'info';

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  onClose() {
    this.close.emit();
  }

  onConfirm() {
    this.confirm.emit();
  }
}