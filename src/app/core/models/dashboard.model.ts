export interface DashboardUser {
  id: string;
  firstName: string;
  lastName?: string;
  email: string;
  phoneNumber?: string;
  profilePicture: string | null;
  status?: string;
}

export interface Greeting {
  message: string;
  date: string;
  day: string;
}

export interface Summary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  activeGoals: number;
  monthlyExpense?: number;
  productivityScore: number;
}

export interface TodayFocus {
  title: string;
  description: string;
}

export interface Tasks {
  total: number;
  completed: number;
  pending: number;
  missed?: number;
  completionPercentage: number;
  todayTasks: any[];
  todayTasksCount?: number;
  emptyState?: EmptyState;
}

export interface GoalDashboardItem {
  id: string;
  title: string;
  goalType: string;
  status: string;
  targetDate: string;
  progressPercentage: number;
}

export interface Goals {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overallProgress: number;
  items: GoalDashboardItem[];
  emptyState?: EmptyState;
}

export interface EmptyState {
  title: string;
  description: string;
  cta: string;
}

export interface Productivity {
  todayScore: number;
  weeklyScore: number;
  currentStreak: number;
  bestStreak: number;
}

export interface QuickAction {
  type: string;
  title: string;
  description?: string;
}

export interface RecentActivity {
  id?: string;
  title: string;
  description: string;
  date: string;
  icon?: string;
}

export interface DashboardData {
  isNewUser?: boolean;
  user: DashboardUser;
  greeting: Greeting;
  summary: Summary;
  todayFocus: TodayFocus;
  tasks: Tasks;
  goals: Goals;
  productivity: Productivity;
  quickActions: QuickAction[];
  recentActivity: RecentActivity[];
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}