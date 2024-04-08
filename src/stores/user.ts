import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export const user = writable<User | null>(null);
export const session = writable<Session | null>(null);

export async function getAuthState() {
    try {
      const { data, error } = await supabase.auth.getSession();
  
      if (error) {
        console.error('Error fetching session:', error);
        user.set(null);
        session.set(null);
        return null;
      } else if (data.session) {
        user.set(data.session.user);
        session.set(data.session);
        return data.session;
      } else {
        user.set(null);
        session.set(null);
        return null;
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      user.set(null);
      session.set(null);
      return null;
    }
  }

supabase.auth.onAuthStateChange((event, currentSession) => {
  if (event === 'SIGNED_IN' && currentSession) {
    user.set(currentSession.user);
    session.set(currentSession);
  } else if (event === 'SIGNED_OUT') {
    user.set(null);
    session.set(null);
  }
});

// Initialize the authentication state during application startup
getAuthState();