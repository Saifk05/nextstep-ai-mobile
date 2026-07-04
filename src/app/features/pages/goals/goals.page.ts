import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  addOutline,
  flagOutline,
  chevronForwardOutline,
  refreshOutline,
  chevronBackOutline,
} from 'ionicons/icons';

import { ApiService } from '../../../core/services/api';
import { Goal } from '../../../core/models/goal.model';
import { AppFooterComponent } from '../../../shared/components/app-footer/app-footer.component';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.page.html',
  styleUrls: ['./goals.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    IonContent,
    IonIcon,
    IonRefresher,
    IonRefresherContent,
    AppFooterComponent,
  ],
})
export class GoalsPage implements OnInit {
  loading = false;
  goals: Goal[] = [];
  errorMessage = '';

  constructor(
    private readonly apiService: ApiService,
    private readonly router: Router
  ) {
    addIcons({
      addOutline,
      flagOutline,
      chevronForwardOutline,
      refreshOutline,
      chevronBackOutline,
    });
  }

  ngOnInit(): void {}

  ionViewWillEnter(): void {
    this.loadGoals();
  }

  loadGoals(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService
      .getActiveGoals()
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: Goal[]) => {
          this.goals = response || [];
        },
        error: () => {
          this.goals = [];
          this.errorMessage = 'Unable to load goals. Please try again.';
        },
      });
  }

  handleRefresh(event: CustomEvent): void {
    this.apiService
      .getActiveGoals()
      .pipe(
        finalize(() => {
          (event.target as HTMLIonRefresherElement).complete();
        })
      )
      .subscribe({
        next: (response: Goal[]) => {
          this.goals = response || [];
          this.errorMessage = '';
        },
        error: () => {
          this.errorMessage = 'Unable to refresh goals.';
        },
      });
  }

  goToCreateGoal(): void {
    this.router.navigateByUrl('/goals/add');
  }

  goToGoalDetails(goalId: string): void {
    this.router.navigateByUrl(`/goals/${goalId}`);
  }

  goBack(): void {
    this.router.navigateByUrl('/dashboard');
  }

  formatGoalType(type?: string): string {
    if (!type) {
      return 'Goal';
    }

    return this.toTitleCase(type);
  }

  formatCategory(category?: string): string {
    if (!category) {
      return 'Goal';
    }

    return this.toTitleCase(category);
  }

  getProgress(progress?: number): number {
    if (progress === null || progress === undefined || Number.isNaN(progress)) {
      return 0;
    }

    if (progress < 0) {
      return 0;
    }

    if (progress > 100) {
      return 100;
    }

    return Math.round(progress);
  }

  private toTitleCase(value: string): string {
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}