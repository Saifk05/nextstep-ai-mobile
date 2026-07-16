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
  | 'TEMPLATE_SELECTED'
  | 'AI_PLAN_GENERATED'
  | 'AI_PLAN_REGENERATED'
  | 'GOAL_UPDATED'
  | 'GOAL_STATUS_UPDATED'
  | 'GOAL_PROGRESS_UPDATED'
  | 'GOAL_TASKS_CREATED'
  | 'GOAL_TASK_COMPLETED'
  | 'PLAN_ITEM_COMPLETED'
  | 'PLAN_ITEM_UNCOMPLETED'
  | 'MILESTONE_COMPLETED'
  | 'MILESTONE_UNCOMPLETED'
  | 'RECRUITER_ADDED'
  | 'RECRUITER_UPDATED'
  | 'APPLICATION_DETECTED'
  | 'EMAIL_SENT_DETECTED'
  | 'COLD_EMAIL_DETECTED'
  | 'EMAIL_BOUNCED'
  | 'REPLY_DETECTED'
  | 'INTERVIEW_DETECTED'
  | 'REJECTION_DETECTED'
  | 'OFFER_DETECTED'
  | 'FOLLOW_UP_TASK_CREATED'
  | 'NO_RESPONSE_DETECTED';

export type GoalQuestionType =
  | 'TEXT'
  | 'TEXTAREA'
  | 'SELECT'
  | 'NUMBER'
  | 'DATE'
  | 'BOOLEAN'
  | 'text'
  | 'textarea'
  | 'select'
  | 'number'
  | 'date'
  | 'boolean';

export type GoalApplicationStatus =
  | 'OUTREACH_SENT'
  | 'APPLIED'
  | 'REPLIED'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'NO_RESPONSE'
  | 'BOUNCED';

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
  isActive?: boolean;

  setupQuestions: GoalSetupQuestion[];
  defaultMetrics?: GoalMetrics;
}

export interface GoalMetrics {
  // Job-search metrics
  emailsSent?: number;
  replies?: number;
  interviews?: number;
  offers?: number;
  rejections?: number;
  followUpsDue?: number;
  applicationsSubmitted?: number;

  // Study metrics
  studyMinutes?: number;
  practiceMinutes?: number;
  conceptsCompleted?: number;
  codingSessionsCompleted?: number;
  projectFeaturesCompleted?: number;
  daysCompletedWithoutAI?: number;

  // Fitness metrics
  currentWeight?: number;
  weightLost?: number;
  workoutsCompleted?: number;
  stepsCompleted?: number;
  nutritionDaysTracked?: number;
  waterGoalsCompleted?: number;

  // Finance metrics
  amountSaved?: number;
  targetAmount?: number;
  expensesTracked?: number;
  noSpendDays?: number;
  monthlyReviewsCompleted?: number;

  // Business metrics
  customerInterviewsCompleted?: number;
  leadsContacted?: number;
  productFeaturesCompleted?: number;
  marketingExperimentsCompleted?: number;
  customersAcquired?: number;
  revenueGenerated?: number;

  // Personal-development metrics
  habitDaysCompleted?: number;
  focusSessionsCompleted?: number;
  reflectionEntriesCompleted?: number;
  learningSessionsCompleted?: number;
  currentStreak?: number;

  // Shared metrics
  weeklyReviewsCompleted?: number;

  [key: string]: number | undefined;
}

export interface GoalApplication {
  _id?: string;
  id?: string;
  userId?: string;
  goalId?: string;

  company: string;
  position: string;
  status: GoalApplicationStatus;

  appliedAt?: string;
  lastActivityAt?: string;

  sourceEmailId?: string;
  sourceThreadId?: string;
  metadata?: Record<string, any>;

  createdAt?: string;
  updatedAt?: string;
}

export interface GoalGmailSyncResponse {
  scannedEmails?: number;
  relevantEmails?: number;

  detectedApplications: number;
  detectedReplies: number;
  detectedInterviews: number;
  detectedOffers: number;
  detectedRejections: number;

  detectedColdEmails?: number;
  detectedBounces?: number;
  detectedNoResponses?: number;
}

export interface GoalPlanItemMetadata {
  defaultDailyTarget?: number;
  defaultWeeklyTarget?: number;
  defaultMinutes?: number;
  setupAnswerKey?: string;
  unit?: string;

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

  completed?: boolean;
  completedAt?: string;
}

export interface GoalPlan {
  id?: string;
  version?: number;
  strategySummary?: string;

  actions?: GoalPlanItem[];

  dailyActions?: GoalPlanItem[];
  weeklyActions?: GoalPlanItem[];
  milestones?: GoalPlanItem[];
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

  applications?: GoalApplication[];

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