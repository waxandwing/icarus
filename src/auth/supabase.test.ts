import { beforeEach, describe, expect, it, vi } from 'vitest';

type Session = { access_token: string; refresh_token: string; user: { id: string; email?: string } };

function installFakeSupabase(options?: { session?: Session | null; remotePayload?: unknown }) {
  const session = options?.session ?? null;
  const signInWithPassword = vi.fn(async ({ email }: { email: string; password: string }) => ({
    data: { session: { access_token: 'a', refresh_token: 'r', user: { id: 'user-a', email } } },
    error: null,
  }));
  const signOut = vi.fn(async () => ({ error: null }));
  const getSession = vi.fn(async () => ({ data: { session }, error: null }));
  const unsubscribe = vi.fn();
  const onAuthStateChange = vi.fn(() => ({ data: { subscription: { unsubscribe } } }));
  const maybeSingle = vi.fn(async () => ({
    data: options?.remotePayload === undefined ? null : { payload: options.remotePayload, updated_at: '2026-09-10T00:00:00Z' },
    error: null,
  }));
  const eq = vi.fn(() => ({ maybeSingle }));
  const select = vi.fn(() => ({ eq }));
  const upsert = vi.fn(async (_value: { user_id: string; payload: unknown; updated_at: string }, _options: { onConflict: string }) => ({ data: null, error: null }));
  const from = vi.fn(() => ({ select, upsert }));
  const createClient = vi.fn(() => ({
    auth: { getSession, signInWithPassword, signOut, onAuthStateChange },
    from,
  }));

  window.supabase = { createClient } as typeof window.supabase;
  return { createClient, getSession, signInWithPassword, signOut, onAuthStateChange, unsubscribe, from, select, eq, maybeSingle, upsert };
}

beforeEach(() => {
  vi.resetModules();
  delete window.supabase;
});

describe('B08 Supabase boundary', () => {
  it('uses explicit local sign-out scope', async () => {
    const fake = installFakeSupabase();
    const { signOutLocally } = await import('./supabase');
    await signOutLocally();
    expect(fake.signOut).toHaveBeenCalledWith({ scope: 'local' });
  });

  it('preserves password-manager supplied credentials without transformation', async () => {
    const fake = installFakeSupabase();
    const { signInWithPassword } = await import('./supabase');
    await signInWithPassword('teacher@example.com', ' pasted password ');
    expect(fake.signInWithPassword).toHaveBeenCalledWith({
      email: 'teacher@example.com',
      password: ' pasted password ',
    });
  });

  it('loads only the authenticated user workspace row', async () => {
    const fake = installFakeSupabase({ remotePayload: { marker: 'A' } });
    const { loadRemoteWorkspace } = await import('./supabase');
    const result = await loadRemoteWorkspace('user-a');
    expect(fake.from).toHaveBeenCalledWith('arc_workspaces');
    expect(fake.select).toHaveBeenCalledWith('payload,updated_at');
    expect(fake.eq).toHaveBeenCalledWith('user_id', 'user-a');
    expect(result).toEqual({ marker: 'A' });
  });

  it('upserts the row under the authenticated account id', async () => {
    const fake = installFakeSupabase();
    const { saveRemoteWorkspace } = await import('./supabase');
    await saveRemoteWorkspace('user-b', { marker: 'B' });
    expect(fake.upsert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: 'user-b', payload: { marker: 'B' } }),
      { onConflict: 'user_id' },
    );
  });

  it('subscribes and returns the provider unsubscribe handle', async () => {
    const fake = installFakeSupabase();
    const { subscribeToAuth } = await import('./supabase');
    const stop = subscribeToAuth(() => undefined);
    expect(fake.onAuthStateChange).toHaveBeenCalledTimes(1);
    stop();
    expect(fake.unsubscribe).toHaveBeenCalledTimes(1);
  });
});
