export const CLEANUP_SECONDS = 5 * 60;
export const DEFAULT_PERIOD_SECONDS = 24 * 60 + 58;

export type DisplayMode = 'board' | 'laptop' | 'compact';
export type DisplayOverride = 'auto' | DisplayMode;
export type PassState = 'available' | 'active' | 'return';
export type RoomState = 'live' | 'hold' | 'reconnecting';
export type ToolView = 'home' | 'groups' | 'picker' | 'pass' | 'notes' | 'media' | 'more';

export type FlowKind = 'block' | 'demo' | 'cleanup';
export type AlarmVoice = 'chime' | 'bell' | 'custom';

export type BlockMedia = {
  name: string;
  url: string;
  kind: 'image' | 'video' | 'file';
};

export type FlowBlock = {
  id: string;
  title: string;
  minutes: number;
  kind: FlowKind;
  prompt: string;
  media?: BlockMedia | null;
};

export const COURSE_LABEL = '2D Art 1';
export const UNIT_LABEL = 'Studio Practices · Quarter 1';

export const DEFAULT_FLOW: FlowBlock[] = [
  { id: 'warmup', title: 'Warm Up', minutes: 5, kind: 'block', prompt: 'Settle in and get materials out.' },
  { id: 'demo', title: 'Demo', minutes: 15, kind: 'demo', prompt: 'Watch the demonstration, then try the move yourself.' },
  {
    id: 'studio',
    title: 'Studio Time',
    minutes: 25,
    kind: 'block',
    prompt: 'Creating personal collage compositions using magazine materials.',
  },
  { id: 'critique', title: 'Critique', minutes: 10, kind: 'block', prompt: 'Share work. Be specific and kind.' },
  { id: 'cleanup', title: 'Cleanup', minutes: 5, kind: 'cleanup', prompt: 'Tools away. Tables clear. Chairs in.' },
];

export const CURRENT_FLOW_INDEX = 2;

export function durationLabel(minutes: number): string {
  return `${Math.max(1, Math.round(minutes))} min`;
}

export function secondsForBlock(minutes: number): number {
  return Math.max(1, Math.round(minutes)) * 60;
}

export function isCleanupBlock(block: FlowBlock | undefined): boolean {
  return block?.kind === 'cleanup';
}

export function nextBlock(flow: FlowBlock[], index: number): FlowBlock | null {
  return flow[index + 1] ?? null;
}

export function addFlowBlock(flow: FlowBlock[]): FlowBlock[] {
  return [
    ...flow,
    {
      id: `block-${Date.now()}`,
      title: 'New block',
      minutes: 5,
      kind: 'block',
      prompt: '',
    },
  ];
}

export function updateFlowBlock(flow: FlowBlock[], index: number, patch: Partial<FlowBlock>): FlowBlock[] {
  return flow.map((block, blockIndex) => (blockIndex === index ? { ...block, ...patch, id: block.id } : block));
}

export function removeFlowBlock(flow: FlowBlock[], index: number): FlowBlock[] {
  if (flow.length <= 1) return flow;
  return flow.filter((_, blockIndex) => blockIndex !== index);
}

export function moveFlowBlock(flow: FlowBlock[], index: number, direction: -1 | 1): FlowBlock[] {
  const target = index + direction;
  if (target < 0 || target >= flow.length) return flow;
  const next = [...flow];
  const current = next[index];
  const swap = next[target];
  if (!current || !swap) return flow;
  next[index] = swap;
  next[target] = current;
  return next;
}

export type PassKind = 'bathroom' | 'nurse' | 'office';

export type TablePrefs = {
  className: string;
  periodName: string;
  roomName: string;
  teacherName: string;
  autoAdvance: boolean;
  alarmOnCleanup: boolean;
  studentPass: boolean;
  studentGroups: boolean;
  studentMembers: boolean;
  studentClock: boolean;
  showPrompt: boolean;
  showNext: boolean;
  showCleanup: boolean;
  showTimer: boolean;
  largeType: boolean;
  passBathroom: boolean;
  passNurse: boolean;
  passOffice: boolean;
  passAlertMinutes: number;
};

export const DEFAULT_TABLE_PREFS: TablePrefs = {
  className: COURSE_LABEL,
  periodName: 'Period 3',
  roomName: 'Room 214',
  teacherName: '',
  autoAdvance: false,
  alarmOnCleanup: true,
  studentPass: true,
  studentGroups: true,
  studentMembers: true,
  studentClock: true,
  showPrompt: true,
  showNext: true,
  showCleanup: true,
  showTimer: true,
  largeType: false,
  passBathroom: true,
  passNurse: true,
  passOffice: true,
  passAlertMinutes: 10,
};

export function mediaKindFromFile(file: File): BlockMedia['kind'] {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return 'file';
}

export function enabledPassKinds(prefs: TablePrefs): PassKind[] {
  const kinds: PassKind[] = [];
  if (prefs.passBathroom) kinds.push('bathroom');
  if (prefs.passNurse) kinds.push('nurse');
  if (prefs.passOffice) kinds.push('office');
  return kinds;
}

export const PASS_ALERT_SECONDS = 10 * 60;

export type ClassroomStudent = {
  id: string;
  name: string;
  group: number;
};

export type PassRecord = {
  id: string;
  studentId: string;
  studentName: string;
  kind: PassKind;
  outAt: number;
  inAt: number | null;
};

export type ArcLink = {
  connected: boolean;
  lastAttemptAt: number | null;
};

export function parseStudentNames(text: string): string[] {
  const seen = new Set<string>();
  const names: string[] = [];
  for (const part of text.split(/[\n,;]+/)) {
    const name = part.replace(/\s+/g, ' ').trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) continue;
    seen.add(key);
    names.push(name);
  }
  return names;
}

export function addNamedStudents(roster: ClassroomStudent[], names: string[]): ClassroomStudent[] {
  const existing = new Set(roster.map((student) => student.name.toLowerCase()));
  const added = names
    .filter((name) => !existing.has(name.toLowerCase()))
    .map((name, index) => ({
      id: `stu-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${roster.length + index}`,
      name,
      group: ((roster.length + index) % 4) + 1,
    }));
  return added.length === 0 ? roster : [...roster, ...added];
}

export function removeStudentById(roster: ClassroomStudent[], id: string): ClassroomStudent[] {
  return roster.filter((student) => student.id !== id);
}

export function elapsedSeconds(outAt: number, now: number): number {
  return Math.max(0, Math.floor((now - outAt) / 1000));
}

export function formatElapsed(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0');
  const remainder = (safe % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export function isPassOverdue(outAt: number, now: number, limitSeconds = PASS_ALERT_SECONDS): boolean {
  return elapsedSeconds(outAt, now) >= limitSeconds;
}

export function startPass(student: ClassroomStudent, kind: PassKind, now: number): PassRecord {
  return {
    id: `pass-${student.id}-${now}`,
    studentId: student.id,
    studentName: student.name,
    kind,
    outAt: now,
    inAt: null,
  };
}

export function closePass(pass: PassRecord, now: number): PassRecord {
  return { ...pass, inAt: now };
}

export function requestArcSync(now: number): ArcLink {
  return { connected: false, lastAttemptAt: now };
}

export const GROUPS = [
  { id: 1, name: 'Table A', count: 6 },
  { id: 2, name: 'Table B', count: 6 },
  { id: 3, name: 'Table C', count: 6 },
  { id: 4, name: 'Table D', count: 6 },
] as const;

export const STUDENTS: ClassroomStudent[] = [
  { id: 'amira', name: 'Amira K.', group: 1 },
  { id: 'ben', name: 'Ben R.', group: 1 },
  { id: 'jordan', name: 'Jordan M.', group: 2 },
  { id: 'luis', name: 'Luis P.', group: 2 },
  { id: 'nora', name: 'Nora S.', group: 3 },
  { id: 'priya', name: 'Priya T.', group: 3 },
  { id: 'quin', name: 'Quin W.', group: 4 },
  { id: 'sam', name: 'Sam Y.', group: 4 },
];

export const PASS_STUDENT_ID = 'jordan';

export function isCleanup(seconds: number, block?: FlowBlock): boolean {
  if (block) return isCleanupBlock(block);
  return seconds <= CLEANUP_SECONDS;
}

export function formatTimer(seconds: number): string {
  const safe = Math.max(0, Math.floor(seconds));
  const minutes = Math.floor(safe / 60).toString().padStart(2, '0');
  const remainder = (safe % 60).toString().padStart(2, '0');
  return `${minutes}:${remainder}`;
}

export function displayModeFromWidth(width: number): DisplayMode {
  if (width >= 1600) return 'board';
  if (width >= 1024) return 'laptop';
  return 'compact';
}

export function resolveDisplayMode(override: DisplayOverride, width: number): DisplayMode {
  return override === 'auto' ? displayModeFromWidth(width) : override;
}

export function nextPassState(state: PassState): PassState {
  if (state === 'available') return 'active';
  if (state === 'active') return 'return';
  return 'available';
}

export function studentIsOut(studentId: string, activePass: PassRecord | null, passState: PassState = 'available'): boolean {
  if (activePass && activePass.inAt === null) return studentId === activePass.studentId;
  return studentId === PASS_STUDENT_ID && passState !== 'available';
}

export function inRoomStudents(
  roster: readonly ClassroomStudent[] = STUDENTS,
  activePass: PassRecord | null = null,
  passState: PassState = 'available',
) {
  return roster.filter((student) => !studentIsOut(student.id, activePass, passState));
}

export function pickStudent(
  passState: PassState,
  excludeId?: string,
  absentIds: readonly string[] = [],
  roster: readonly ClassroomStudent[] = STUDENTS,
  activePass: PassRecord | null = null,
) {
  const absent = new Set(absentIds);
  const pool = inRoomStudents(roster, activePass, passState).filter(
    (student) => student.id !== excludeId && !absent.has(student.id),
  );
  if (pool.length === 0) return null;
  const index = Math.floor(Math.random() * pool.length);
  return pool[index] ?? null;
}

export function formatSessionDate(now: Date): string {
  return now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

export function formatClock(now: Date): string {
  return now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

export function passActionLabel(state: PassState): string {
  if (state === 'available') return 'Issue pass';
  if (state === 'active') return 'Mark returned';
  return 'Reset pass';
}

export function passHeading(state: PassState): string {
  if (state === 'available') return 'Pass available';
  if (state === 'active') return '1 student out';
  return 'Returning';
}

export function roomStatusLabel(studentBlackout: boolean, roomState: RoomState): string {
  if (studentBlackout) return 'black';
  return roomState;
}

export function resolveAccessibilityToggle(override: boolean | null, systemPrefers: boolean): boolean {
  return override === null ? systemPrefers : override;
}
