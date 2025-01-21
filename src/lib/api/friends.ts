import { supabase } from '../supabase';
import { Friend, FriendRequest, Profile, SearchUsersParams } from '../../types/friend';

export const friendsApi = {
  async searchUsers({ query, limit = 10, offset = 0 }: SearchUsersParams): Promise<Profile[]> {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .ilike('username', `%${query}%`)
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return profiles;
  },

  async sendFriendRequest(receiverId: string): Promise<FriendRequest> {
    const { data: request, error } = await supabase
      .from('friend_requests')
      .insert([{ receiver_id: receiverId }])
      .select()
      .single();

    if (error) throw error;
    return request;
  },

  async updateFriendRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<FriendRequest> {
    const { data: request, error } = await supabase
      .from('friend_requests')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', requestId)
      .select()
      .single();

    if (error) throw error;
    return request;
  },

  async getFriends(): Promise<Friend[]> {
    const { data: friends, error } = await supabase
      .rpc('get_friends', { user_id: supabase.auth.user()?.id });

    if (error) throw error;
    return friends;
  },

  async getPendingRequests(): Promise<FriendRequest[]> {
    const { data: requests, error } = await supabase
      .from('friend_requests')
      .select('*, profiles!friend_requests_sender_id_fkey(*)')
      .eq('status', 'pending')
      .eq('receiver_id', supabase.auth.user()?.id);

    if (error) throw error;
    return requests;
  },

  async updateOnlineStatus(isOnline: boolean): Promise<void> {
    const { error } = await supabase
      .from('profiles')
      .update({
        is_online: isOnline,
        last_seen: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', supabase.auth.user()?.id);

    if (error) throw error;
  }
};