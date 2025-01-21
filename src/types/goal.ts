export type GoalPriority = 'low' | 'medium' | 'high';
export type GoalStatus = 'not_started' | 'in_progress' | 'completed';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string;
  priority: GoalPriority;
  status: GoalStatus;
  progress: number;
  created_at: string;
  updated_at: string;
}

export interface CreateGoalData {
  title: string;
  description?: string;
  due_date: string;
  priority: GoalPriority;
}

export interface UpdateGoalData {
  title?: string;
  description?: string;
  due_date?: string;
  priority?: GoalPriority;
  status?: GoalStatus;
  progress?: number;
}