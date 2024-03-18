import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';
import type { User } from '@supabase/supabase-js';

export const user = writable<User | null>(null);

export async function getProfile() {
  try {
    const sessionUser = await supabase.auth.getUser();

    if (sessionUser.data.user) {
      user.set(sessionUser.data.user);
      localStorage.setItem('isAuthenticated', 'true');
    } else {
      user.set(null);
      localStorage.removeItem('isAuthenticated');
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    user.set(null);
    localStorage.removeItem('isAuthenticated');
  }
}

supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN' && session) {
    user.set(session.user);
    localStorage.setItem('isAuthenticated', 'true');
  } else if (event === 'SIGNED_OUT') {
    user.set(null);
    localStorage.removeItem('isAuthenticated');
  }
});