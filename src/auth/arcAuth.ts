import type { AuthChangeEvent, Session } from '@supabase/supabase-js';
import { requireSupabase } from '../lib/supabaseClient';

export async function getArcSession(): Promise<Session | null> {
  const { data, error } = await requireSupabase().auth.getSession();
  if (error) throw error;
  return data.session;
}

export async function getArcAccessToken(): Promise<string | null> {
  const session = await getArcSession();
  return session?.access_token ?? null;
}

export async function verifyArcUser() {
  const { data, error } = await requireSupabase().auth.getUser();
  if (error) return null;
  return data.user;
}

export function onArcAuthStateChange(callback: (event: AuthChangeEvent, session: Session | null) => void) {
  const { data } = requireSupabase().auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
}

export async function signInArcTeacher(email: string, password: string) {
  const { data, error } = await requireSupabase().auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.session;
}

export async function signOutArcTeacher() {
  const { error } = await requireSupabase().auth.signOut();
  if (error) throw error;
}
