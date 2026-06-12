export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type TaskStatus = 'PENDING' | 'COMPLETED' | 'OVERDUE';
export type CompletionType = 'SELF_CONFIRM' | 'PHOTO_PROOF';

export interface Task {
  id: string;
  _id?: string;

  title: string;
  description?: string;

  category: string;
  priority: TaskPriority;
  status: TaskStatus;

  dueDate?: string;
  completedAt?: string;

  completionType: CompletionType;
  minimumCompletionMinutes?: number;

  proofImage?: string;
  proofImageUrl?: string;

  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
  dueDate?: string;
  priority: TaskPriority;
  category: string;
  completionType: CompletionType;
  minimumCompletionMinutes?: number;
}

export interface UpdateTaskRequest extends Partial<CreateTaskRequest> {
  status?: TaskStatus;
  completionNote?: string;
  completedAt?: string;
  proofImage?: string;
}

export interface TaskSummary {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}