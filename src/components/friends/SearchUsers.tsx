import { useState } from 'react';
import { Search, UserPlus, AlertCircle } from 'lucide-react';
import { Profile } from '../../types/friend';
import { friendsApi } from '../../lib/api/friends';

export function SearchUsers() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const results = await friendsApi.searchUsers({ query: query.trim() });
      setUsers(results);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await friendsApi.sendFriendRequest(userId);
      // Update UI to show request sent
      setUsers(users.map(user => 
        user.id === userId 
          ? { ...user, requestSent: true }
          : user
      ));
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Search users by username..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        <button
          onClick={handleSearch}
          disabled={!query.trim() || isLoading}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
        >
          Search
        </button>
      </div>

      {error && (
        <div className="rounded-lg bg-red-50 p-4 flex items-start">
          <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
          <p className="ml-3 text-sm text-red-700">{error}</p>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm"
            >
              <div className="flex items-center space-x-4">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-500 font-medium">
                      {user.username[0].toUpperCase()}
                    </span>
                  </div>
                )}
                <div>
                  <h3 className="text-sm font-medium text-gray-900">
                    {user.username}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {user.is_online ? (
                      <span className="text-green-600">Online</span>
                    ) : (
                      <span>
                        Last seen{' '}
                        {new Date(user.last_seen).toLocaleDateString()}
                      </span>
                    )}
                  </p>
                </div>
              </div>
              <button
                onClick={() => handleSendRequest(user.id)}
                disabled={user.requestSent}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {user.requestSent ? 'Request Sent' : 'Add Friend'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}