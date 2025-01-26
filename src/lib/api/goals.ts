import { supabase } from '../supabase';
import { CreateGoalData, Goal, UpdateGoalData } from '../../types/goal';

export const goalsApi = {
  async createGoal(data: CreateGoalData): Promise<Goal> {
    const { data: goal, error } = await supabase
      .from('goals')
      .insert([data])
      .select()
      .single();

    if (error) throw error;
    return goal;
  },

  async getGoals(): Promise<Goal[]> {
    const { data: goals, error } = await supabase
      .from('goals')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) throw error;
    return goals;
  },

  async updateGoal(id: string, data: UpdateGoalData): Promise<Goal> {
    const { data: goal, error } = await supabase
      .from('goals')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return goal;
  },

  async deleteGoal(id: string): Promise<void> {
    const { error } = await supabase
      .from('goals')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }
};
