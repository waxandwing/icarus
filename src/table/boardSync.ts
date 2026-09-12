import type { FlowBlock, PassRecord, RoomState, TablePrefs, ClassroomStudent } from './classroom';

export const TABLE_BOARD_CHANNEL = 'arctable-board';
export const BOARD_HELLO = { type: 'board-hello' } as const;

export type TableBoardSnapshot = {
  v: 1;
  seconds: number;
  running: boolean;
  currentIndex: number;
  flow: FlowBlock[];
  roomState: RoomState;
  studentBlackout: boolean;
  prefs: TablePrefs;
  roster: ClassroomStudent[];
  absentIds: string[];
  activePass: PassRecord | null;
};

/** Blob media URLs are window-local; do not send them to the smartboard copy. */
export function snapshotForBoard(input: Omit<TableBoardSnapshot, 'v'>): TableBoardSnapshot {
  return {
    v: 1,
    ...input,
    flow: input.flow.map((block) =>
      block.media ? { ...block, media: { ...block.media, url: '' } } : block,
    ),
  };
}

export function isBoardSnapshot(value: unknown): value is TableBoardSnapshot {
  if (!value || typeof value !== 'object') return false;
  const snap = value as TableBoardSnapshot;
  return snap.v === 1 && typeof snap.seconds === 'number' && Array.isArray(snap.flow);
}

export function isBoardHello(value: unknown): value is typeof BOARD_HELLO {
  return Boolean(value && typeof value === 'object' && (value as { type?: string }).type === 'board-hello');
}
