import { useState, useEffect } from 'react';
import { Check, X, Bell } from 'lucide-react';
import { FriendRequest } from '../../types/friend';
import { friendsApi } from '../../lib/api/friends';

export function FriendRequests() {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    try {
      const data = await friendsApi.getPendingRequests();
      setRequests(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequest = async (requestId: string, status: 'accepted' | 'rejected') => {
    try {
      await friendsApi.updateFriendRequest(requestId, status);
      setRequests(requests.filter(req => req.id !== requestId));
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-8">
        <Bell className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">No pending requests</h3>
        <p className="mt-1 text-sm text-gray-500">
          When someone sends you a friend request, it will appear here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((request) => (
        <div
          key={request.id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
        >
          <div className="flex items-center space-x-4">
            {request.profiles.avatar_url ? (
              <img
                src={request.profiles.avatar_url}
                alt={request.profiles.username}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-medium">
                  {request.profiles.username[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <h3 className="text-sm font-medium text-gray-900">
                {request.profiles.username}
              </h3>
              <p className="text-sm text-gray-500">
                Sent you a friend request
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => handleRequest(request.id, 'accepted')}
              className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Check className="h-4 w-4 mr-2" />
              Accept
            </button>
            <button
              onClick={() => handleRequest(request.id, 'rejected')}
              className="inline-flex items-center px-3 py-2 border border-gray-300 text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
