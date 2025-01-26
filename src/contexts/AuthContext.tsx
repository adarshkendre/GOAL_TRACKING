import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  loginStreak: number;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [loginStreak, setLoginStreak] = useState(0);

  const updateLoginStreak = async (userId: string) => {
    const { data: profile } = await supabase
      .from('profiles')
      .select('last_seen')
      .eq('id', userId)
      .single();

    if (profile) {
      const lastSeen = new Date(profile.last_seen);
      const today = new Date();
      const diffDays = Math.floor((today.getTime() - lastSeen.getTime()) / (1000 * 60 * 60 * 24));

      const { data: streakData } = await supabase
        .from('profiles')
        .select('login_streak')
        .eq('id', userId)
        .single();

      let newStreak = streakData?.login_streak || 0;

      if (diffDays === 1) {
        // Consecutive day login
        newStreak += 1;
      } else if (diffDays > 1) {
        // Streak broken
        newStreak = 1;
      }
      // If same day, streak remains unchanged

      await supabase
        .from('profiles')
        .update({
          login_streak: newStreak,
          is_online: true,
          last_seen: new Date().toISOString(),
        })
        .eq('id', userId);

      setLoginStreak(newStreak);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        updateLoginStreak(session.user.id);
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        updateLoginStreak(session.user.id);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string, rememberMe = true) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        persistSession: rememberMe
      }
    });

    if (error) throw error;
    if (!data.user) throw new Error('No user returned from sign in');

    await updateLoginStreak(data.user.id);
  };

  const signUp = async (email: string, password: string, username: string) => {
    const { data: { user: newUser }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { username }
      }
    });

    if (signUpError) throw signUpError;
    if (!newUser) throw new Error('Failed to create user');

    const { error: profileError } = await supabase
      .from('profiles')
      .insert([{
        id: newUser.id,
        username,
        is_online: true,
        last_seen: new Date().toISOString(),
        login_streak: 1
      }]);

    if (profileError) {
      await supabase.auth.signOut();
      throw profileError;
    }

    setLoginStreak(1);
  };

  const signOut = async () => {
    if (user) {
      await supabase
        .from('profiles')
        .update({
          is_online: false,
          last_seen: new Date().toISOString(),
        })
        .eq('id', user.id);
    }

    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  return (
    <AuthContext.Provider value={{ user, loading, loginStreak, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
