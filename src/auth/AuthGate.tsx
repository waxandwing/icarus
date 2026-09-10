import { type FormEvent, type ReactNode, useEffect, useRef, useState } from 'react';
import { ArcMark } from '../assets/ArcMark';
import { createInitialState } from '../domain/seed';
import {
  claimLegacyWorkspace,
  declineLegacyWorkspace,
  setPersistenceAccount,
  shouldOfferLegacyMigration,
} from '../persistence/db';
import { useWorkspaceStore } from '../state/store';
import {
  type ArcSession,
  readInitialSession,
  signInWithPassword,
  signOutLocally,
  subscribeToAuth,
} from './supabase';
import styles from './AuthGate.module.css';

function resetWorkspaceMemory() {
  useWorkspaceStore.setState((state) => ({
    domain: createInitialState(),
    undo: null,
    ui: {
      ...state.ui,
      ready: false,
      selection: null,
      openPanel: null,
      shiftDialog: { open: false, sectionId: null, fromDate: null, schoolDays: 1, reason: '' },
      liveClassroom: { open: false, sectionId: null, lessonId: null },
      toast: null,
    },
  }));
}

export function AuthGate({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<ArcSession | null>(null);
  const [booting, setBooting] = useState(true);
  const [working, setWorking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [legacyDecision, setLegacyDecision] = useState(false);
  const sequence = useRef(0);
  const currentUserId = useRef<string | null>(null);

  async function hydrateSession(nextSession: ArcSession | null) {
    const run = ++sequence.current;
    currentUserId.current = nextSession?.user.id ?? null;
    setError(null);
    setBooting(true);
    setLegacyDecision(false);
    resetWorkspaceMemory();

    if (!nextSession) {
      setPersistenceAccount(null);
      if (run === sequence.current) {
        setSession(null);
        setBooting(false);
      }
      return;
    }

    setPersistenceAccount(nextSession.user.id);
    try {
      const offerLegacy = await shouldOfferLegacyMigration(nextSession.user.id);
      if (run !== sequence.current) return;
      setSession(nextSession);
      if (offerLegacy) {
        setLegacyDecision(true);
        setBooting(false);
        return;
      }
      await useWorkspaceStore.getState().init();
      if (run === sequence.current) setBooting(false);
    } catch (err) {
      if (run !== sequence.current) return;
      setSession(nextSession);
      setError(err instanceof Error ? err.message : 'Arc could not safely open this account.');
      setBooting(false);
    }
  }

  useEffect(() => {
    let active = true;
    let unsubscribe: () => void = () => {};

    void (async () => {
      try {
        const initial = await readInitialSession();
        if (!active) return;
        await hydrateSession(initial);
        if (!active) return;
        unsubscribe = subscribeToAuth((event, nextSession) => {
          const nextUserId = nextSession?.user.id ?? null;
          if (event === 'TOKEN_REFRESHED' && nextUserId === currentUserId.current) return;
          if (event === 'SIGNED_IN' && nextUserId === currentUserId.current) return;
          void hydrateSession(nextSession);
        });
      } catch (err) {
        if (!active) return;
        setError(err instanceof Error ? err.message : 'Arc could not reach authentication.');
        setBooting(false);
      }
    })();

    return () => {
      active = false;
      sequence.current += 1;
      unsubscribe();
    };
    // The auth subscription owns future session changes after this one-time boot.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function onSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '');
    setWorking(true);
    setError(null);
    try {
      const nextSession = await signInWithPassword(email, password);
      if (currentUserId.current !== nextSession.user.id) await hydrateSession(nextSession);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Arc could not sign in.');
    } finally {
      setWorking(false);
    }
  }

  async function onSignOut() {
    setWorking(true);
    setError(null);
    try {
      await signOutLocally();
      if (currentUserId.current !== null) await hydrateSession(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Arc could not sign out safely.');
    } finally {
      setWorking(false);
    }
  }

  async function resolveLegacy(importIt: boolean) {
    if (!session) return;
    setWorking(true);
    setError(null);
    try {
      if (importIt) await claimLegacyWorkspace(session.user.id);
      else await declineLegacyWorkspace(session.user.id);
      setLegacyDecision(false);
      resetWorkspaceMemory();
      await useWorkspaceStore.getState().init();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Arc kept the local work unchanged because it could not import it safely.');
    } finally {
      setWorking(false);
    }
  }

  if (booting) {
    return (
      <div className={styles.shell} role="status" aria-live="polite">
        <div className={styles.status}>
          <ArcMark size={48} />
          <span>Opening your Arc workspace…</span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <main className={styles.shell}>
        <section className={styles.card} aria-labelledby="arc-sign-in-title">
          <div className={styles.brand}>
            <ArcMark size={48} />
            <div>
              <p className={styles.eyebrow}>Wax &amp; Wing</p>
              <h1 id="arc-sign-in-title">Arc</h1>
            </div>
          </div>
          <p className={styles.copy}>Sign in to return to the exact planner state attached to your account.</p>
          <form className={styles.form} onSubmit={onSignIn}>
            <label className={styles.field}>
              Email
              <input name="email" type="email" autoComplete="email" inputMode="email" required />
            </label>
            <label className={styles.field}>
              Password
              <input name="password" type="password" autoComplete="current-password" required />
            </label>
            <button className={styles.primary} type="submit" disabled={working}>
              {working ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
        </section>
      </main>
    );
  }

  if (legacyDecision) {
    return (
      <main className={styles.shell}>
        <section className={styles.card} aria-labelledby="local-work-title">
          <p className={styles.eyebrow}>Local work found</p>
          <h1 id="local-work-title">Keep the work already on this device?</h1>
          <p className={styles.copy}>
            Arc found a planner saved here before account-based storage was added. Importing attaches that work to {session.user.email || 'this account'}. Choosing “Not now” leaves the old local copy untouched.
          </p>
          <div className={styles.actions}>
            <button className={styles.primary} type="button" onClick={() => void resolveLegacy(true)} disabled={working}>
              Import this work
            </button>
            <button className={styles.secondary} type="button" onClick={() => void resolveLegacy(false)} disabled={working}>
              Not now
            </button>
          </div>
          {error ? <p className={styles.error} role="alert">{error}</p> : null}
        </section>
      </main>
    );
  }

  if (error || !useWorkspaceStore.getState().ui.ready) {
    return (
      <main className={styles.shell}>
        <section className={styles.card} aria-labelledby="workspace-error-title">
          <p className={styles.eyebrow}>Workspace protected</p>
          <h1 id="workspace-error-title">Arc did not replace unverified saved work.</h1>
          <p className={styles.copy}>{error || 'Arc is still verifying this account’s saved workspace.'}</p>
          <div className={styles.actions}>
            <button className={styles.primary} type="button" onClick={() => void hydrateSession(session)} disabled={working}>
              Try again
            </button>
            <button className={styles.secondary} type="button" onClick={() => void onSignOut()} disabled={working}>
              Sign out
            </button>
          </div>
        </section>
      </main>
    );
  }

  return <>{children}</>;
}
