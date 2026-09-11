import { useState, type CSSProperties } from 'react';
import type { PaletteToken } from '../../domain/types';
import { getDeskNotes, getDeskUnits, getLessonsForUnit } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import styles from './DeskField.module.css';

const BLANK_MAGNETS: { colorToken: PaletteToken; label: string }[] = [
  { colorToken: 'blue', label: 'Blue unit magnet' },
  { colorToken: 'terracotta', label: 'Terracotta unit magnet' },
  { colorToken: 'sage', label: 'Sage unit magnet' },
];

function setUnitDrag(e: React.DragEvent, payload: Record<string, string>) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/arc-unplaced', JSON.stringify(payload));
}

function IdeaPad() {
  const createNote = useWorkspaceStore((s) => s.createNote);
  const [text, setText] = useState('');

  function keep() {
    const title = text.trim();
    if (!title) return;
    createNote({ title, location: 'desk' });
    setText('');
  }

  return (
    <form
      className={styles.ideaPad}
      onSubmit={(e) => {
        e.preventDefault();
        keep();
      }}
    >
      <div className={styles.padSheet} data-layer="2" aria-hidden="true" />
      <div className={styles.padSheet} data-layer="1" aria-hidden="true" />
      <label className={styles.topSheet}>
        <span className="arc-visually-hidden">Write an idea</span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={keep}
          placeholder={'Write an idea\u2026'}
        />
      </label>
    </form>
  );
}

function DeskPostIts() {
  const domain = useWorkspaceStore((s) => s.domain);
  const select = useWorkspaceStore((s) => s.select);
  const notes = getDeskNotes(domain);

  return (
    <>
      {notes.map((note) => (
        <button
          key={note.id}
          type="button"
          className={styles.postIt}
          style={{
            left: `${note.deskX ?? 8}%`,
            top: `${note.deskY ?? 30}%`,
            transform: `rotate(${note.deskRotate ?? 0}deg)`,
          }}
          draggable
          onDragStart={(e) => setUnitDrag(e, { type: 'note', id: note.id })}
          onClick={() => select({ objectType: 'note', objectId: note.id })}
        >
          {note.title}
        </button>
      ))}
    </>
  );
}

function UnitMagnets() {
  const domain = useWorkspaceStore((s) => s.domain);
  const select = useWorkspaceStore((s) => s.select);
  const units = getDeskUnits(domain);

  return (
    <div className={styles.magnetWell}>
      <div className={styles.blankRow}>
        {BLANK_MAGNETS.map((magnet) => (
          <button
            key={magnet.colorToken}
            type="button"
            className={`arc-token-${magnet.colorToken} ${styles.brandMagnet} ${styles.blankMagnet}`}
            draggable
            aria-label={magnet.label}
            onDragStart={(e) => setUnitDrag(e, { type: 'unit-blank', colorToken: magnet.colorToken })}
          />
        ))}
      </div>
      {units.map((unit) => {
        const lessons = getLessonsForUnit(domain, unit.id);
        return (
          <div key={unit.id} className={styles.unitCluster}>
            <button
              type="button"
              className={`arc-token-${unit.colorToken} ${styles.brandMagnet}`}
              draggable
              onDragStart={(e) => setUnitDrag(e, { type: 'unit', id: unit.id })}
              onClick={() => select({ objectType: 'unit', objectId: unit.id })}
              aria-label={`Unit magnet: ${unit.title}`}
            >
              <span className={styles.magnetTitle}>{unit.title.replace(/^Unit\s+\d+\s*[·.•\-\u2013]\s*/i, '')}</span>
            </button>
            {lessons.length > 0 && (
              <div className={styles.lessonHang}>
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    type="button"
                    className={styles.lessonSlip}
                    style={{ '--n': index } as CSSProperties}
                    onClick={() => select({ objectType: 'lesson', objectId: lesson.id })}
                  >
                    {lesson.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/** Ideas, unit magnets, and lesson slips live on the desk around the planner. */
export function DeskField() {
  return (
    <>
      <IdeaPad />
      <DeskPostIts />
      <UnitMagnets />
    </>
  );
}
