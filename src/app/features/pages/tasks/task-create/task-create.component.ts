import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import {
  IonContent,
  IonIcon,
  NavController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  calendarOutline,
  cameraOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';

import { ApiService } from '../../../../core/services/api';
import { ToastService } from '../../../../core/services/toast';
import {
  CompletionType,
  CreateTaskRequest,
  TaskPriority,
} from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-create',
  templateUrl: './task-create.component.html',
  styleUrls: ['./task-create.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,

    IonContent,
    IonIcon,

    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatIconModule,
  ],
})
export class TaskCreateComponent {
  title = '';
  description = '';
  dueDate: Date | null = null;

  priority: TaskPriority = 'MEDIUM';
  category = '';
  completionType: CompletionType = 'SELF_CONFIRM';
  minimumCompletionMinutes: number | null = null;

  isSubmitting = false;

  priorities: TaskPriority[] = ['LOW', 'MEDIUM', 'HIGH'];

  categories = [
    'HEALTH',
    'STUDY',
    'WORK',
    'PERSONAL',
    'FINANCE',
    'FITNESS',
    'OTHER',
  ];

  constructor(
    private readonly apiService: ApiService,
    private readonly toastService: ToastService,
    private readonly navCtrl: NavController,
    private readonly router: Router
  ) {
    addIcons({
      arrowBackOutline,
      calendarOutline,
      cameraOutline,
      checkmarkCircleOutline,
    });
  }

  goBack(): void {
    this.navCtrl.back();
  }

  selectPriority(priority: TaskPriority): void {
    this.priority = priority;
  }

  selectCompletionType(type: CompletionType): void {
    this.completionType = type;
  }

  createTask(): void {
    if (this.isSubmitting) {
      return;
    }

    const title = this.title.trim();
    const description = this.description.trim();

    if (!title) {
      this.toastService.error('Task title is required.');
      return;
    }

    if (!this.category) {
      this.toastService.error('Please select a category.');
      return;
    }

    const payload: CreateTaskRequest = {
      title,
      description: description || undefined,
      dueDate: this.dueDate ? this.dueDate.toISOString() : undefined,
      priority: this.priority,
      category: this.category,
      completionType: this.completionType,
      minimumCompletionMinutes: this.minimumCompletionMinutes || 0,
    };

    this.isSubmitting = true;

    this.apiService.createTask(payload).subscribe({
      next: (response) => {
        this.isSubmitting = false;

        this.toastService.success(
          response.message || 'Task created successfully.'
        );

        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        this.isSubmitting = false;

        this.toastService.error(
          error?.error?.message || 'Unable to create task. Please try again.'
        );
      },
    });
  }

  formatLabel(value: string): string {
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}