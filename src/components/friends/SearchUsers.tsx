import { useState, useEffect } from 'react';
import { Search, UserPlus, AlertCircle, Users } from 'lucide-react';
import { Profile } from '../../types/friend';
import { friendsApi } from '../../lib/api/friends';

export function SearchUsers() {
  const [query, setQuery] = useState('');
  const [users, setUsers] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestStates, setRequestStates] = useState<Record<string, boolean>>({});
  const [noResults, setNoResults] = useState(false);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      setNoResults(false);
      return;
    }

    const timeoutId = setTimeout(() => {
      handleSearch();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [query]);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setIsLoading(true);
    setError(null);
    setNoResults(false);

    try {
      const results = await friendsApi.searchUsers({ query: query.trim() });
      setUsers(results);
      if (results.length === 0) {
        setNoResults(true);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await friendsApi.sendFriendRequest(userId);
      setRequestStates(prev => ({ ...prev, [userId]: true }));
    } catch (err: any) {
      if (err.message.includes('already exists')) {
        setRequestStates(prev => ({ ...prev, [userId]: true }));
      } else {
        setError(err.message);
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <div className="relative">
          <input
            type="text"
            placeholder="Search users by username or email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>

        {!query.trim() && !users.length && (
          <div className="mt-8 text-center">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">Find your friends</h3>
            <p className="mt-1 text-sm text-gray-500">
              Search by username or email to find and connect with your friends
            </p>
          </div>
        )}
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
          {noResults && query.trim() && (
            <div className="text-center py-8">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Try a different search term.
              </p>
            </div>
          )}
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between p-4 bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center space-x-4">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username}
                    className="h-10 w-10 rounded-full"
                  />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-600 font-medium">
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
                      <span className="text-green-600 flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-1"></span>
                        Online
                      </span>
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
                disabled={requestStates[user.id]}
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                {requestStates[user.id] ? 'Request Sent' : 'Add Friend'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
