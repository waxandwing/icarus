import { addSchoolDays } from '../calendar/dates';
import { useWorkspaceStore } from '../state/store';
import styles from './SelectionToolbar.module.css';

export function SelectionToolbar({ onEdit }: { onEdit: (type: string, id: string) => void }) {
  const selection = useWorkspaceStore((s) => s.ui.selection);
  const view = useWorkspaceStore((s) => s.ui.view);
  const domain = useWorkspaceStore((s) => s.domain);
  const select = useWorkspaceStore((s) => s.select);
  const markImportant = useWorkspaceStore((s) => s.markImportant);
  const crossOut = useWorkspaceStore((s) => s.crossOut);
  const unplace = useWorkspaceStore((s) => s.unplace);
  const movePlacement = useWorkspaceStore((s) => s.movePlacement);
  const moveNoteToFridge = useWorkspaceStore((s) => s.moveNoteToFridge);
  const moveNoteToDrawer = useWorkspaceStore((s) => s.moveNoteToDrawer);
  const moveMagnetToFridge = useWorkspaceStore((s) => s.moveMagnetToFridge);
  const moveMagnetToDrawer = useWorkspaceStore((s) => s.moveMagnetToDrawer);
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
  const canMovePlacement = Boolean(placement && !placement.fixed && !(unit && view === 'week'));

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
          aria-label={important ? `Remove red circle from ${obj.title}` : `Circle ${obj.title} in red`}
          onClick={() => markImportant(objectType as 'unit' | 'lesson' | 'note', objectId, !important)}
        >
          {important ? 'Uncircle' : 'Circle in red'}
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

      {canMovePlacement && placement && (
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

      {unit && view === 'week' && placement && (
        <span className={styles.button} aria-label="Unit movement is available in Month and Quarter">
          Move in Month/Quarter
        </span>
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

      {magnet && (
        <>
          <button type="button" className={styles.button} onClick={() => moveMagnetToFridge(objectId)}>
            To fridge
          </button>
          <button type="button" className={styles.button} onClick={() => moveMagnetToDrawer(objectId)}>
            To drawer
          </button>
        </>
      )}

      {placement && !(unit && view === 'week') && (
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
