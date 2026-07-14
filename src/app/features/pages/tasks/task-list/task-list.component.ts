import {
  CommonModule,
  DatePipe,
} from '@angular/common';

import {
  Component,
  OnInit,
} from '@angular/core';

import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import {
  IonContent,
  IonIcon,
  IonInfiniteScroll,
  IonInfiniteScrollContent,
  // IonSpinner,
} from '@ionic/angular/standalone';

import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

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

import { addIcons } from 'ionicons';

import { AppFooterComponent } from '../../../../shared/components/app-footer/app-footer.component';

import { ApiService } from '../../../../core/services/api';
import { Task } from '../../../../core/models/task.model';

type TaskStatusFilter =
  | 'ALL'
  | 'PENDING'
  | 'COMPLETED'
  | 'MISSED';

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
    // IonSpinner,
    IonInfiniteScrollContent,

    MatFormFieldModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,

    AppFooterComponent,
  ],
})
export class TaskListComponent implements OnInit {
  /*
   * Tasks returned by the backend.
   */
  allTasks: Task[] = [];

  /*
   * Tasks displayed after applying local text search.
   *
   * Status and date filters are handled by the backend.
   */
  tasks: Task[] = [];

  isLoading = false;
  isLoadingMore = false;

  errorMessage = '';

  nextCursor: string | null = null;
  hasMore = true;

  readonly taskLimit = 5;

  searchText = '';

  showStatusFilter = false;

  selectedStatus: TaskStatusFilter = 'ALL';

  /*
   * The backend currently supports one exact date.
   *
   * dateRange.start is sent as:
   * YYYY-MM-DD
   */
  dateRange: {
    start: Date | null;
    end: Date | null;
  } = {
    start: null,
    end: null,
  };

  readonly statusOptions: Array<{
    label: string;
    value: TaskStatusFilter;
  }> = [
    {
      label: 'All',
      value: 'ALL',
    },
    {
      label: 'Pending',
      value: 'PENDING',
    },
    {
      label: 'Completed',
      value: 'COMPLETED',
    },
    {
      label: 'Missed',
      value: 'MISSED',
    },
  ];

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router,
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
    console.log(
      'TaskListComponent Loaded:',
      this.router.url,
    );
  }

  ionViewWillEnter(): void {
    console.log(
      'TaskListComponent Entered:',
      this.router.url,
    );

    this.loadTasks(true);
  }

  loadTasks(
    reset = false,
    event?: any,
  ): void {
    if (this.isLoading || this.isLoadingMore) {
      event?.target?.complete();
      return;
    }

    if (reset) {
      this.resetPagination();
    }

    if (!this.hasMore && !reset) {
      event?.target?.complete();

      if (event?.target) {
        event.target.disabled = true;
      }

      return;
    }

    this.isLoading = reset;
    this.isLoadingMore = !reset;
    this.errorMessage = '';

    const selectedDate =
      this.getSelectedDateForApi();

    this.apiService
      .getTasks(
        this.nextCursor || undefined,
        this.taskLimit,
        this.selectedStatus,
        selectedDate,
      )
      .subscribe({
        next: (response: any) => {
          const newTasks: Task[] =
            Array.isArray(response?.data)
              ? response.data
              : [];

          this.allTasks = reset
            ? newTasks
            : this.mergeTasks(
                this.allTasks,
                newTasks,
              );

          this.nextCursor =
            response?.pagination?.nextCursor ||
            null;

          this.hasMore =
            Boolean(
              response?.pagination?.hasMore,
            );

          this.applyFilters();

          this.finishLoading(event);

          if (
            !this.hasMore &&
            event?.target
          ) {
            event.target.disabled = true;
          }
        },

        error: (error) => {
          console.error(
            'Unable to load tasks:',
            error,
          );

          this.errorMessage =
            error?.error?.message ||
            'Unable to load tasks. Please try again.';

          this.finishLoading(event);
        },
      });
  }

  loadMoreTasks(event: any): void {
    this.loadTasks(false, event);
  }

  refreshTasks(): void {
    this.loadTasks(true);
  }

  goToAddTask(
    event?: Event,
  ): void {
    event?.preventDefault();
    event?.stopPropagation();

    this.router.navigateByUrl(
      '/tasks/add',
    );
  }

  openTask(
    task: Task,
    event?: Event,
  ): void {
    event?.preventDefault();
    event?.stopPropagation();

    const taskId =
      task._id || task.id;

    if (!taskId) {
      return;
    }

    this.router.navigateByUrl(
      `/tasks/${taskId}`,
    );
  }

  toggleStatusFilter(
    event: Event,
  ): void {
    event.preventDefault();
    event.stopPropagation();

    this.showStatusFilter =
      !this.showStatusFilter;
  }

  /*
   * Status filtering is performed by the backend.
   *
   * Every status change resets cursor pagination.
   */
  selectStatus(
    status: string,
  ): void {
    const normalizedStatus =
      status
        .trim()
        .toUpperCase() as TaskStatusFilter;

    const validStatuses:
      TaskStatusFilter[] = [
        'ALL',
        'PENDING',
        'COMPLETED',
        'MISSED',
      ];

    if (
      !validStatuses.includes(
        normalizedStatus,
      )
    ) {
      return;
    }

    this.selectedStatus =
      normalizedStatus;

    this.showStatusFilter = false;

    this.loadTasks(true);
  }

  /*
   * Call this when the Material date picker changes.
   */
  onDateFilterChange(): void {
    this.loadTasks(true);
  }

  /*
   * Text search remains local because the task API
   * does not currently have a search parameter.
   */
  applyFilters(): void {
    const search =
      this.searchText
        .trim()
        .toLowerCase();

    if (!search) {
      this.tasks = [
        ...this.allTasks,
      ];

      return;
    }

    this.tasks =
      this.allTasks.filter(
        (task) => {
          const title =
            task.title
              ?.toLowerCase() ||
            '';

          const description =
            task.description
              ?.toLowerCase() ||
            '';

          const category =
            task.category
              ?.toLowerCase() ||
            '';

          const priority =
            task.priority
              ?.toLowerCase() ||
            '';

          const status =
            task.status
              ?.toLowerCase() ||
            '';

          return (
            title.includes(search) ||
            description.includes(search) ||
            category.includes(search) ||
            priority.includes(search) ||
            status.includes(search)
          );
        },
      );
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  clearSearch(): void {
    this.searchText = '';
    this.applyFilters();
  }

  clearStatusFilter(): void {
    this.selectedStatus = 'ALL';
    this.showStatusFilter = false;

    this.loadTasks(true);
  }

  clearDateFilter(): void {
    this.dateRange = {
      start: null,
      end: null,
    };

    this.loadTasks(true);
  }

  clearAllFilters(): void {
    this.searchText = '';
    this.selectedStatus = 'ALL';
    this.showStatusFilter = false;

    this.dateRange = {
      start: null,
      end: null,
    };

    this.loadTasks(true);
  }

  get isDateFilterActive(): boolean {
    return Boolean(
      this.dateRange.start,
    );
  }

  /*
   * These counts represent currently loaded and
   * displayed tasks, not the full database summary.
   *
   * The dashboard summary should continue using
   * GET /tasks/summary.
   */
  get totalTasks(): number {
    return this.tasks.length;
  }

  get completedTasks(): number {
    return this.tasks.filter(
      (task) =>
        task.status === 'COMPLETED',
    ).length;
  }

  get pendingTasks(): number {
    return this.tasks.filter(
      (task) =>
        task.status === 'PENDING',
    ).length;
  }

  get missedTasks(): number {
    return this.tasks.filter(
      (task) =>
        task.status === 'MISSED',
    ).length;
  }

  getPriorityClass(
    priority?: string,
  ): string {
    return (
      `priority-` +
      `${priority?.toLowerCase() || 'medium'}`
    );
  }

  getStatusClass(
    status?: string,
  ): string {
    return (
      `status-` +
      `${status?.toLowerCase() || 'pending'}`
    );
  }

  formatLabel(
    value?: string,
  ): string {
    if (!value) {
      return '';
    }

    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(
        /\b\w/g,
        (character) =>
          character.toUpperCase(),
      );
  }

  trackByTaskId(
    index: number,
    task: Task,
  ): string {
    return (
      task._id ||
      task.id ||
      index.toString()
    );
  }

  private resetPagination(): void {
    this.allTasks = [];
    this.tasks = [];

    this.nextCursor = null;
    this.hasMore = true;
  }

  private finishLoading(
    event?: any,
  ): void {
    this.isLoading = false;
    this.isLoadingMore = false;

    event?.target?.complete();
  }

  private getSelectedDateForApi():
    string | undefined {
    const selectedDate =
      this.dateRange.start;

    if (!selectedDate) {
      return undefined;
    }

    return this.formatDateForApi(
      selectedDate,
    );
  }

  /*
   * Uses local date values instead of toISOString()
   * to prevent an India date from shifting to the
   * previous UTC date.
   */
  private formatDateForApi(
    date: Date,
  ): string {
    const value =
      new Date(date);

    const year =
      value.getFullYear();

    const month =
      String(
        value.getMonth() + 1,
      ).padStart(2, '0');

    const day =
      String(
        value.getDate(),
      ).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private mergeTasks(
    currentTasks: Task[],
    incomingTasks: Task[],
  ): Task[] {
    const taskMap =
      new Map<string, Task>();

    for (
      const task of [
        ...currentTasks,
        ...incomingTasks,
      ]
    ) {
      const taskId =
        task._id ||
        task.id;

      if (taskId) {
        taskMap.set(
          taskId,
          task,
        );
      }
    }

    return Array.from(
      taskMap.values(),
    );
  }
}