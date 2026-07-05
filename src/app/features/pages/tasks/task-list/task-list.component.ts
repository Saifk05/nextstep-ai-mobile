import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
} from '@ionic/angular/standalone';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

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
    FormsModule,
    IonContent,
    IonIcon,
    IonInfiniteScroll,
    IonInfiniteScrollContent,
    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    AppFooterComponent,
  ],
})
export class TaskListComponent implements OnInit {
  allTasks: Task[] = [];
  tasks: Task[] = [];

  isLoading = false;
  isLoadingMore = false;
  errorMessage = '';

  nextCursor: string | null = null;
  hasMore = true;
  readonly taskLimit = 5;

  searchText = '';
  showStatusFilter = false;
  selectedStatus = 'ALL';

  dateRange: {
    start: Date | null;
    end: Date | null;
  } = {
    start: null,
    end: null,
  };

  statusOptions = [
    { label: 'All', value: 'ALL' },
    { label: 'Pending', value: 'PENDING' },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Missed', value: 'MISSED' },
  ];

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
  }

  ionViewWillEnter(): void {
    console.log('TaskListComponent Entered:', this.router.url);
    this.loadTasks(true);
  }

  loadTasks(reset = false, event?: any): void {
    if (reset) {
      this.allTasks = [];
      this.tasks = [];
      this.nextCursor = null;
      this.hasMore = true;
    }

    if (!this.hasMore && !reset) {
      event?.target?.complete();
      return;
    }

    this.isLoading = reset;
    this.isLoadingMore = !reset;
    this.errorMessage = '';

    this.apiService
      .getTasks(this.nextCursor || undefined, this.taskLimit)
      .subscribe({
        next: (response: any) => {
          const newTasks = response.data || [];

          this.allTasks = reset
            ? newTasks
            : [...this.allTasks, ...newTasks];

          this.nextCursor = response.pagination?.nextCursor || null;
          this.hasMore = !!response.pagination?.hasMore;

          this.applyFilters();

          this.isLoading = false;
          this.isLoadingMore = false;

          event?.target?.complete();

          if (!this.hasMore && event?.target) {
            event.target.disabled = true;
          }
        },
        error: (error) => {
          this.errorMessage =
            error?.error?.message || 'Unable to load tasks. Please try again.';

          this.isLoading = false;
          this.isLoadingMore = false;

          event?.target?.complete();
        },
      });
  }

  loadMoreTasks(event: any): void {
    this.loadTasks(false, event);
  }

  goToAddTask(event?: Event): void {
    event?.preventDefault();
    event?.stopPropagation();

    this.router.navigateByUrl('/tasks/add');
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

  toggleStatusFilter(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    this.showStatusFilter = !this.showStatusFilter;
  }

  selectStatus(status: string): void {
    this.selectedStatus = status;
    this.showStatusFilter = false;
    this.applyFilters();
  }

  applyFilters(): void {
    let filteredTasks = [...this.allTasks];

    const search = this.searchText.trim().toLowerCase();

    if (search) {
      filteredTasks = filteredTasks.filter((task) => {
        const title = task.title?.toLowerCase() || '';
        const description = task.description?.toLowerCase() || '';
        const category = task.category?.toLowerCase() || '';

        return (
          title.includes(search) ||
          description.includes(search) ||
          category.includes(search)
        );
      });
    }

    if (this.selectedStatus !== 'ALL') {
      filteredTasks = filteredTasks.filter(
        (task) => task.status === this.selectedStatus
      );
    }

    if (this.dateRange.start && this.dateRange.end) {
      const start = new Date(this.dateRange.start);
      start.setHours(0, 0, 0, 0);

      const end = new Date(this.dateRange.end);
      end.setHours(23, 59, 59, 999);

      filteredTasks = filteredTasks.filter((task) => {
        if (!task.dueDate) {
          return false;
        }

        const dueDate = new Date(task.dueDate);
        return dueDate >= start && dueDate <= end;
      });
    }

    this.tasks = filteredTasks;
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFilters();
  }

  clearStatusFilter(): void {
    this.selectedStatus = 'ALL';
    this.applyFilters();
  }

  clearDateFilter(): void {
    this.dateRange = {
      start: null,
      end: null,
    };

    this.applyFilters();
  }

  clearAllFilters(): void {
    this.searchText = '';
    this.selectedStatus = 'ALL';
    this.dateRange = {
      start: null,
      end: null,
    };

    this.applyFilters();
  }

  get isDateFilterActive(): boolean {
    return !!this.dateRange.start && !!this.dateRange.end;
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

  get missedTasks(): number {
    return this.tasks.filter((task) => task.status === 'MISSED').length;
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