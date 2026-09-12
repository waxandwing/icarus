import { useState } from 'react';
import type { TaskColumn } from '../../domain/types';
import { getTaskBarNotes } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import styles from './TaskBarPanel.module.css';

const COLUMNS: { id: TaskColumn; label: string }[] = [
  { id: 'must', label: 'Must do' },
  { id: 'should', label: 'Should do' },
  { id: 'could', label: 'Could do' },
];

function Column({ id, label }: { id: TaskColumn; label: string }) {
  const domain = useWorkspaceStore((s) => s.domain);
  const notes = getTaskBarNotes(domain, id);
  const crossOut = useWorkspaceStore((s) => s.crossOut);
  const select = useWorkspaceStore((s) => s.select);
  const moveNoteToTaskBar = useWorkspaceStore((s) => s.moveNoteToTaskBar);
  const createNote = useWorkspaceStore((s) => s.createNote);
  const [draft, setDraft] = useState('');
  const [dragOver, setDragOver] = useState(false);

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const noteId = e.dataTransfer.getData('text/arc-taskbar-note');
    if (noteId) moveNoteToTaskBar(noteId, id);
  }

  return (
    <div
      className={styles.column}
      data-dragover={dragOver}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      role="group"
      aria-label={label}
    >
      <div className={styles.columnTitle}>{label}</div>
      <div className={styles.taskList}>
        {notes.map((note) => (
          <div
            key={note.id}
            className={styles.task}
            draggable
            onDragStart={(e) => e.dataTransfer.setData('text/arc-taskbar-note', note.id)}
          >
            <input
              type="checkbox"
              checked={note.crossedOut}
              onChange={(e) => crossOut('note', note.id, e.target.checked)}
              aria-label={`Mark "${note.title}" done`}
            />
            <button
              type="button"
              className={styles.taskTitle}
              data-crossed={note.crossedOut}
              onClick={() => select({ objectType: 'note', objectId: note.id })}
            >
              {note.title}
            </button>
          </div>
        ))}
      </div>
      <form
        className={styles.addForm}
        onSubmit={(e) => {
          e.preventDefault();
          if (draft.trim()) {
            createNote({ title: draft.trim(), location: 'taskbar', taskColumn: id });
            setDraft('');
          }
        }}
      >
        <input
          type="text"
          className={styles.addInput}
          placeholder={`Add to ${label.toLowerCase()}\u2026`}
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          aria-label={`Add a note to ${label}`}
        />
        <button type="submit" className={styles.addButton}>
          Add
        </button>
      </form>
    </div>
  );
}

export function TaskBarPanel() {
  const openPanel = useWorkspaceStore((s) => s.ui.openPanel);
  const isOpen = openPanel === 'taskbar';
  const openFurniture = useWorkspaceStore((s) => s.openFurniture);

  return (
    <aside
      id="arc-taskbar-panel"
      className={styles.panel}
      data-open={isOpen}
      data-placement="bottom"
      aria-hidden={!isOpen}
      inert={!isOpen}
      aria-label="Tasks"
    >
      <div className={styles.folder}>
        <button type="button" className={styles.closeButton} onClick={() => openFurniture(null)} aria-label="Close tasks">
          {'\u2715'}
        </button>
        <div className={styles.paper}>
          <h2 className={styles.heading}>Tasks</h2>
          <div className={styles.columns}>
            {COLUMNS.map((c) => (
              <Column key={c.id} id={c.id} label={c.label} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
