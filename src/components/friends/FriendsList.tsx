import { useState, useEffect } from 'react';
import { MessageSquare, Circle } from 'lucide-react';
import { Friend } from '../../types/friend';
import { friendsApi } from '../../lib/api/friends';

export function FriendsList() {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    try {
      const data = await friendsApi.getFriends();
      setFriends(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
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

  if (friends.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mx-auto h-12 w-12 text-gray-400">👥</div>
        <h3 className="mt-2 text-sm font-medium text-gray-900">No friends yet</h3>
        <p className="mt-1 text-sm text-gray-500">
          Start adding friends to connect with them!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {friends.map((friend) => (
        <div
          key={friend.friend_id}
          className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
        >
          <div className="flex items-center space-x-4">
            {friend.avatar_url ? (
              <img
                src={friend.avatar_url}
                alt={friend.username}
                className="h-10 w-10 rounded-full"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 font-medium">
                  {friend.username[0].toUpperCase()}
                </span>
              </div>
            )}
            <div>
              <div className="flex items-center">
                <h3 className="text-sm font-medium text-gray-900">
                  {friend.username}
                </h3>
                <Circle
                  className={`ml-2 h-2 w-2 ${
                    friend.is_online ? 'text-green-500' : 'text-gray-300'
                  }`}
                  fill="currentColor"
                />
              </div>
              <p className="text-sm text-gray-500">
                {friend.is_online ? (
                  'Online'
                ) : (
                  `Last seen ${new Date(friend.last_seen).toLocaleDateString()}`
                )}
              </p>
            </div>
          </div>
          <button
            onClick={() => {/* Handle chat */}}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            Message
          </button>
        </div>
      ))}
    </div>
  );
}
