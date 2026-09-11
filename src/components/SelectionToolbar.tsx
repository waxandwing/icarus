import { addSchoolDays } from '../calendar/dates';
import { useWorkspaceStore } from '../state/store';
import { useEffect, useState } from 'react';
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
  const moveMagnetToFridge = useWorkspaceStore((s) => s.moveMagnetToFridge);
  const moveMagnetToDrawer = useWorkspaceStore((s) => s.moveMagnetToDrawer);
  const openShiftDialog = useWorkspaceStore((s) => s.openShiftDialog);
  const copyLesson = useWorkspaceStore((s) => s.copyLesson);
  const deleteObject = useWorkspaceStore((s) => s.deleteObject);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const objectType = selection?.objectType;
  const objectId = selection?.objectId;

  useEffect(() => {
    setConfirmDelete(false);
  }, [objectType, objectId]);

  if (!selection || !objectType || !objectId) return null;
  const selectedType = objectType;
  const selectedId = objectId;
  const unit = selectedType === 'unit' ? domain.units[selectedId] : undefined;
  const lesson = selectedType === 'lesson' ? domain.lessons[selectedId] : undefined;
  const note = selectedType === 'note' ? domain.notes[selectedId] : undefined;
  const magnet = selectedType === 'magnet' ? domain.magnets[selectedId] : undefined;
  const obj = unit ?? lesson ?? note ?? magnet;
  if (!obj) return null;

  const placement = Object.values(domain.placements).find(
    (p) => p.objectType === objectType && p.objectId === objectId,
  );
  const important = 'important' in obj ? obj.important : false;
  const crossedOut = 'crossedOut' in obj ? obj.crossedOut : false;

  function handleDelete() {
    const result = deleteObject(selectedType as 'unit' | 'lesson' | 'note' | 'magnet', selectedId);
    if (result.ok) {
      setConfirmDelete(false);
      select(null);
    }
  }

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
          {important ? 'Important' : 'Mark important'}
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

      {placement && (
        <button type="button" className={styles.button} onClick={() => unplace(placement.id)}>
          Unplace
        </button>
      )}

      {confirmDelete ? (
        <>
          <span className={styles.warning}>Delete destroys this.</span>
          <button type="button" className={styles.button} data-danger="true" onClick={handleDelete}>
            Delete
          </button>
          <button type="button" className={styles.button} onClick={() => setConfirmDelete(false)}>
            Keep
          </button>
        </>
      ) : (
        <button type="button" className={styles.button} onClick={() => setConfirmDelete(true)}>
          Delete
        </button>
      )}

      <button type="button" className={styles.closeButton} onClick={() => select(null)} aria-label="Close toolbar">
        Close
      </button>
    </div>
  );
}
