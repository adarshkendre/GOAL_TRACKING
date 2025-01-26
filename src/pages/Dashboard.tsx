import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  Menu, 
  X, 
  PlusCircle, 
  BarChart3, 
  Target,
  Users,
  UserPlus,
  Bell,
  Home,
  MessageSquare,
  Flame,
  Sparkles
} from 'lucide-react';
import { AddGoalModal } from '../components/goals/AddGoalModal';
import { GoalsList } from '../components/goals/GoalsList';
import { FriendsList } from '../components/friends/FriendsList';
import { FriendRequests } from '../components/friends/FriendRequests';
import { SearchUsers } from '../components/friends/SearchUsers';
import { ProfileDropdown } from '../components/profile/ProfileDropdown';
import { ActivityCalendar } from '../components/calendar/ActivityCalendar';
import { Goal } from '../types/goal';
import { goalsApi } from '../lib/api/goals';
import { friendsApi } from '../lib/api/friends';
import { useNavigate } from 'react-router-dom';

type Tab = 'goals' | 'friends' | 'requests' | 'search' | 'help';

export function Dashboard() {
  const { user, loginStreak } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('goals');
  const [goals, setGoals] = useState<Goal[]>([]);
  const [userStats, setUserStats] = useState({
    completedGoals: 0,
    activeGoals: 0,
    streakDays: 0
  });
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const navigate = useNavigate();
  const [chatMessages, setChatMessages] = useState<string[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  const loadGoals = async () => {
    try {
      const data = await goalsApi.getGoals();
      setGoals(data);
      
      // Update stats
      const completed = data.filter(goal => goal.status === 'completed').length;
      const active = data.filter(goal => goal.status === 'in_progress').length;
      
      // Calculate streak
      const sortedCompletedGoals = data
        .filter(goal => goal.status === 'completed')
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      
      let streak = 0;
      if (sortedCompletedGoals.length > 0) {
        const today = new Date();
        let currentDate = today;
        let currentStreak = 0;
        
        for (const goal of sortedCompletedGoals) {
          const goalDate = new Date(goal.updated_at);
          if (goalDate.toDateString() === currentDate.toDateString()) {
            currentStreak++;
          } else if ((today.getTime() - goalDate.getTime()) / (1000 * 60 * 60 * 24) <= 1) {
            currentStreak++;
            currentDate = goalDate;
          } else {
            break;
          }
        }
        streak = currentStreak;
      }

      setUserStats({
        completedGoals: completed,
        activeGoals: active,
        streakDays: streak
      });
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const loadPendingRequests = async () => {
    try {
      const data = await friendsApi.getPendingRequests();
      setPendingRequestsCount(data.length);
    } catch (error) {
      console.error('Failed to load pending requests:', error);
    }
  };

  useEffect(() => {
    loadGoals();
    loadPendingRequests();
  }, []);

  const handleGoalUpdate = useCallback(() => {
    loadGoals();
  }, []);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleGoHome = () => {
    setActiveTab('goals');
    navigate('/dashboard');
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput;
    setChatMessages(prev => [...prev, `You: ${userMessage}`]);
    setChatInput('');

    // Basic bot logic
    let botResponse = 'I am a simple bot and cannot understand that.';
    if (userMessage.toLowerCase().includes('help')) {
      botResponse = 'I can help you with basic navigation and features. Try asking about goals or friends.';
    } else if (userMessage.toLowerCase().includes('goals')) {
      botResponse = 'You can add, view, and manage your goals in the "Goals" section.';
    } else if (userMessage.toLowerCase().includes('friends')) {
      botResponse = 'You can find and connect with friends in the "Friends" section.';
    }

    setChatMessages(prev => [...prev, `Bot: ${botResponse}`]);
  };

  const handleAiCompleteGoalClick = () => {
    setActiveTab('help');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'goals':
        return (
          <div className="space-y-6">
            <ActivityCalendar goals={goals} onDayClick={(date) => {
              setSelectedDate(date);
              setIsAddGoalModalOpen(true);
            }} />
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-medium text-gray-900">Your Goals</h2>
                <BarChart3 className="h-5 w-5 text-gray-400" />
              </div>
              <GoalsList onGoalUpdate={handleGoalUpdate} />
            </div>
          </div>
        );
      case 'friends':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Your Friends</h2>
              <Users className="h-5 w-5 text-gray-400" />
            </div>
            <FriendsList />
          </div>
        );
      case 'requests':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Friend Requests</h2>
              <Bell className="h-5 w-5 text-gray-400" />
            </div>
            <FriendRequests />
          </div>
        );
      case 'search':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Find Friends</h2>
              <UserPlus className="h-5 w-5 text-gray-400" />
            </div>
            <SearchUsers />
          </div>
        );
      case 'help':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6 flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Help Chat</h2>
              <MessageSquare className="h-5 w-5 text-gray-400" />
            </div>
            <div className="flex-1 overflow-y-auto mb-4">
              {chatMessages.map((message, index) => (
                <div key={index} className="mb-2">
                  {message}
                </div>
              ))}
            </div>
            <form onSubmit={handleChatSubmit} className="flex">
              <input
                type="text"
                placeholder="Type your message..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              />
              <button
                type="submit"
                className="ml-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                Send
              </button>
            </form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white shadow-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={toggleSidebar}
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 lg:hidden"
              >
                {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
              <div className="flex-shrink-0 flex items-center ml-4 lg:ml-0">
                <Target className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">GoalTracker</span>
              </div>
            </div>
            <div className="flex items-center">
              <button
                onClick={handleAiCompleteGoalClick}
                className="relative inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 mr-2"
              >
                <Sparkles className="h-5 w-5 text-blue-500" />
              </button>
              <div className="flex items-center mr-4">
                <Flame className="h-5 w-5 text-orange-500 mr-1" />
                <span className="text-sm font-medium text-gray-700">{loginStreak}</span>
              </div>
              <button
                onClick={() => setActiveTab('requests')}
                className="relative inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
              >
                <Bell className="h-6 w-6" />
                {pendingRequestsCount > 0 && (
                  <span className="absolute top-1 right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-red-100 bg-red-600 rounded-full">
                    {pendingRequestsCount}
                  </span>
                )}
              </button>
              <ProfileDropdown />
            </div>
          </div>
        </div>
      </nav>

      {/* Sidebar & Main Content */}
      <div className="pt-16 flex h-screen">
        {/* Sidebar */}
        <aside
          className={`fixed lg:static inset-y-0 left-0 transform ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } lg:translate-x-0 transition duration-200 ease-in-out z-30 w-64 bg-white border-r border-gray-200 pt-5 pb-4 flex flex-col`}
        >
          <div className="flex-1 h-0 overflow-y-auto">
            <div className="px-4 space-y-4">
              {/* Action Buttons */}
              <button
                onClick={() => setIsAddGoalModalOpen(true)}
                className="w-full flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                <PlusCircle className="mr-3 h-5 w-5" />
                Add New Goal
              </button>

              {/* Navigation Tabs */}
              <nav className="space-y-1">
                <button
                  onClick={handleGoHome}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'goals'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Home className="mr-3 h-5 w-5" />
                  Home
                </button>
                <button
                  onClick={() => setActiveTab('friends')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'friends'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Users className="mr-3 h-5 w-5" />
                  Friends
                </button>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'requests'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <Bell className="mr-3 h-5 w-5" />
                  Friend Requests
                </button>
                <button
                  onClick={() => setActiveTab('search')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'search'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <UserPlus className="mr-3 h-5 w-5" />
                  Find Friends
                </button>
                 <button
                  onClick={() => setActiveTab('help')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'help'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare className="mr-3 h-5 w-5" />
                  Help
                </button>
              </nav>

              {/* User Statistics */}
              <div className="mt-8">
                <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Your Statistics
                </h3>
                <div className="mt-4 space-y-4">
                  <div className="px-3 py-2 bg-gray-50 rounded-md">
                    <div className="text-sm font-medium text-gray-900">Completed Goals</div>
                    <div className="text-2xl font-bold text-blue-600">{userStats.completedGoals}</div>
                  </div>
                  <div className="px-3 py-2 bg-gray-50 rounded-md">
                    <div className="text-sm font-medium text-gray-900">Active Goals</div>
                    <div className="text-2xl font-bold text-green-600">{userStats.activeGoals}</div>
                  </div>
                  <div className="px-3 py-2 bg-gray-50 rounded-md">
                    <div className="text-sm font-medium text-gray-900">Day Streak</div>
                    <div className="text-2xl font-bold text-orange-600">{userStats.streakDays}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Greeting Section */}
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <h1 className="text-2xl font-semibold text-gray-900">
                  Welcome back, {user?.email?.split('@')[0]}!
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Track your goals and connect with friends.
                </p>
              </div>

              {/* Tab Content */}
              {renderTabContent()}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden"
          onClick={toggleSidebar}
        ></div>
      )}

      {/* Add Goal Modal */}
      <AddGoalModal
        isOpen={isAddGoalModalOpen}
        onClose={() => setIsAddGoalModalOpen(false)}
        onSuccess={handleGoalUpdate}
        selectedDate={selectedDate}
      />
    </div>
  );
}
