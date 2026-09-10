export interface ArcSessionUser {
  id: string;
  email?: string;
}

export interface ArcSession {
  access_token: string;
  refresh_token: string;
  expires_at?: number;
  user: ArcSessionUser;
}

interface ArcAuthError {
  message: string;
}

interface AuthSubscription {
  unsubscribe(): void;
}

interface SupabaseAuthLike {
  getSession(): Promise<{ data: { session: ArcSession | null }; error: ArcAuthError | null }>;
  signInWithPassword(credentials: {
    email: string;
    password: string;
  }): Promise<{ data: { session: ArcSession | null }; error: ArcAuthError | null }>;
  signOut(options: { scope: 'local' }): Promise<{ error: ArcAuthError | null }>;
  onAuthStateChange(
    callback: (event: string, session: ArcSession | null) => void,
  ): { data: { subscription: AuthSubscription } };
}

interface QueryResult<T> {
  data: T | null;
  error: ArcAuthError | null;
}

interface SupabaseTableLike {
  select(columns: string): {
    eq(column: string, value: string): {
      maybeSingle(): Promise<QueryResult<{ payload: unknown; updated_at?: string }>>;
    };
  };
  upsert(
    value: { user_id: string; payload: unknown; updated_at: string },
    options: { onConflict: string },
  ): Promise<QueryResult<unknown>>;
}

interface SupabaseClientLike {
  auth: SupabaseAuthLike;
  from(table: string): SupabaseTableLike;
}

interface SupabaseBrowserGlobal {
  createClient(
    url: string,
    key: string,
    options?: {
      auth?: {
        persistSession?: boolean;
        autoRefreshToken?: boolean;
        detectSessionInUrl?: boolean;
        storageKey?: string;
      };
    },
  ): SupabaseClientLike;
}

declare global {
  interface Window {
    supabase?: SupabaseBrowserGlobal;
  }
}

const PROJECT_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://jnbppgjkzzuquhenaqtq.supabase.co';

// This is a browser-safe Supabase publishable key, not a service-role secret.
const PUBLISHABLE_KEY =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_0wnc_Y6ccYUsA78VGjmOKw_d0zTig_V';

let client: SupabaseClientLike | null = null;

export function getSupabaseClient(): SupabaseClientLike {
  if (client) return client;
  if (!window.supabase?.createClient) {
    throw new Error('Arc could not load its authentication service. Check your connection and reload.');
  }
  client = window.supabase.createClient(PROJECT_URL, PUBLISHABLE_KEY, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      storageKey: 'arc-auth-v1',
    },
  });
  return client;
}

export async function readInitialSession(): Promise<ArcSession | null> {
  const { data, error } = await getSupabaseClient().auth.getSession();
  if (error) throw new Error(error.message);
  return data.session;
}

export async function signInWithPassword(email: string, password: string): Promise<ArcSession> {
  const { data, error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
  if (error) throw new Error(error.message);
  if (!data.session) throw new Error('Arc could not establish a signed-in session.');
  return data.session;
}

export async function signOutLocally(): Promise<void> {
  const { error } = await getSupabaseClient().auth.signOut({ scope: 'local' });
  if (error) throw new Error(error.message);
}

export function subscribeToAuth(
  callback: (event: string, session: ArcSession | null) => void,
): () => void {
  const { data } = getSupabaseClient().auth.onAuthStateChange(callback);
  return () => data.subscription.unsubscribe();
}

export async function loadRemoteWorkspace(userId: string): Promise<unknown | null> {
  const { data, error } = await getSupabaseClient()
    .from('arc_workspaces')
    .select('payload,updated_at')
    .eq('user_id', userId)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.payload ?? null;
}

export async function saveRemoteWorkspace(userId: string, payload: unknown): Promise<void> {
  const { error } = await getSupabaseClient().from('arc_workspaces').upsert(
    {
      user_id: userId,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  );
  if (error) throw new Error(error.message);
}
