import { useState } from 'react';
import { dayKind, dayLabel, isToday } from '../../calendar/dates';
import { getPlacementsForDate } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import styles from './DayPlanningLane.module.css';

export function DayPlanningLane({ date }: { date: string }) {
  const domain = useWorkspaceStore((s) => s.domain);
  const createNote = useWorkspaceStore((s) => s.createNote);
  const editNote = useWorkspaceStore((s) => s.editNote);
  const movePlacement = useWorkspaceStore((s) => s.movePlacement);
  const placeNoteOnCalendar = useWorkspaceStore((s) => s.placeNoteOnCalendar);
  const setAnchorDate = useWorkspaceStore((s) => s.setAnchorDate);
  const select = useWorkspaceStore((s) => s.select);
  const [draft, setDraft] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const kind = dayKind(domain.calendar, date);
  const label = dayLabel(domain.calendar, date);
  const today = isToday(date);
  const calendarNotes = getPlacementsForDate(domain, date).filter((p) => p.objectType === 'note');
  const datedTasks = Object.values(domain.notes).filter(
    (note) => note.location === 'taskbar' && note.associatedDate === date,
  );

  function submit() {
    const title = draft.trim();
    if (!title) return;
    createNote({ title, location: 'calendar', date });
    setDraft('');
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);

    const taskNoteId = e.dataTransfer.getData('text/arc-taskbar-note');
    if (taskNoteId) {
      editNote(taskNoteId, { associatedDate: date });
      return;
    }

    const placementId = e.dataTransfer.getData('text/arc-placement-id');
    if (placementId) {
      const placement = domain.placements[placementId];
      if (placement?.objectType === 'note') movePlacement(placementId, date);
      return;
    }

    const raw = e.dataTransfer.getData('text/arc-unplaced');
    if (!raw) return;
    try {
      const item = JSON.parse(raw) as { type?: string; id?: string };
      if (item.type === 'note' && item.id) placeNoteOnCalendar(item.id, date);
    } catch {
      // Ignore malformed external drag data.
    }
  }

  return (
    <section
      className={styles.lane}
      data-kind={kind}
      data-today={today}
      data-dragover={dragOver}
      aria-label={`Planning notes for ${date}${label ? `, ${label}` : ''}`}
      onClick={(e) => {
        if (e.target === e.currentTarget) setAnchorDate(date);
      }}
      onDragOver={(e) => {
        const hasSupportedPayload =
          Array.from(e.dataTransfer.types).includes('text/arc-taskbar-note') ||
          Array.from(e.dataTransfer.types).includes('text/arc-placement-id') ||
          Array.from(e.dataTransfer.types).includes('text/arc-unplaced');
        if (!hasSupportedPayload) return;
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {label && <div className={styles.stateLabel}>{label}</div>}
      <div className={styles.items}>
        {calendarNotes.map((note) => (
          <button
            key={note.placementId}
            type="button"
            className={styles.note}
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('text/arc-placement-id', note.placementId);
              e.dataTransfer.effectAllowed = 'move';
            }}
            onClick={() => select({ objectType: 'note', objectId: note.objectId })}
          >
            {note.title}
          </button>
        ))}
        {datedTasks.map((task) => (
          <button
            key={task.id}
            type="button"
            className={styles.task}
            data-crossed={task.crossedOut}
            onClick={() => select({ objectType: 'note', objectId: task.id })}
          >
            <span aria-hidden="true">□</span> {task.title}
          </button>
        ))}
      </div>
      <form
        className={styles.quickAdd}
        onSubmit={(e) => {
          e.preventDefault();
          submit();
        }}
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className={styles.input}
          aria-label={`Quick note for ${date}`}
          placeholder="note…"
        />
      </form>
    </section>
  );
}
