import { supabase } from '../supabase';
import { CalendarNote, CreateNoteData } from '../../types/calendar';

export const calendarApi = {
  async createNote(data: CreateNoteData): Promise<CalendarNote> {
    const { data: currentUser } = await supabase.auth.getUser();
    if (!currentUser.user) throw new Error('Not authenticated');

    const { data: note, error } = await supabase
      .from('calendar_notes')
      .insert([{ ...data, user_id: currentUser.user.id }])
      .select()
      .single();

    if (error) throw error;
    return note;
  },

  async getNotes(date: string): Promise<CalendarNote[]> {
    const { data: notes, error } = await supabase
      .from('calendar_notes')
      .select('*')
      .eq('date', date)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return notes;
  },

  async updateNote(id: string, content: string): Promise<CalendarNote> {
    const { data: note, error } = await supabase
      .from('calendar_notes')
      .update({ content, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return note;
  },

  async deleteNote(id: string): Promise<void> {
    const { error } = await supabase
      .from('calendar_notes')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
