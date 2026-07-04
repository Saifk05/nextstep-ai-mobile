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
  calendarOutline,
  chatbubbleOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  flagOutline,
  mailOutline,
  peopleOutline,
  refreshOutline,
  trophyOutline,
} from 'ionicons/icons';

import { ApiService } from '../../../../core/services/api';
import { Goal, GoalActivity, GoalPlan } from '../../../../core/models/goal.model';
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
      calendarOutline,
      chatbubbleOutline,
      checkmarkCircleOutline,
      chevronBackOutline,
      flagOutline,
      mailOutline,
      peopleOutline,
      refreshOutline,
      trophyOutline,
    });
  }

  ngOnInit(): void {
    this.goalId = this.route.snapshot.paramMap.get('id') || '';

    if (!this.goalId) {
      this.errorMessage = 'Goal not found.';
      return;
    }

    this.loadGoalDetails();
  }

  get goalMetrics(): GoalMetric[] {
    if (!this.goal?.metrics) {
      return [];
    }

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
          const goal = response?.data || response;
          this.goal = this.normalizeGoal(goal);
          this.activities = this.goal?.recentActivity || [];
        },
        error: () => {
          this.goal = null;
          this.activities = [];
          this.errorMessage = 'Unable to load goal details.';
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
          const goal = response?.data || response;
          this.goal = this.normalizeGoal(goal);
          this.activities = this.goal?.recentActivity || [];
          this.errorMessage = '';
        },
        error: () => {
          this.errorMessage = 'Unable to refresh goal.';
        },
      });
  }

  goBack(): void {
    this.router.navigateByUrl('/goals');
  }

  formatGoalType(type?: string): string {
    return this.toTitleCase(type || 'Goal');
  }

  formatCategory(category?: string): string {
    return this.toTitleCase(category || 'Goal');
  }

  formatActivityType(type?: string): string {
    return this.toTitleCase(type || 'Goal Activity');
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

  private normalizeGoal(goal: Goal): Goal {
    return {
      ...goal,
      metrics: goal.metrics || {
        emailsSent: 0,
        replies: 0,
        interviews: 0,
        offers: 0,
        rejections: 0,
        followUpsDue: 0,
        applicationsSubmitted: 0,
      },
      plan: goal.plan ? this.normalizePlan(goal.plan) : null,
      recentActivity: goal.recentActivity || [],
    };
  }

  private normalizePlan(plan: GoalPlan): GoalPlan {
    return {
      ...plan,
      dailyActions: plan.dailyActions || [],
      weeklyActions: plan.weeklyActions || [],
      milestones: plan.milestones || [],
    };
  }

  private toTitleCase(value: string): string {
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}