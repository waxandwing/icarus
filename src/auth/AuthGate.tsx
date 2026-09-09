import { type FormEvent, type ReactNode, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  getArcSession,
  onArcAuthStateChange,
  signInArcTeacher,
  signOutArcTeacher,
} from './arcAuth';

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let mounted = true;
    void getArcSession()
      .then((next) => {
        if (mounted) setSession(next);
      })
      .catch((err) => {
        if (mounted) setError(err instanceof Error ? err.message : 'Arc sign-in is unavailable.');
      })
      .finally(() => {
        if (mounted) setReady(true);
      });
    const unsubscribe = onArcAuthStateChange((_event, next) => {
      if (mounted) setSession(next);
    });
    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError('');
    try {
      const next = await signInArcTeacher(email.trim(), password);
      setSession(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in.');
    } finally {
      setBusy(false);
    }
  }

  if (!ready) return <main aria-busy="true">Opening Arc…</main>;
  if (session) return <>{children}</>;

  return (
    <main>
      <form onSubmit={submit} aria-label="Sign in to Arc">
        <h1>Arc</h1>
        <p>Sign in to continue.</p>
        <label>
          Email
          <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </label>
        <label>
          Password
          <input type="password" autoComplete="current-password" required value={password} onChange={(e) => setPassword(e.target.value)} />
        </label>
        {error && <p role="alert">{error}</p>}
        <button type="submit" disabled={busy}>{busy ? 'Signing in…' : 'Sign in'}</button>
      </form>
    </main>
  );
}

export async function arcSignOut() {
  await signOutArcTeacher();
}
