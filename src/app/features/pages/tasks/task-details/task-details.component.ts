import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

import { ApiService } from '../../../../core/services/api';
import { ToastService } from '../../../../core/services/toast';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-details',
  templateUrl: './task-details.component.html',
  styleUrls: ['./task-details.component.scss'],
  standalone: true,
  imports: [CommonModule, DatePipe, IonContent, IonIcon],
})
export class TaskDetailsComponent implements OnInit {
  taskId = '';
  isLoading = false;

  task: Task | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiService: ApiService,
    private readonly toastService: ToastService
  ) {
    addIcons({
      arrowBackOutline,
      checkmarkCircleOutline,
    });
  }

  ngOnInit(): void {
    this.taskId = this.route.snapshot.paramMap.get('id') || '';

    console.log('Task Id:', this.taskId);

    if (!this.taskId) {
      this.toastService.error('Task id not found.');
      this.router.navigate(['/tasks']);
      return;
    }

    this.getTaskDetails();
  }

  getTaskDetails(): void {
    this.isLoading = true;

    this.apiService.getTaskById(this.taskId).subscribe({
      next: (res) => {
        console.log('Task details response:', res);

        this.task = res.data;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Task details error:', error);

        this.isLoading = false;
        this.toastService.error(
          error?.error?.message || 'Failed to fetch task details.'
        );

        this.router.navigate(['/tasks']);
      },
    });
  }

  goBack(): void {
    this.router.navigate(['/tasks']);
  }

  // completeTask(): void {
  //   console.log('Complete Task Clicked');

  //   if (!this.task) {
  //     return;
  //   }

  //   if (this.task.status === 'COMPLETED') {
  //     this.toastService.error('Task is already completed.');
  //     return;
  //   }

  //   if (this.task.completionType === 'PHOTO_PROOF') {
  //     this.router.navigate(['/tasks', this.taskId, 'complete']);
  //     return;
  //   }

  //   if (this.task.completionType === 'SELF_CONFIRM') {
  //     console.log('Self confirm task completion API will be called here');
  //   }
  // }

  completeTask(): void {
  console.log('Complete Task Clicked');

  if (!this.task) {
    return;
  }

  if (this.task.status === 'COMPLETED') {
    this.toastService.error('Task is already completed.');
    return;
  }

  if (this.task.completionType === 'PHOTO_PROOF') {
    this.router.navigate(['/tasks', this.taskId, 'complete']);
    return;
  }

  if (this.task.completionType === 'SELF_CONFIRM') {
    this.isLoading = true;

    this.apiService.completeTask(this.taskId).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastService.success('Task completed successfully.');
        this.router.navigate(['/tasks']);
      },
      error: (error) => {
        this.isLoading = false;
        this.toastService.error(
          error?.error?.message || 'Failed to complete task.'
        );
      },
    });
  }
}



  formatLabel(value?: string): string {
    if (!value) return '-';

    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}