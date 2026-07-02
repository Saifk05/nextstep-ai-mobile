export type GoalType =
  | 'JOB_SEARCH'
  | 'CAREER_GROWTH'
  | 'LEARNING'
  | 'FITNESS'
  | 'FINANCE'
  | 'BUSINESS'
  | 'PERSONAL'
  | 'CUSTOM';

export type GoalStatus =
  | 'ACTIVE'
  | 'PAUSED'
  | 'COMPLETED'
  | 'FAILED';

export type ActivityType =
  | 'GOAL_CREATED'
  | 'AI_PLAN_GENERATED'
  | 'GOAL_UPDATED'
  | 'GOAL_STATUS_UPDATED'
  | 'GOAL_PROGRESS_UPDATED'
  | 'PLAN_ITEM_COMPLETED'
  | 'PLAN_ITEM_UNCOMPLETED'
  | 'MILESTONE_COMPLETED'
  | 'MILESTONE_UNCOMPLETED'
  | 'RECRUITER_ADDED'
  | 'RECRUITER_UPDATED'
  | 'EMAIL_SENT_DETECTED'
  | 'REPLY_DETECTED'
  | 'INTERVIEW_DETECTED'
  | 'REJECTION_DETECTED'
  | 'OFFER_DETECTED'
  | 'FOLLOW_UP_TASK_CREATED';

export interface GoalMetrics {
  emailsSent: number;
  replies: number;
  interviews: number;
  offers: number;
  rejections: number;
  followUpsDue: number;
  applicationsSubmitted: number;
}

export interface GoalPlanItem {
  _id?: string;
  id?: string;
  title: string;
  completed: boolean;
  completedAt?: string;
}

export interface GoalPlan {
  id?: string;
  strategySummary?: string;
  dailyActions: GoalPlanItem[];
  weeklyActions: GoalPlanItem[];
  milestones: GoalPlanItem[];
}

export interface GoalActivity {
  id?: string;
  goalId?: string;
  recruiterId?: string;
  type: ActivityType;
  message: string;
  metadata?: Record<string, any>;
  createdAt?: string;
}

export interface Goal {
  id: string;
  title: string;
  description?: string;
  goalType: GoalType;
  status: GoalStatus;
  targetDate: string;
  progressPercentage: number;
  aiPlanSummary?: string;
  metrics: GoalMetrics;
  plan?: GoalPlan | null;
  recentActivity?: GoalActivity[];
}

export interface CreateGoalRequest {
  title: string;
  description?: string;
  goalType?: GoalType;
  targetDate: string;
  useAiPlan?: boolean;
  dailyActions?: string[];
  weeklyActions?: string[];
  milestones?: string[];
}

export interface UpdateGoalRequest {
  title?: string;
  description?: string;
  goalType?: GoalType;
  targetDate?: string;
}

export interface UpdateGoalStatusRequest {
  status: GoalStatus;
}


export type GoalResponse = Goal;
export type GoalsResponse = Goal[];