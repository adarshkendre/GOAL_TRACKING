import { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Goal, GoalPriority, GoalStatus, UpdateGoalData } from '../../types/goal';
import { goalsApi } from '../../lib/api/goals';

interface EditGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  goal: Goal | null;
}

export function EditGoalModal({ isOpen, onClose, onSuccess, goal }: EditGoalModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<UpdateGoalData>({});

  useEffect(() => {
    if (goal) {
      setFormData({
        title: goal.title,
        description: goal.description || '',
        due_date: goal.due_date,
        priority: goal.priority,
        status: goal.status,
        progress: goal.progress
      });
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!goal) {
      setError('No goal selected');
      setIsLoading(false);
      return;
    }

    try {
      await goalsApi.updateGoal(goal.id, formData);
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen || !goal) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"></div>

        <div className="relative z-50 w-full max-w-md transform overflow-hidden rounded-lg bg-white shadow-xl transition-all">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          <div className="px-6 pt-5 pb-6">
            <h3 className="text-lg font-medium text-gray-900">Edit Goal</h3>

            {error && (
              <div className="mt-2 rounded-md bg-red-50 p-4">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  id="title"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  id="description"
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.description || ''}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="due_date" className="block text-sm font-medium text-gray-700">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  id="due_date"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.due_date || ''}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                />
              </div>

              <div>
                <label htmlFor="priority" className="block text-sm font-medium text-gray-700">
                  Priority
                </label>
                <select
                  id="priority"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.priority || 'medium'}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as GoalPriority })}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700">
                  Status
                </label>
                <select
                  id="status"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.status || 'not_started'}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as GoalStatus })}
                >
                  <option value="not_started">Not Started</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>

              <div>
                <label htmlFor="progress" className="block text-sm font-medium text-gray-700">
                  Progress
                </label>
                <input
                  type="number"
                  id="progress"
                  min="0"
                  max="100"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  value={formData.progress || 0}
                  onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                />
              </div>

              <div className="mt-5 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex items-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Goal'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
