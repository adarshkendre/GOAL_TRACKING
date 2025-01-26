import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, LogOut, Lock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export function SettingsPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const handleGoBack = () => {
    navigate('/dashboard');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to sign out:', error);
    }
  };

  const handleChangePassword = () => {
    navigate('/change-password');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Settings className="h-6 w-6 mr-2" />
            Settings
          </h2>
          <button
            onClick={handleGoBack}
            className="text-gray-500 hover:text-gray-700 focus:outline-none"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4">
          <button
            onClick={handleChangePassword}
            className="w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md text-gray-700 hover:bg-gray-100"
          >
            <Lock className="h-4 w-4 mr-2" />
            Change Password
          </button>
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-start px-4 py-2 text-sm font-medium rounded-md text-red-600 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
