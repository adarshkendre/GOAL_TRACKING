import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  LogOut, 
  Menu, 
  X, 
  PlusCircle, 
  MessageSquare, 
  BarChart3, 
  Target,
  Activity,
  Users,
  UserPlus,
  Bell
} from 'lucide-react';
import { AddGoalModal } from '../components/goals/AddGoalModal';
import { GoalsList } from '../components/goals/GoalsList';
import { FriendsList } from '../components/friends/FriendsList';
import { FriendRequests } from '../components/friends/FriendRequests';
import { SearchUsers } from '../components/friends/SearchUsers';

type Tab = 'goals' | 'friends' | 'requests' | 'search';

export function Dashboard() {
  const { user, signOut } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddGoalModalOpen, setIsAddGoalModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('goals');
  const [userStats] = useState({
    completedGoals: 12,
    activeGoals: 5,
    streakDays: 7
  });

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const handleGoalUpdate = useCallback(() => {
    // Refresh goals list and stats
    // This will be handled by the GoalsList component's internal state
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'goals':
        return (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-medium text-gray-900">Your Goals</h2>
              <BarChart3 className="h-5 w-5 text-gray-400" />
            </div>
            <GoalsList onGoalUpdate={handleGoalUpdate} />
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
              <div className="flex-shrink-0">
                <div className="flex items-center">
                  <div className="hidden md:block">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">{user?.email}</div>
                      <div className="text-xs text-gray-500">Premium Member</div>
                    </div>
                  </div>
                  <button
                    onClick={signOut}
                    className="ml-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </button>
                </div>
              </div>
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
                  onClick={() => setActiveTab('goals')}
                  className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md ${
                    activeTab === 'goals'
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <BarChart3 className="mr-3 h-5 w-5" />
                  Goals
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
      />
    </div>
  );
}