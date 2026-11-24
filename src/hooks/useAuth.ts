import { useCallback, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient.js';

export interface SignUpResult {
  error: string | null;
  needsEmailConfirmation: boolean;
}

export interface AuthActionResult {
  error: string | null;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Failed to restore session:', error.message);
        }
        if (mounted) {
          setSession(data?.session ?? null);
          setUser(data?.session?.user ?? null);
        }
      } catch (err) {
        console.error('Unexpected auth session error:', err);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    initSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (!mounted) return;
      setSession(nextSession);
      setUser(nextSession?.user ?? null);
      setLoading(false);
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthActionResult> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Unable to sign in. Please try again.',
      };
    }
  }, []);

  const signUp = useCallback(async (email: string, password: string): Promise<SignUpResult> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });
      if (error) {
        return { error: error.message, needsEmailConfirmation: false };
      }
      const needsEmailConfirmation = Boolean(data.user && !data.session);
      return { error: null, needsEmailConfirmation };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Unable to create account. Please try again.',
        needsEmailConfirmation: false,
      };
    }
  }, []);

  const signOut = useCallback(async (): Promise<AuthActionResult> => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return { error: error.message };
      }
      return { error: null };
    } catch (err) {
      return {
        error: err instanceof Error ? err.message : 'Failed to log out.',
      };
    }
  }, []);

  return {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
  };
}
