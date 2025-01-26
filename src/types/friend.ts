export type FriendRequestStatus = 'pending' | 'accepted' | 'rejected';

export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string;
  created_at: string;
  updated_at: string;
}

export interface FriendRequest {
  id: string;
  sender_id: string;
  receiver_id: string;
  status: FriendRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface Friend {
  friend_id: string;
  username: string;
  avatar_url: string | null;
  is_online: boolean;
  last_seen: string;
}

export interface SearchUsersParams {
  query: string;
  limit?: number;
  offset?: number;
}
