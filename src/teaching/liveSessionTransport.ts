export type RoomMode = 'live' | 'held' | 'paused' | 'blank';

export type RoomProjection = {
  stepIndex: number;
  releasedStepIndex: number;
  steps: Array<{ title: string; body: string }>;
  roomMode: RoomMode;
  clockVisible: boolean;
  timer: {
    active: boolean;
    kind: 'normal' | 'cleanup';
    endsAt: string | null;
    label: string;
  };
  pass: {
    active: boolean;
    publicLabel: string;
    startedAt: string | null;
  };
  layout: {
    pass: 'bottom-left' | 'bottom-right';
    clock: 'top-left' | 'top-right';
    progress: 'top';
  };
};

export type LiveSession = {
  id: string;
  room_code: string;
  channel_key: string;
  lesson_title?: string;
  expires_at: string;
  updated_at?: string;
  display_last_seen_at?: string | null;
  room_projection: RoomProjection;
  teacher_state?: Record<string, unknown>;
};

const PROJECT_URL = 'https://jnbppgjkzzuquhenaqtq.supabase.co';
const ENDPOINT = `${PROJECT_URL}/functions/v1/teaching-session`;

async function post<T>(body: Record<string, unknown>, accessToken?: string): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  const response = await fetch(ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
    cache: 'no-store',
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = typeof payload?.error === 'string' ? payload.error : `HTTP ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export const liveSessionTransport = {
  async start(input: {
    accessToken: string;
    lessonTitle: string;
    teacherState: Record<string, unknown>;
    roomProjection: RoomProjection;
  }) {
    const result = await post<{ session: LiveSession }>(
      {
        action: 'start',
        lessonTitle: input.lessonTitle,
        teacherState: input.teacherState,
        roomProjection: input.roomProjection,
      },
      input.accessToken,
    );
    return result.session;
  },

  async update(input: {
    accessToken: string;
    sessionId: string;
    teacherState: Record<string, unknown>;
    roomProjection: RoomProjection;
  }) {
    const result = await post<{ session: LiveSession }>(
      {
        action: 'update',
        sessionId: input.sessionId,
        teacherState: input.teacherState,
        roomProjection: input.roomProjection,
      },
      input.accessToken,
    );
    return result.session;
  },

  async resume(accessToken: string) {
    const result = await post<{ session: LiveSession | null }>({ action: 'resume' }, accessToken);
    return result.session;
  },

  async end(accessToken: string, sessionId: string) {
    await post<{ ok: true }>({ action: 'end', sessionId }, accessToken);
  },

  async join(roomCode: string) {
    const result = await post<{ session: LiveSession }>({ action: 'join', roomCode });
    return result.session;
  },

  async sync(roomCode: string, channelKey: string) {
    const result = await post<{ session: LiveSession }>({ action: 'sync', roomCode, channelKey });
    return result.session;
  },
};

export const TEACHING_ROOM_SYNC_MS = 900;
