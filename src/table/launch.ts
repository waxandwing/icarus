import { todayISO } from '../calendar/dates';
import { useWorkspaceStore } from '../state/store';
import {
  applyPublishPolicy,
  isStudentBoardPath,
  studentBoardUrl,
} from './boardSession';
import { resolveTeachingSection, writeTableDayFocus } from './dayPlan';

export const TABLE_TEACHER_PATH = '/table';
export const TABLE_STUDENT_PATH = '/table?display=student';
export const TABLE_BOARD_PATH = '/board';

export {
  DEFAULT_BOARD_SLUG,
  applyPublishPolicy,
  isBoardJoinPath,
  isClaimedLiveSlug,
  isClassroomPath,
  isStudentBoardPath,
  liveSlugFromPath,
  parseBoardJoinInput,
  publishBoard,
  setAutoRunToday,
  studentBoardPath,
  studentBoardUrl,
  unpublishBoard,
} from './boardSession';

export function isStudentDisplay(): boolean {
  return isStudentBoardPath(window.location.pathname, window.location.search);
}

/** Open the teacher table and a waiting student window. Does not publish unless auto-run today is on. */
export async function startMyDay() {
  const { domain, ui } = useWorkspaceStore.getState();
  const date = ui.anchorDate || todayISO();
  const lessonId = ui.selection?.objectType === 'lesson' ? ui.selection.objectId : undefined;
  const section = resolveTeachingSection(domain, date, { lessonId }, ui.selection);
  writeTableDayFocus({ date, sectionId: section?.id, lessonId });
  await useWorkspaceStore.getState().persistNow();
  applyPublishPolicy();
  openStudentBoard();
  if (window.location.pathname !== TABLE_TEACHER_PATH) {
    window.location.assign(TABLE_TEACHER_PATH);
  }
}

export function openStudentBoard() {
  window.open(studentBoardUrl(), 'arctable-board');
}

export async function copyStudentBoardUrl(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(studentBoardUrl());
    return true;
  } catch {
    return false;
  }
}
