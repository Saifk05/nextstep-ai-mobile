import { Component, OnInit } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize } from 'rxjs';

import {
  IonContent,
  IonIcon,
  IonRefresher,
  IonRefresherContent,
  IonSpinner,
} from '@ionic/angular/standalone';

import { addIcons } from 'ionicons';
import {
  alertCircleOutline,
  calendarOutline,
  chatbubbleOutline,
  checkmarkCircleOutline,
  chevronBackOutline,
  closeCircleOutline,
  flagOutline,
  mailOutline,
  peopleOutline,
  sendOutline,
  sparklesOutline,
  syncOutline,
  timeOutline,
  trophyOutline,
} from 'ionicons/icons';

import { ApiService } from '../../../../core/services/api';

import {
  Goal,
  GoalActivity,
  GoalApplication,
  GoalGmailSyncResponse,
} from '../../../../core/models/goal.model';

import { AppFooterComponent } from '../../../../shared/components/app-footer/app-footer.component';

type GoalMetric = {
  label: string;
  value: number;
  icon: string;
};

type TodayMetric = {
  label: string;
  value: number;
  icon: string;
};

type GoalActionMetadata = {
  defaultDailyTarget?: number;
  defaultMinutes?: number;
  [key: string]: unknown;
};

type GoalActionDailyProgress = {
  current: number;
  target: number;
  display: string;
  targetMet: boolean;
  progressPercentage: number;
};

type GoalActionViewModel = {
  id?: string;
  _id?: string;
  key?: string;
  title: string;
  description?: string;
  frequency: string;
  priority?: string;
  successCriteria?: string;
  actionType?: string;
  completed?: boolean;
  metadata?: GoalActionMetadata;
  dailyProgress?: GoalActionDailyProgress;
};

type GoalPlanViewModel = {
  id?: string;
  _id?: string;
  actions: GoalActionViewModel[];
  dailyActions: GoalActionViewModel[];
  weeklyActions: GoalActionViewModel[];
};

type GoalMetricsViewModel = {
  emailsSent: number;
  bouncedEmails: number;
  replies: number;
  interviews: number;
  offers: number;
  rejections: number;
  followUpsDue: number;
  applicationsSubmitted: number;
};

type GoalTodayMetricsViewModel = {
  emailsSent: number;
  applicationsSubmitted: number;
};

type GoalDetailsViewModel = Omit<
  Goal,
  'metrics' | 'plan' | 'recentActivity' | 'applications'
> & {
  metrics: GoalMetricsViewModel;
  todayMetrics: GoalTodayMetricsViewModel;
  plan: GoalPlanViewModel | null;
  recentActivity: GoalActivity[];
  applications: GoalApplication[];
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
    IonSpinner,
    AppFooterComponent,
  ],
})
export class GoalDetailsPage implements OnInit {
  loading = false;
  syncingGmail = false;

  errorMessage = '';
  syncMessage = '';

  goalId = '';

  goal: GoalDetailsViewModel | null = null;

  activities: GoalActivity[] = [];
  applications: GoalApplication[] = [];

  lastSyncResult: GoalGmailSyncResponse | null = null;

  constructor(
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly apiService: ApiService
  ) {
    addIcons({
      alertCircleOutline,
      calendarOutline,
      chatbubbleOutline,
      checkmarkCircleOutline,
      chevronBackOutline,
      closeCircleOutline,
      flagOutline,
      mailOutline,
      peopleOutline,
      sendOutline,
      sparklesOutline,
      syncOutline,
      timeOutline,
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
    const metrics = this.goal?.metrics;

    if (!metrics) {
      return [];
    }

    return [
      {
        label: 'Applications',
        value: metrics.applicationsSubmitted,
        icon: 'send-outline',
      },
      {
        label: 'Emails Sent',
        value: metrics.emailsSent,
        icon: 'mail-outline',
      },
      {
        label: 'Bounced Emails',
        value: metrics.bouncedEmails,
        icon: 'alert-circle-outline',
      },
      {
        label: 'Replies',
        value: metrics.replies,
        icon: 'chatbubble-outline',
      },
      {
        label: 'Interviews',
        value: metrics.interviews,
        icon: 'people-outline',
      },
      {
        label: 'Follow-ups Due',
        value: metrics.followUpsDue,
        icon: 'time-outline',
      },
      {
        label: 'Rejections',
        value: metrics.rejections,
        icon: 'close-circle-outline',
      },
      {
        label: 'Offers',
        value: metrics.offers,
        icon: 'trophy-outline',
      },
    ];
  }

  get todayMetrics(): TodayMetric[] {
    const metrics = this.goal?.todayMetrics;

    if (!metrics) {
      return [];
    }

    return [
      {
        label: 'Emails Sent Today',
        value: metrics.emailsSent,
        icon: 'mail-outline',
      },
      {
        label: 'Applications Today',
        value: metrics.applicationsSubmitted,
        icon: 'send-outline',
      },
    ];
  }

  get oneTimeActions(): GoalActionViewModel[] {
    return (
      this.goal?.plan?.actions.filter(
        action => action.frequency === 'ONCE'
      ) ?? []
    );
  }

  get dailyActions(): GoalActionViewModel[] {
    return this.goal?.plan?.dailyActions ?? [];
  }

  get weeklyActions(): GoalActionViewModel[] {
    return this.goal?.plan?.weeklyActions ?? [];
  }

  loadGoalDetails(showLoader = true): void {
    if (!this.goalId) {
      return;
    }

    if (showLoader) {
      this.loading = true;
    }

    this.errorMessage = '';

    this.apiService
      .getGoalById(this.goalId)
      .pipe(
        finalize(() => {
          if (showLoader) {
            this.loading = false;
          }
        })
      )
      .subscribe({
        next: (response: unknown) => {
          const goal = this.extractResponseData<Goal>(response);
          this.setGoalState(goal);
        },

        error: () => {
          if (showLoader) {
            this.goal = null;
            this.activities = [];
            this.applications = [];
            this.errorMessage = 'Unable to load goal details.';
            return;
          }

          this.syncMessage =
            'Gmail sync completed, but the latest goal data could not be refreshed.';
        },
      });
  }

  handleRefresh(event: CustomEvent): void {
    this.apiService
      .getGoalById(this.goalId)
      .pipe(
        finalize(() => {
          const refresher = event.target as HTMLIonRefresherElement;
          refresher.complete();
        })
      )
      .subscribe({
        next: (response: unknown) => {
          const goal = this.extractResponseData<Goal>(response);

          this.setGoalState(goal);
          this.errorMessage = '';
        },

        error: () => {
          this.errorMessage = 'Unable to refresh goal.';
        },
      });
  }

  syncGmailIntelligence(): void {
    if (!this.goalId || this.syncingGmail) {
      return;
    }

    this.syncingGmail = true;
    this.syncMessage = '';
    this.lastSyncResult = null;

    this.apiService
      .syncGoalGmail(this.goalId)
      .pipe(finalize(() => (this.syncingGmail = false)))
      .subscribe({
        next: (response: unknown) => {
          const result =
            this.extractResponseData<GoalGmailSyncResponse>(response);

          this.lastSyncResult = result;
          this.syncMessage = 'Gmail intelligence sync completed successfully.';

          // Refresh without showing the full-page loading overlay.
          this.loadGoalDetails(false);
        },

        error: () => {
          this.syncMessage = 'Unable to sync Gmail intelligence.';
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

  formatStatus(status?: string): string {
    return this.toTitleCase(status || 'Active');
  }

  formatPriority(priority?: string): string {
    return this.toTitleCase(priority || 'Medium');
  }

  formatActivityType(type?: string): string {
    return this.toTitleCase(type || 'Goal Activity');
  }

  formatApplicationStatus(status?: string): string {
    return this.toTitleCase(status || 'Applied');
  }

  getApplicationStatusClass(status?: string): string {
    return `status-${(status || 'APPLIED').toLowerCase()}`;
  }

  getActivityIcon(type?: string): string {
    switch (type) {
      case 'COLD_EMAIL_DETECTED':
        return 'mail-outline';

      case 'APPLICATION_DETECTED':
        return 'send-outline';

      case 'RECRUITER_REPLY_DETECTED':
        return 'chatbubble-outline';

      case 'INTERVIEW_DETECTED':
        return 'people-outline';

      case 'OFFER_DETECTED':
        return 'trophy-outline';

      case 'REJECTION_DETECTED':
        return 'close-circle-outline';

      case 'FOLLOW_UP_CREATED':
      case 'NO_RESPONSE_DETECTED':
        return 'time-outline';

      case 'GOAL_TASK_COMPLETED':
        return 'checkmark-circle-outline';

      default:
        return 'sparkles-outline';
    }
  }

  isActionCompleted(action: GoalActionViewModel): boolean {
    return Boolean(action.completed || action.dailyProgress?.targetMet);
  }

  getActionProgress(action: GoalActionViewModel): number {
    return this.getProgress(action.dailyProgress?.progressPercentage);
  }

  getActionProgressText(action: GoalActionViewModel): string {
    if (action.dailyProgress?.display) {
      return action.dailyProgress.display;
    }

    const target = action.metadata?.defaultDailyTarget;

    if (typeof target === 'number') {
      return `0/${target}`;
    }

    return '';
  }

  getProgress(progress?: number): number {
    if (
      progress === null ||
      progress === undefined ||
      Number.isNaN(progress)
    ) {
      return 0;
    }

    return Math.min(100, Math.max(0, Math.round(progress)));
  }

  private setGoalState(goal: Goal): void {
    this.goal = this.normalizeGoal(goal);
    this.activities = this.goal.recentActivity;
    this.applications = this.goal.applications;
  }

  private normalizeGoal(goal: Goal): GoalDetailsViewModel {
    const rawGoal = goal as Goal & {
      metrics?: Partial<GoalMetricsViewModel>;
      todayMetrics?: Partial<GoalTodayMetricsViewModel>;
      plan?: GoalPlanViewModel | null;
      recentActivity?: GoalActivity[];
      applications?: GoalApplication[];
    };

    return {
      ...rawGoal,

      metrics: {
        emailsSent: rawGoal.metrics?.emailsSent ?? 0,
        bouncedEmails: rawGoal.metrics?.bouncedEmails ?? 0,
        replies: rawGoal.metrics?.replies ?? 0,
        interviews: rawGoal.metrics?.interviews ?? 0,
        offers: rawGoal.metrics?.offers ?? 0,
        rejections: rawGoal.metrics?.rejections ?? 0,
        followUpsDue: rawGoal.metrics?.followUpsDue ?? 0,
        applicationsSubmitted:
          rawGoal.metrics?.applicationsSubmitted ?? 0,
      },

      todayMetrics: {
        emailsSent: rawGoal.todayMetrics?.emailsSent ?? 0,
        applicationsSubmitted:
          rawGoal.todayMetrics?.applicationsSubmitted ?? 0,
      },

      plan: rawGoal.plan
        ? this.normalizePlan(rawGoal.plan)
        : null,

      applications: rawGoal.applications ?? [],
      recentActivity: rawGoal.recentActivity ?? [],
    };
  }

  private normalizePlan(plan: GoalPlanViewModel): GoalPlanViewModel {
    return {
      ...plan,

      actions: (plan.actions ?? []).map(action =>
        this.normalizeAction(action)
      ),

      dailyActions: (plan.dailyActions ?? []).map(action =>
        this.normalizeAction(action)
      ),

      weeklyActions: (plan.weeklyActions ?? []).map(action =>
        this.normalizeAction(action)
      ),
    };
  }

  private normalizeAction(
    action: GoalActionViewModel
  ): GoalActionViewModel {
    const current = action.dailyProgress?.current ?? 0;
    const target =
      action.dailyProgress?.target ??
      action.metadata?.defaultDailyTarget ??
      0;

    return {
      ...action,
      completed: action.completed ?? false,
      metadata: action.metadata ?? {},

      dailyProgress: action.dailyProgress
        ? {
            current,
            target,

            display:
              action.dailyProgress.display ||
              `${current}/${target}`,

            targetMet:
              action.dailyProgress.targetMet ??
              (target > 0 && current >= target),

            progressPercentage: this.getProgress(
              action.dailyProgress.progressPercentage
            ),
          }
        : undefined,
    };
  }

  private extractResponseData<T>(response: unknown): T {
    const wrappedResponse = response as {
      data?: T;
    };

    return wrappedResponse?.data ?? (response as T);
  }

  private toTitleCase(value: string): string {
    return value
      .replace(/_/g, ' ')
      .toLowerCase()
      .replace(/\b\w/g, char => char.toUpperCase());
  }
}