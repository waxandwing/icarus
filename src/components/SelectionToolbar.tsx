import { addSchoolDays } from '../calendar/dates';
import { useWorkspaceStore } from '../state/store';
import styles from './SelectionToolbar.module.css';

export function SelectionToolbar({ onEdit }: { onEdit: (type: string, id: string) => void }) {
  const selection = useWorkspaceStore((s) => s.ui.selection);
  const domain = useWorkspaceStore((s) => s.domain);
  const select = useWorkspaceStore((s) => s.select);
  const markImportant = useWorkspaceStore((s) => s.markImportant);
  const crossOut = useWorkspaceStore((s) => s.crossOut);
  const unplace = useWorkspaceStore((s) => s.unplace);
  const movePlacement = useWorkspaceStore((s) => s.movePlacement);
  const moveNoteToFridge = useWorkspaceStore((s) => s.moveNoteToFridge);
  const moveNoteToDrawer = useWorkspaceStore((s) => s.moveNoteToDrawer);
  const openShiftDialog = useWorkspaceStore((s) => s.openShiftDialog);
  const copyLesson = useWorkspaceStore((s) => s.copyLesson);

  if (!selection) return null;

  const { objectType, objectId } = selection;
  const unit = objectType === 'unit' ? domain.units[objectId] : undefined;
  const lesson = objectType === 'lesson' ? domain.lessons[objectId] : undefined;
  const note = objectType === 'note' ? domain.notes[objectId] : undefined;
  const magnet = objectType === 'magnet' ? domain.magnets[objectId] : undefined;
  const obj = unit ?? lesson ?? note ?? magnet;
  if (!obj) return null;

  const placement = Object.values(domain.placements).find(
    (p) => p.objectType === objectType && p.objectId === objectId,
  );
  const important = 'important' in obj ? obj.important : false;
  const crossedOut = 'crossedOut' in obj ? obj.crossedOut : false;

  return (
    <div className={styles.bar} role="toolbar" aria-label={`${objectType} actions`}>
      <span className={styles.title}>{obj.title}</span>

      <button type="button" className={styles.button} onClick={() => onEdit(objectType, objectId)}>
        Edit
      </button>

      {(unit || lesson || note) && (
        <button
          type="button"
          className={styles.button}
          aria-pressed={important}
          onClick={() => markImportant(objectType as 'unit' | 'lesson' | 'note', objectId, !important)}
        >
          {important ? 'Important \u2713' : 'Mark important'}
        </button>
      )}

      {(lesson || note) && (
        <button
          type="button"
          className={styles.button}
          aria-pressed={crossedOut}
          onClick={() => crossOut(objectType as 'lesson' | 'note', objectId, !crossedOut)}
        >
          {crossedOut ? 'Restore' : 'Cross out'}
        </button>
      )}

      {placement && !placement.fixed && (
        <label className={styles.button} style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          Move to
          <input
            type="date"
            className={styles.dateInput}
            defaultValue={placement.date}
            onChange={(e) => e.target.value && movePlacement(placement.id, e.target.value)}
          />
        </label>
      )}

      {lesson && placement && (
        <button
          type="button"
          className={styles.button}
          onClick={() => {
            const result = copyLesson(objectId, addSchoolDays(domain.calendar, placement.date, 1));
            if (result.ok) select(null);
          }}
        >
          Copy to next day
        </button>
      )}

      {lesson?.sectionId && (
        <button
          type="button"
          className={styles.button}
          onClick={() => placement && openShiftDialog(lesson.sectionId!, placement.date)}
        >
          Shift section from here
        </button>
      )}

      {note && (
        <>
          <button type="button" className={styles.button} onClick={() => moveNoteToFridge(objectId)}>
            To fridge
          </button>
          <button type="button" className={styles.button} onClick={() => moveNoteToDrawer(objectId)}>
            To drawer
          </button>
        </>
      )}

      {placement && (
        <button type="button" className={styles.button} onClick={() => unplace(placement.id)}>
          Unplace
        </button>
      )}

      <button type="button" className={styles.closeButton} onClick={() => select(null)} aria-label="Close toolbar">
        {'\u2715'}
      </button>
    </div>
  );
}
