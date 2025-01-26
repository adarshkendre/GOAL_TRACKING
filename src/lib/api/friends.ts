import { supabase } from '../supabase';
import { Friend, FriendRequest, Profile, SearchUsersParams } from '../../types/friend';

export const friendsApi = {
  async searchUsers({ query, limit = 10, offset = 0 }: SearchUsersParams): Promise<Profile[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('Not authenticated');

    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .neq('id', currentUser.user.id)
      .or(`username.ilike.%${query}%,id.in.(ARRAY(select id from auth.users where email ilike '%${query}%'))`)
      .range(offset, offset + limit - 1);

    if (error) throw error;
    return profiles;
  },

  async sendFriendRequest(receiverId: string): Promise<FriendRequest> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('Not authenticated');

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from('friend_requests')
      .select('*')
      .or(`sender_id.eq.${currentUser.user.id},receiver_id.eq.${currentUser.user.id}`)
      .eq('status', 'pending')
      .single();

    if (existingRequest) {
      throw new Error('A friend request already exists between these users');
    }

    const { data: request, error } = await supabase
      .from('friend_requests')
      .insert([{
        sender_id: currentUser.user.id,
        receiver_id: receiverId,
        status: 'pending'
      }])
      .select()
      .single();

    if (error) throw error;
    return request;
  },

  async updateFriendRequest(requestId: string, status: 'accepted' | 'rejected'): Promise<FriendRequest> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('Not authenticated');

    const { data: request, error } = await supabase
      .from('friend_requests')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', requestId)
      .eq('receiver_id', currentUser.user.id) // Ensure only receiver can update
      .select()
      .single();

    if (error) throw error;
    return request;
  },

  async getFriends(): Promise<Friend[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('Not authenticated');

    const { data: friends, error } = await supabase
      .rpc('get_friends', { 
        user_id: currentUser.user.id 
      });

    if (error) throw error;
    return friends;
  },

  async getPendingRequests(): Promise<FriendRequest[]> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('Not authenticated');

    const { data: requests, error } = await supabase
      .from('friend_requests')
      .select('*, profiles!friend_requests_sender_id_fkey(*)')
      .eq('status', 'pending')
      .eq('receiver_id', currentUser.user.id);

    if (error) throw error;
    return requests;
  },

  async updateOnlineStatus(isOnline: boolean): Promise<void> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('Not authenticated');

    const { error } = await supabase
      .from('profiles')
      .update({
        is_online: isOnline,
        last_seen: new Date().toISOString(),
      })
      .eq('id', currentUser.user.id);

    if (error) throw error;
  }
};
