import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { AppFooterComponent } from '../../../../shared/components/app-footer/app-footer.component';

import { addIcons } from 'ionicons';
import {
  addOutline,
  calendarOutline,
  checkmarkCircleOutline,
  chevronForwardOutline,
  clipboardOutline,
  flameOutline,
  funnelOutline,
  searchOutline,
} from 'ionicons/icons';

import { ApiService } from '../../../../core/services/api';
import { Task } from '../../../../core/models/task.model';

@Component({
  selector: 'app-task-list',
  templateUrl: './task-list.component.html',
  styleUrls: ['./task-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonContent,
    IonIcon,
    AppFooterComponent,
  ],
})
export class TaskListComponent implements OnInit {
  tasks: Task[] = [];
  isLoading = false;
  errorMessage = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {
    addIcons({
      addOutline,
      calendarOutline,
      checkmarkCircleOutline,
      chevronForwardOutline,
      clipboardOutline,
      flameOutline,
      funnelOutline,
      searchOutline,
    });
  }

  ngOnInit(): void {
    console.log('TaskListComponent Loaded:', this.router.url);
    // this.loadTasks();
  }


  ionViewWillEnter(): void {
    console.log('TaskListComponent Entered:', this.router.url);
    this.loadTasks();
  }

  loadTasks(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.apiService.getTasks().subscribe({
      next: (response) => {
        this.tasks = response.data || [];
        this.isLoading = false;
      },
      error: (error) => {
        this.errorMessage =
          error?.error?.message || 'Unable to load tasks. Please try again.';
        this.isLoading = false;
      },
    });
  }

  goToAddTask(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    console.log('Clicked Add Task');
    console.log('Current URL Before:', this.router.url);

    this.router.navigateByUrl('/tasks/add').then((success) => {
      console.log('Navigation Success:', success);
      console.log('Current URL After:', this.router.url);
    });
  }

  openTask(task: Task, event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    const taskId = task._id || task.id;

    if (!taskId) {
      return;
    }

    this.router.navigateByUrl(`/tasks/${taskId}`);
  }

  get totalTasks(): number {
    return this.tasks.length;
  }

  get completedTasks(): number {
    return this.tasks.filter((task) => task.status === 'COMPLETED').length;
  }

  get pendingTasks(): number {
    return this.tasks.filter((task) => task.status === 'PENDING').length;
  }

  get overdueTasks(): number {
    return this.tasks.filter((task) => task.status === 'OVERDUE').length;
  }

  getPriorityClass(priority?: string): string {
    return `priority-${priority?.toLowerCase() || 'medium'}`;
  }

  getStatusClass(status?: string): string {
    return `status-${status?.toLowerCase() || 'pending'}`;
  }

  formatLabel(value?: string): string {
    if (!value) {
      return '';
    }

    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  trackByTaskId(index: number, task: Task): string {
    return task._id || task.id || index.toString();
  }
}