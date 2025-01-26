import { useState, useEffect, useCallback } from 'react';
import { Calendar, ChevronLeft, ChevronRight, PlusCircle, CheckCircle, Edit } from 'lucide-react';
import { Goal } from '../../types/goal';
import { AddGoalModal } from '../goals/AddGoalModal';
import { EditGoalModal } from '../goals/EditGoalModal';

interface ActivityCalendarProps {
  goals: Goal[];
  onDayClick: (date: Date) => void;
}

export function ActivityCalendar({ goals, onDayClick }: ActivityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [refreshCalendar, setRefreshCalendar] = useState(false);
  const [isEditGoalModalOpen, setIsEditGoalModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<Goal | null>(null);
  const [localGoals, setLocalGoals] = useState<Goal[]>([]);

  useEffect(() => {
    setLocalGoals(goals);
  }, [goals]);

  useEffect(() => {
    const days = generateCalendarDays(currentDate);
    setCalendarDays(days);
  }, [currentDate, refreshCalendar, localGoals]);

  const generateCalendarDays = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days: Date[] = [];

    // Add previous month's days
    for (let i = firstDay.getDay(); i > 0; i--) {
      days.push(new Date(year, month, -i + 1));
    }

    // Add current month's days
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    // Add next month's days to complete the grid
    const remainingDays = 42 - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      days.push(new Date(year, month + 1, i));
    }

    return days;
  };

  const getGoalsForDate = (date: Date) => {
    return localGoals.filter(goal => {
      const goalDate = new Date(goal.due_date);
      return goalDate.toDateString() === date.toDateString();
    });
  };

  const getDayStyle = (date: Date) => {
    const isToday = date.toDateString() === new Date().toDateString();
    const isCurrentMonth = date.getMonth() === currentDate.getMonth();
    const dayGoals = getGoalsForDate(date);
    const hasCompletedGoals = dayGoals.some(goal => goal.status === 'completed');
    const hasInProgressGoals = dayGoals.some(goal => goal.status === 'in_progress');
    const allGoalsCompleted = dayGoals.length > 0 && dayGoals.every(goal => goal.status === 'completed');

    let bgColor = isCurrentMonth ? 'bg-white' : 'bg-gray-50';
    if (allGoalsCompleted) bgColor = 'bg-gradient-to-br from-green-100 to-green-50';
    else if (hasCompletedGoals) bgColor = 'bg-gradient-to-br from-green-100 to-green-50';
    else if (hasInProgressGoals) bgColor = 'bg-yellow-100';

    return `
      ${bgColor}
      ${isToday ? 'ring-2 ring-blue-500' : ''}
      ${isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
      hover:bg-gray-100 cursor-pointer
      p-2 h-24 relative
    `;
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const handleAddGoal = (date: Date) => {
    setSelectedDate(date);
    setIsAddGoalModalOpen(true);
  };

  const handleEditGoal = (goal: Goal) => {
    setSelectedGoal(goal);
    setIsEditGoalModalOpen(true);
  };

  const handleGoalUpdate = useCallback(() => {
    setRefreshCalendar(prev => !prev);
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-medium text-gray-900 flex items-center">
          <Calendar className="h-5 w-5 mr-2" />
          Activity Calendar
        </h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={previousMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="text-lg font-medium">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
        
        {calendarDays.map((date, index) => {
          const dayGoals = getGoalsForDate(date);
          const allGoalsCompleted = dayGoals.length > 0 && dayGoals.every(goal => goal.status === 'completed');
          return (
            <div
              key={index}
              className={getDayStyle(date)}
              onClick={() => handleAddGoal(date)}
            >
              <span className="absolute top-1 left-1 text-sm">
                {date.getDate()}
              </span>
              {allGoalsCompleted && (
                <CheckCircle className="absolute top-1 right-1 h-4 w-4 text-green-600" />
              )}
              {dayGoals.length > 0 && (
                <div className="mt-6 space-y-1">
                  {dayGoals.map((goal, idx) => (
                    <div
                      key={idx}
                      className={`text-xs truncate px-1 py-0.5 rounded flex items-center justify-between ${
                        goal.status === 'completed'
                          ? 'bg-green-200 text-green-800'
                          : goal.status === 'in_progress'
                          ? 'bg-yellow-200 text-yellow-800'
                          : 'bg-gray-200 text-gray-800'
                      }`}
                    >
                      <span onClick={() => handleEditGoal(goal)} className="cursor-pointer hover:underline">{goal.title}</span>
                      {goal.status === 'completed' && (
                        <CheckCircle className="h-3 w-3 text-green-600" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex items-center space-x-4 text-sm">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-100 rounded mr-1"></div>
          <span>Completed</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-yellow-100 rounded mr-1"></div>
          <span>In Progress</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-white border rounded mr-1"></div>
          <span>No Goals</span>
        </div>
      </div>

      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        onSuccess={handleGoalUpdate}
        selectedDate={selectedDate}
      />
      <EditGoalModal
        isOpen={isEditGoalModalOpen}
        onClose={() => setIsEditGoalModalOpen(false)}
        onSuccess={handleGoalUpdate}
        goal={selectedGoal}
      />
    </div>
  );
}
