export interface DashboardUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  profilePicture: string | null;
  status: string;
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
  monthlyExpense: number;
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
  completionPercentage: number;
  todayTasks: any[];
}

export interface Goals {
  totalGoals: number;
  activeGoals: number;
  completedGoals: number;
  overallProgress: number;
  items: any[];
}

export interface Budget {
  monthlyIncome: number;
  monthlyExpense: number;
  monthlySavings: number;
  currency: string;
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
}

export interface DashboardData {
  user: DashboardUser;
  greeting: Greeting;
  summary: Summary;
  todayFocus: TodayFocus;
  tasks: Tasks;
  goals: Goals;
  budget: Budget;
  productivity: Productivity;
  quickActions: QuickAction[];
}

export interface DashboardResponse {
  success: boolean;
  message: string;
  data: DashboardData;
}