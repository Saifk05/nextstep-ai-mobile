import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  chevronBackOutline,
  flagOutline,
  refreshOutline,
  calendarOutline,
  mailOutline,
  chatbubbleOutline,
  peopleOutline,
  trophyOutline,
  checkmarkCircleOutline,
} from 'ionicons/icons';

import { ApiService } from '../../../../core/services/api';
import { Goal, GoalActivity } from '../../../../core/models/goal.model';
import { AppFooterComponent } from '../../../../shared/components/app-footer/app-footer.component';

type GoalMetric = {
  label: string;
  value: number;
  icon: string;
};

@Component({
  selector: 'app-goal-details',
  templateUrl: './goal-details.page.html',
  styleUrls: ['./goal-details.page.scss'],
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
export class GoalDetailsPage implements OnInit {
  loading = false;
  activityLoading = false;
  errorMessage = '';

  goalId = '';
  goal: Goal | null = null;
  activities: GoalActivity[] = [];

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiService: ApiService
  ) {
    addIcons({
      chevronBackOutline,
      flagOutline,
      refreshOutline,
      calendarOutline,
      mailOutline,
      chatbubbleOutline,
      peopleOutline,
      trophyOutline,
      checkmarkCircleOutline,
    });
  }

  ngOnInit(): void {
    this.goalId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.goalId) {
      this.errorMessage = 'Goal not found.';
      return;
    }

    this.loadGoalDetails();
    this.loadGoalActivity();
  }

  get goalMetrics(): GoalMetric[] {
    if (!this.goal?.metrics) return [];

    return [
      {
        label: 'Emails Sent',
        value: this.goal.metrics.emailsSent || 0,
        icon: 'mail-outline',
      },
      {
        label: 'Replies',
        value: this.goal.metrics.replies || 0,
        icon: 'chatbubble-outline',
      },
      {
        label: 'Interviews',
        value: this.goal.metrics.interviews || 0,
        icon: 'people-outline',
      },
      {
        label: 'Offers',
        value: this.goal.metrics.offers || 0,
        icon: 'trophy-outline',
      },
    ];
  }

  loadGoalDetails(): void {
    this.loading = true;
    this.errorMessage = '';

    this.apiService
      .getGoalById(this.goalId)
      .pipe(finalize(() => (this.loading = false)))
      .subscribe({
        next: (response: any) => {
          this.goal = response?.data || response;
        },
        error: () => {
          this.goal = null;
          this.errorMessage = 'Unable to load goal details.';
        },
      });
  }

  loadGoalActivity(): void {
    this.activityLoading = true;

    this.apiService
      .getGoalActivity(this.goalId)
      .pipe(finalize(() => (this.activityLoading = false)))
      .subscribe({
        next: (response: any) => {
          this.activities = response?.data || response || [];
        },
        error: () => {
          this.activities = [];
        },
      });
  }

  handleRefresh(event: CustomEvent): void {
    this.apiService
      .getGoalById(this.goalId)
      .pipe(
        finalize(() => {
          (event.target as HTMLIonRefresherElement).complete();
        })
      )
      .subscribe({
        next: (response: any) => {
          this.goal = response?.data || response;
          this.errorMessage = '';
          this.loadGoalActivity();
        },
        error: () => {
          this.errorMessage = 'Unable to refresh goal.';
        },
      });
  }

  goBack(): void {
    this.router.navigateByUrl('/goals');
  }

  formatGoalType(type: string): string {
    return type ? type.replace(/_/g, ' ') : 'Goal';
  }
}