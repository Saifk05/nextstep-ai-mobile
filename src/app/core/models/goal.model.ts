export type GoalCategory =
  | 'CAREER'
  | 'FITNESS'
  | 'STUDY'
  | 'FINANCE'
  | 'BUSINESS'
  | 'PERSONAL';

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
  | 'TEMPLATE_SELECTED'
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

export type GoalQuestionType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'SELECT'
  | 'NUMBER'
  | 'DATE'
  | 'BOOLEAN';

export interface GoalSetupQuestion {
  key: string;
  label: string;
  type: GoalQuestionType;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface GoalTemplate {
  key: string;
  slug: string;
  category: GoalCategory;
  goalType: GoalType;
  title: string;
  description: string;
  version: number;
  setupQuestions: GoalSetupQuestion[];
}

export interface GoalMetrics {
  emailsSent: number;
  replies: number;
  interviews: number;
  offers: number;
  rejections: number;
  followUpsDue: number;
  applicationsSubmitted: number;
}

export interface GoalPlanItemMetadata {
  defaultDailyTarget?: number;
  defaultMinutes?: number;
  [key: string]: any;
}

export interface GoalPlanItem {
  _id?: string;
  id?: string;

  key?: string;
  title: string;
  description?: string;

  frequency?: 'ONCE' | 'DAILY' | 'WEEKLY' | string;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | string;
  successCriteria?: string;
  actionType?: string;

  metadata?: GoalPlanItemMetadata;

  completed: boolean;
  completedAt?: string;
}

export interface GoalPlan {
  id?: string;
  version?: number;
  strategySummary?: string;

  actions?: GoalPlanItem[];

  dailyActions: GoalPlanItem[];
  weeklyActions: GoalPlanItem[];
  milestones: GoalPlanItem[];
}

export interface GoalActivity {
  _id?: string;
  id?: string;
  userId?: string;
  goalId?: string;
  recruiterId?: string;

  type: ActivityType;
  message: string;

  metadata?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface Goal {
  _id?: string;
  id: string;

  title: string;
  description?: string;

  category?: GoalCategory;
  templateKey?: string;
  templateVersion?: number;
  planSource?: string;

  goalType: GoalType;
  status: GoalStatus;

  targetDate: string;

  progressPercentage: number;

  setupAnswers?: Record<string, any>;

  aiPlanSummary?: string;

  metrics?: GoalMetrics;

  plan?: GoalPlan | null;

  recentActivity?: GoalActivity[];
}

export interface CreateGoalRequest {
  title: string;
  category: GoalCategory;
  templateKey: string;
  targetDate: string;
  setupAnswers: Record<string, any>;
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

export type GoalTemplatesResponse = GoalTemplate[];

export type GoalTemplateResponse = GoalTemplate;