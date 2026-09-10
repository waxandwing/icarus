import { useWorkspaceStore } from '../state/store';
import type { PaletteToken } from '../domain/types';

type StoredSetup = {
  classes?: string;
};

const courseColors: PaletteToken[] = ['blue', 'mustard', 'sage', 'terracotta', 'pink', 'lavender'];

function parseClassLine(line: string) {
  const trimmed = line.trim();
  const parts = trimmed.split(/\s+[|—-]\s+/).map((part) => part.trim()).filter(Boolean);
  return {
    courseName: parts[0] || trimmed,
    sectionName: parts[1] || 'Class',
  };
}

export function applyStoredSetupToWorkspace() {
  const raw = localStorage.getItem('arc.setup.profile');
  if (!raw) return;

  let setup: StoredSetup;
  try {
    setup = JSON.parse(raw) as StoredSetup;
  } catch {
    return;
  }

  const classLines = (setup.classes || '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  if (!classLines.length) return;

  const store = useWorkspaceStore.getState();
  if (store.domain.isSampleWorkspace) store.clearSampleData();

  classLines.forEach((line, index) => {
    const { courseName, sectionName } = parseClassLine(line);
    const current = useWorkspaceStore.getState();
    let course = Object.values(current.domain.courses).find((item) => item.name.trim().toLowerCase() === courseName.toLowerCase());

    if (!course) {
      const result = current.createCourse(courseName, courseColors[index % courseColors.length]);
      if (!result.ok) return;
      course = Object.values(useWorkspaceStore.getState().domain.courses).find((item) => item.name.trim().toLowerCase() === courseName.toLowerCase());
    }

    if (!course) return;

    const latest = useWorkspaceStore.getState();
    const alreadyExists = Object.values(latest.domain.sections).some((section) => section.courseId === course!.id && section.name.trim().toLowerCase() === sectionName.toLowerCase());
    if (!alreadyExists) latest.createSection(course.id, sectionName);
  });
}
