import { useState, useEffect } from 'react';
import { BarChart3, Calendar, Flag, Trash2 } from 'lucide-react';
import { Goal, GoalPriority, GoalStatus } from '../../types/goal';
import { goalsApi } from '../../lib/api/goals';

interface GoalsListProps {
  onGoalUpdate: () => void;
}

export function GoalsList({ onGoalUpdate }: GoalsListProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'due_date' | 'priority'>('due_date');
  const [filterStatus, setFilterStatus] = useState<GoalStatus | 'all'>('all');

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const data = await goalsApi.getGoals();
      setGoals(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusChange = async (goalId: string, status: GoalStatus) => {
    try {
      await goalsApi.updateGoal(goalId, { status });
      onGoalUpdate();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleDelete = async (goalId: string) => {
    if (!confirm('Are you sure you want to delete this goal?')) return;
    
    try {
      await goalsApi.deleteGoal(goalId);
      onGoalUpdate();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filteredGoals = goals
    .filter(goal => filterStatus === 'all' || goal.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'due_date') {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });

  const getPriorityColor = (priority: GoalPriority) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'low': return 'text-green-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="flex flex-wrap gap-4 items-center justify-between">
        <div className="flex gap-4">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'due_date' | 'priority')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="due_date">Sort by Due Date</option>
            <option value="priority">Sort by Priority</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as GoalStatus | 'all')}
            className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">All Status</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </div>

        <p className="text-sm text-gray-500">
          Showing {filteredGoals.length} goals
        </p>
      </div>

      <div className="space-y-4">
        {filteredGoals.map((goal) => (
          <div
            key={goal.id}
            className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h3 className="text-lg font-medium text-gray-900">{goal.title}</h3>
                {goal.description && (
                  <p className="text-sm text-gray-500">{goal.description}</p>
                )}
              </div>
              <button
                onClick={() => handleDelete(goal.id)}
                className="text-gray-400 hover:text-red-600"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-4 items-center text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1 text-gray-400" />
                <span className="text-gray-600">
                  {new Date(goal.due_date).toLocaleDateString()}
                </span>
              </div>

              <div className="flex items-center">
                <Flag className={`h-4 w-4 mr-1 ${getPriorityColor(goal.priority)}`} />
                <span className="capitalize">{goal.priority}</span>
              </div>

              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-1 text-gray-400" />
                <select
                  value={goal.status}
                  onChange={(e) => handleStatusChange(goal.id, e.target.value as GoalStatus)}
                  className="text-sm border-none bg-transparent focus:ring-0 cursor-pointer"
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
            </div>

            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${goal.progress}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}