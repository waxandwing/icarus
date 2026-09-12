import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import type { PaletteToken } from '../../domain/types';
import { getDeskLessons, getDeskNotes, getDeskUnits, getLessonsForUnit } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import { applyPlannerObjectDrop } from '../drag/applyObjectDrop';
import { plannerDropTarget } from '../drag/unplacedPayload';
import styles from './DeskField.module.css';

const BLANK_MAGNETS: { colorToken: PaletteToken; label: string }[] = [
  { colorToken: 'blue', label: 'Blue unit magnet' },
  { colorToken: 'terracotta', label: 'Terracotta unit magnet' },
  { colorToken: 'sage', label: 'Sage unit magnet' },
];

const SLIDE_THRESHOLD = 8;

type MagnetDrag =
  | { type: 'unit-blank'; colorToken: PaletteToken; title?: string }
  | { type: 'unit'; id: string; colorToken: PaletteToken; title: string }
  | { type: 'lesson'; id: string; title: string };

function displayUnitTitle(title: string) {
  return title.replace(/^Unit\s+\d+\s*[·.•\-\u2013]\s*/i, '');
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

function clientToDeskPercent(clientX: number, clientY: number, note: HTMLElement) {
  const desk = document.querySelector<HTMLElement>('[data-arc-desk]');
  if (!desk) return { x: 8, y: 30 };
  const rect = desk.getBoundingClientRect();
  const width = Math.max(rect.width, 1);
  const height = Math.max(rect.height, 1);
  const x = ((clientX - rect.left - note.offsetWidth / 2) / width) * 100;
  const y = ((clientY - rect.top - note.offsetHeight / 2) / height) * 100;
  return { x, y };
}

function dropTargetFromPoint(clientX: number, clientY: number, ignore: HTMLElement) {
  return plannerDropTarget(clientX, clientY, ignore);
}

function DeskPostIts() {
  const domain = useWorkspaceStore((s) => s.domain);
  const select = useWorkspaceStore((s) => s.select);
  const slideDeskNote = useWorkspaceStore((s) => s.slideDeskNote);
  const placeNoteOnCalendar = useWorkspaceStore((s) => s.placeNoteOnCalendar);
  const moveNoteToFridge = useWorkspaceStore((s) => s.moveNoteToFridge);
  const notes = getDeskNotes(domain);
  const [live, setLive] = useState<Record<string, { x: number; y: number }>>({});
  const drag = useRef<{
    id: string;
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
  } | null>(null);

  function onPointerDown(e: ReactPointerEvent<HTMLButtonElement>, noteId: string) {
    if (e.button !== 0) return;
    const target = e.currentTarget;
    try {
      target.setPointerCapture(e.pointerId);
    } catch {
      /* capture is optional; slide still tracks via the element listeners */
    }
    drag.current = {
      id: noteId,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
    };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
    const session = drag.current;
    if (!session || session.pointerId !== e.pointerId) return;
    const dx = e.clientX - session.startX;
    const dy = e.clientY - session.startY;
    if (!session.moved && Math.hypot(dx, dy) < SLIDE_THRESHOLD) return;
    session.moved = true;
    const pos = clientToDeskPercent(e.clientX, e.clientY, e.currentTarget);
    setLive((current) => ({ ...current, [session.id]: pos }));
  }

  function onPointerUp(e: ReactPointerEvent<HTMLButtonElement>, noteId: string) {
    const session = drag.current;
    if (session?.pointerId === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }
    const moved = session?.moved ?? false;
    drag.current = null;
    if (!moved) {
      select({ objectType: 'note', objectId: noteId });
      return;
    }
    const drop = dropTargetFromPoint(e.clientX, e.clientY, e.currentTarget);
    setLive((current) => {
      const next = { ...current };
      delete next[noteId];
      return next;
    });
    if (drop.kind === 'calendar') {
      placeNoteOnCalendar(noteId, drop.date);
      return;
    }
    if (drop.kind === 'fridge') {
      moveNoteToFridge(noteId);
      return;
    }
    const pos = clientToDeskPercent(e.clientX, e.clientY, e.currentTarget);
    slideDeskNote(noteId, pos.x, pos.y);
  }

  return (
    <>
      {notes.map((note) => {
        const pos = live[note.id];
        const x = pos?.x ?? note.deskX ?? 8;
        const y = pos?.y ?? note.deskY ?? 30;
        return (
          <button
            key={note.id}
            type="button"
            className={styles.postIt}
            data-sliding={pos ? 'true' : undefined}
            style={{
              left: `${x}%`,
              top: `${y}%`,
              transform: `rotate(${note.deskRotate ?? 0}deg)`,
            }}
            onPointerDown={(e) => onPointerDown(e, note.id)}
            onPointerMove={onPointerMove}
            onPointerUp={(e) => onPointerUp(e, note.id)}
            onPointerCancel={(e) => onPointerUp(e, note.id)}
            onClick={(e) => e.preventDefault()}
          >
            {note.title}
          </button>
        );
      })}
    </>
  );
}

function UnitMagnets() {
  const domain = useWorkspaceStore((s) => s.domain);
  const select = useWorkspaceStore((s) => s.select);
  const editUnit = useWorkspaceStore((s) => s.editUnit);
  const createUnitOnDesk = useWorkspaceStore((s) => s.createUnitOnDesk);
  const createUnitFromMagnet = useWorkspaceStore((s) => s.createUnitFromMagnet);
  const createUnitInDrawer = useWorkspaceStore((s) => s.createUnitInDrawer);
  const placeUnitOnDate = useWorkspaceStore((s) => s.placeUnitOnDate);
  const placeLessonOnDate = useWorkspaceStore((s) => s.placeLessonOnDate);
  const nestLessonInUnit = useWorkspaceStore((s) => s.nestLessonInUnit);
  const nestLessonOnBlankMagnet = useWorkspaceStore((s) => s.nestLessonOnBlankMagnet);
  const stowUnitOnDesk = useWorkspaceStore((s) => s.stowUnitOnDesk);
  const stowUnitInDrawer = useWorkspaceStore((s) => s.stowUnitInDrawer);
  const stowLessonOnDesk = useWorkspaceStore((s) => s.stowLessonOnDesk);
  const stowLessonInDrawer = useWorkspaceStore((s) => s.stowLessonInDrawer);
  const units = getDeskUnits(domain);
  const looseLessons = getDeskLessons(domain);
  const dropActions = {
    placeUnitOnDate,
    placeLessonOnDate,
    nestLessonInUnit,
    nestLessonOnBlankMagnet,
    stowUnitOnDesk,
    stowUnitInDrawer,
    stowLessonOnDesk,
    stowLessonInDrawer,
  };
  const [drafts, setDrafts] = useState<Partial<Record<PaletteToken, string>>>({});
  const [unitDrafts, setUnitDrafts] = useState<Record<string, string>>({});
  const [ghost, setGhost] = useState<{ x: number; y: number; colorToken: PaletteToken; title: string } | null>(
    null,
  );
  const skipBlur = useRef(false);
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
    payload: MagnetDrag;
  } | null>(null);

  function onPointerDown(e: ReactPointerEvent<HTMLElement>, payload: MagnetDrag) {
    if (e.button !== 0) return;
    drag.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      moved: false,
      payload,
    };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLElement>) {
    const session = drag.current;
    if (!session || session.pointerId !== e.pointerId) return;
    const dx = e.clientX - session.startX;
    const dy = e.clientY - session.startY;
    if (!session.moved && Math.hypot(dx, dy) < SLIDE_THRESHOLD) return;
    if (!session.moved) {
      session.moved = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* capture is optional */
      }
      if (e.target instanceof HTMLElement) e.target.blur();
    }
    const payload = session.payload;
    const title =
      payload.type === 'unit-blank'
        ? payload.title?.trim() || drafts[payload.colorToken] || 'Unit'
        : payload.title;
    const colorToken = payload.type === 'lesson' ? 'kraft' : payload.colorToken;
    setGhost({
      x: e.clientX,
      y: e.clientY,
      colorToken,
      title,
    });
  }

  function finishPointer(e: ReactPointerEvent<HTMLElement>) {
    const session = drag.current;
    if (session?.pointerId === e.pointerId) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        /* already released */
      }
    }
    drag.current = null;
    setGhost(null);
    if (!session) return;
    if (!session.moved) {
      if (session.payload.type === 'unit') {
        select({ objectType: 'unit', objectId: session.payload.id });
      }
      if (session.payload.type === 'lesson') {
        select({ objectType: 'lesson', objectId: session.payload.id });
      }
      const input = e.currentTarget.querySelector('input');
      input?.focus();
      input?.select();
      return;
    }
    skipBlur.current = true;
    const drop = plannerDropTarget(e.clientX, e.clientY, e.currentTarget);
    const title =
      session.payload.type === 'unit-blank'
        ? drafts[session.payload.colorToken]?.trim() || undefined
        : undefined;
    if (session.payload.type === 'unit' || session.payload.type === 'lesson') {
      applyPlannerObjectDrop({ type: session.payload.type, id: session.payload.id }, drop, dropActions);
    } else if (drop.kind === 'calendar') {
      createUnitFromMagnet(session.payload.colorToken, drop.date, title);
    } else if (drop.kind === 'fridge') {
      createUnitInDrawer(session.payload.colorToken, title);
    } else if (title) {
      createUnitOnDesk(session.payload.colorToken, title);
    }
    if (session.payload.type === 'unit-blank' && title) {
      const token = session.payload.colorToken;
      setDrafts((current) => ({ ...current, [token]: '' }));
    }
  }

  function commitBlank(colorToken: PaletteToken) {
    if (skipBlur.current) {
      skipBlur.current = false;
      return;
    }
    const title = drafts[colorToken]?.trim();
    if (!title) return;
    createUnitOnDesk(colorToken, title);
    setDrafts((current) => ({ ...current, [colorToken]: '' }));
  }

  return (
    <div className={styles.magnetWell} data-arc-magnet-well>
      <div className={styles.blankRow}>
        {BLANK_MAGNETS.map((magnet) => (
          <div
            key={magnet.colorToken}
            className={`arc-token-${magnet.colorToken} ${styles.brandMagnet} ${styles.blankMagnet}`}
            aria-label={magnet.label}
            data-arc-magnet="blank"
            data-token={magnet.colorToken}
            onPointerDown={(e) =>
              onPointerDown(e, {
                type: 'unit-blank',
                colorToken: magnet.colorToken,
                title: drafts[magnet.colorToken],
              })
            }
            onPointerMove={onPointerMove}
            onPointerUp={finishPointer}
            onPointerCancel={finishPointer}
          >
            <label className={styles.magnetWrite}>
              <span className="arc-visually-hidden">{magnet.label}</span>
              <input
                value={drafts[magnet.colorToken] ?? ''}
                placeholder="Unit"
                aria-label={`Name ${magnet.label}`}
                onChange={(e) =>
                  setDrafts((current) => ({ ...current, [magnet.colorToken]: e.target.value }))
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    commitBlank(magnet.colorToken);
                  }
                }}
                onBlur={() => commitBlank(magnet.colorToken)}
              />
            </label>
          </div>
        ))}
      </div>
      {units.map((unit) => {
        const lessons = getLessonsForUnit(domain, unit.id);
        return (
          <div key={unit.id} className={styles.unitCluster} data-arc-unit-id={unit.id}>
            <div
              className={`arc-token-${unit.colorToken} ${styles.brandMagnet}`}
              aria-label={`Unit magnet: ${unit.title}`}
              data-arc-magnet="unit"
              data-arc-unit-id={unit.id}
              onPointerDown={(e) =>
                onPointerDown(e, {
                  type: 'unit',
                  id: unit.id,
                  colorToken: unit.colorToken,
                  title: unit.title,
                })
              }
              onPointerMove={onPointerMove}
              onPointerUp={finishPointer}
              onPointerCancel={finishPointer}
            >
              <label className={styles.magnetWrite}>
                <span className="arc-visually-hidden">Unit name</span>
                <input
                  value={unitDrafts[unit.id] ?? displayUnitTitle(unit.title)}
                  aria-label={`Unit magnet: ${unit.title}`}
                  onChange={(e) => setUnitDrafts((current) => ({ ...current, [unit.id]: e.target.value }))}
                  onFocus={() => select({ objectType: 'unit', objectId: unit.id })}
                  onBlur={() => {
                    const next = unitDrafts[unit.id];
                    if (next == null) return;
                    const trimmed = next.trim();
                    if (trimmed && trimmed !== displayUnitTitle(unit.title)) {
                      editUnit(unit.id, { title: trimmed });
                    }
                    setUnitDrafts((current) => {
                      const copy = { ...current };
                      delete copy[unit.id];
                      return copy;
                    });
                  }}
                />
              </label>
            </div>
            {lessons.length > 0 && (
              <div className={styles.lessonHang}>
                {lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    type="button"
                    className={styles.lessonSlip}
                    style={{ '--n': index } as CSSProperties}
                    onPointerDown={(e) =>
                      onPointerDown(e, { type: 'lesson', id: lesson.id, title: lesson.title })
                    }
                    onPointerMove={onPointerMove}
                    onPointerUp={finishPointer}
                    onPointerCancel={finishPointer}
                  >
                    {lesson.title}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      })}
      {looseLessons.map((lesson, index) => (
        <button
          key={lesson.id}
          type="button"
          className={styles.lessonSlip}
          style={{ '--n': index } as CSSProperties}
          data-arc-lesson={lesson.id}
          onPointerDown={(e) => onPointerDown(e, { type: 'lesson', id: lesson.id, title: lesson.title })}
          onPointerMove={onPointerMove}
          onPointerUp={finishPointer}
          onPointerCancel={finishPointer}
        >
          {lesson.title}
        </button>
      ))}
      {ghost && (
        <div
          className={`arc-token-${ghost.colorToken} ${styles.brandMagnet} ${styles.magnetGhost}`}
          style={{ left: ghost.x, top: ghost.y }}
          aria-hidden="true"
        >
          <span className={styles.magnetTitle}>{displayUnitTitle(ghost.title)}</span>
        </div>
      )}
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
