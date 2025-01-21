import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signUp: (email: string, password: string, username: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, username: string) => {
    const { data: { user }, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (signUpError) throw signUpError;
    if (!user) throw new Error('Failed to create user');

    // Create user profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          username,
          is_online: true,
          last_seen: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      // If profile creation fails, delete the auth user
      await supabase.auth.signOut();
      throw profileError;
    }
  };

  const signIn = async (email: string, password: string, rememberMe = false) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: {
        persistSession: rememberMe,
      },
    });
    if (error) throw error;

    // Update online status
    await supabase
      .from('profiles')
      .update({
        is_online: true,
        last_seen: new Date().toISOString(),
      })
      .eq('id', user?.id);
  };

  const signOut = async () => {
    // Update online status before signing out
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
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
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