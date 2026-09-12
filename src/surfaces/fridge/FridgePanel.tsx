import { useRef, useState, type CSSProperties, type PointerEvent as ReactPointerEvent } from 'react';
import type { Lesson, Magnet, Note, Unit } from '../../domain/types';
import { getDrawerItems, getFridgeItems, getLessonsForUnit } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import { applyPlannerObjectDrop } from '../drag/applyObjectDrop';
import { plannerDropTarget, writeUnplacedDrag } from '../drag/unplacedPayload';
import { useFridgeDrop } from './useFridgeDrop';
import styles from './FridgePanel.module.css';

const DRAG_THRESHOLD = 8;

function itemKindLabel(item: Note | Magnet | Unit | Lesson) {
  if (item.kind === 'unit') return 'Unit';
  if (item.kind === 'lesson') return 'Lesson';
  return item.kind === 'note' ? 'Note' : 'Magnet';
}

function displayUnitTitle(title: string) {
  return title.replace(/^Unit\s+\d+\s*[·.•\-\u2013]\s*/i, '');
}

function setMoveDrag(e: React.DragEvent, payload: { type: 'note' | 'magnet' | 'unit'; id: string }) {
  writeUnplacedDrag(e, payload);
}

type FridgeDrag =
  | { type: 'unit'; id: string }
  | { type: 'magnet'; id: string }
  | { type: 'note'; id: string }
  | { type: 'lesson'; id: string };

function FridgeInterior() {
  const domain = useWorkspaceStore((s) => s.domain);
  const select = useWorkspaceStore((s) => s.select);
  const editUnit = useWorkspaceStore((s) => s.editUnit);
  const editMagnet = useWorkspaceStore((s) => s.editMagnet);
  const moveNoteToFridge = useWorkspaceStore((s) => s.moveNoteToFridge);
  const moveMagnetToFridge = useWorkspaceStore((s) => s.moveMagnetToFridge);
  const placeUnitOnDate = useWorkspaceStore((s) => s.placeUnitOnDate);
  const placeLessonOnDate = useWorkspaceStore((s) => s.placeLessonOnDate);
  const nestLessonInUnit = useWorkspaceStore((s) => s.nestLessonInUnit);
  const nestLessonOnBlankMagnet = useWorkspaceStore((s) => s.nestLessonOnBlankMagnet);
  const stowUnitOnDesk = useWorkspaceStore((s) => s.stowUnitOnDesk);
  const stowUnitInDrawer = useWorkspaceStore((s) => s.stowUnitInDrawer);
  const stowLessonOnDesk = useWorkspaceStore((s) => s.stowLessonOnDesk);
  const stowLessonInDrawer = useWorkspaceStore((s) => s.stowLessonInDrawer);
  const placeMagnetOnCalendar = useWorkspaceStore((s) => s.placeMagnetOnCalendar);
  const placeNoteOnCalendar = useWorkspaceStore((s) => s.placeNoteOnCalendar);
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
  const [showDrawer, setShowDrawer] = useState(true);
  const [unitDrafts, setUnitDrafts] = useState<Record<string, string>>({});
  const [magnetDrafts, setMagnetDrafts] = useState<Record<string, string>>({});
  const drag = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    moved: boolean;
    payload: FridgeDrag;
  } | null>(null);

  const fridgeItems = getFridgeItems(domain);
  const drawerItems = getDrawerItems(domain);
  const papers = fridgeItems.filter((item): item is Note => item.kind === 'note');
  const doorMagnets = fridgeItems.filter((item): item is Magnet => item.kind === 'magnet');

  function onPointerDown(e: ReactPointerEvent<HTMLElement>, payload: FridgeDrag) {
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
    if (!session.moved && Math.hypot(e.clientX - session.startX, e.clientY - session.startY) < DRAG_THRESHOLD) {
      return;
    }
    if (!session.moved) {
      session.moved = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* optional */
      }
    }
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
    if (!session) return;
    if (!session.moved) {
      if (session.payload.type === 'unit') select({ objectType: 'unit', objectId: session.payload.id });
      if (session.payload.type === 'magnet') select({ objectType: 'magnet', objectId: session.payload.id });
      if (session.payload.type === 'lesson') select({ objectType: 'lesson', objectId: session.payload.id });
      e.currentTarget.querySelector('input')?.focus();
      return;
    }
    const drop = plannerDropTarget(e.clientX, e.clientY, e.currentTarget);
    if (session.payload.type === 'unit' || session.payload.type === 'lesson') {
      applyPlannerObjectDrop({ type: session.payload.type, id: session.payload.id }, drop, dropActions);
      return;
    }
    if (drop.kind !== 'calendar') return;
    if (session.payload.type === 'magnet') placeMagnetOnCalendar(session.payload.id, drop.date);
    else placeNoteOnCalendar(session.payload.id, drop.date);
  }

  return (
    <>
      <section className={styles.block}>
        <h3>On the door</h3>
        <div className={styles.paperRow}>
          {papers.length === 0 && doorMagnets.length === 0 && <p className={styles.empty}>Nothing parked here.</p>}
          {papers.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={styles.scrap}
              data-tilt={index % 2 === 0 ? 'left' : 'right'}
              draggable
              onDragStart={(e) => setMoveDrag(e, { type: 'note', id: item.id })}
              onClick={() => select({ objectType: 'note', objectId: item.id })}
            >
              {item.title}
            </button>
          ))}
          {doorMagnets.map((item) => (
            <div
              key={item.id}
              className={`arc-token-mustard ${styles.magnet}`}
              onPointerDown={(e) => onPointerDown(e, { type: 'magnet', id: item.id })}
              onPointerMove={onPointerMove}
              onPointerUp={finishPointer}
              onPointerCancel={finishPointer}
            >
              <label className={styles.magnetWrite}>
                <span className="arc-visually-hidden">Magnet name</span>
                <input
                  className={styles.magnetTitle}
                  value={magnetDrafts[item.id] ?? item.title}
                  aria-label={`Magnet: ${item.title}`}
                  onChange={(e) => setMagnetDrafts((current) => ({ ...current, [item.id]: e.target.value }))}
                  onFocus={() => select({ objectType: 'magnet', objectId: item.id })}
                  onBlur={() => {
                    const next = magnetDrafts[item.id]?.trim();
                    if (next && next !== item.title) editMagnet(item.id, { title: next });
                    setMagnetDrafts((current) => {
                      const copy = { ...current };
                      delete copy[item.id];
                      return copy;
                    });
                  }}
                />
              </label>
            </div>
          ))}
        </div>
      </section>

      <section className={styles.block}>
        <button
          type="button"
          className={styles.later}
          aria-expanded={showDrawer}
          onClick={() => setShowDrawer((open) => !open)}
        >
          <span>The drawer</span>
          <span className={styles.laterMeta}>
            <strong>
              {drawerItems.length} {drawerItems.length === 1 ? 'item' : 'items'}
            </strong>
          </span>
        </button>
        {showDrawer && (
          <div className={styles.drawerList}>
            {drawerItems.length === 0 && <p className={styles.empty}>The drawer is empty.</p>}
            {drawerItems.map((item) =>
              item.kind === 'unit' ? (
                <div key={item.id} className={styles.drawerUnit} data-arc-unit-id={item.id}>
                  <div
                    className={`arc-token-${item.colorToken} ${styles.drawerMagnet}`}
                    data-arc-unit-id={item.id}
                    onPointerDown={(e) => onPointerDown(e, { type: 'unit', id: item.id })}
                    onPointerMove={onPointerMove}
                    onPointerUp={finishPointer}
                    onPointerCancel={finishPointer}
                  >
                    <span className={styles.kind}>Unit</span>
                    <label className={styles.magnetWrite}>
                      <span className="arc-visually-hidden">Unit name</span>
                      <input
                        value={unitDrafts[item.id] ?? displayUnitTitle(item.title)}
                        aria-label={`Unit magnet: ${item.title}`}
                        onChange={(e) => setUnitDrafts((current) => ({ ...current, [item.id]: e.target.value }))}
                        onFocus={() => select({ objectType: 'unit', objectId: item.id })}
                        onBlur={() => {
                          const next = unitDrafts[item.id]?.trim();
                          if (next && next !== displayUnitTitle(item.title)) editUnit(item.id, { title: next });
                          setUnitDrafts((current) => {
                            const copy = { ...current };
                            delete copy[item.id];
                            return copy;
                          });
                        }}
                      />
                    </label>
                  </div>
                  {getLessonsForUnit(domain, item.id).map((lesson, index) => (
                    <button
                      key={lesson.id}
                      type="button"
                      className={styles.drawerSlip}
                      style={{ '--n': index } as CSSProperties}
                      onPointerDown={(e) => onPointerDown(e, { type: 'lesson', id: lesson.id })}
                      onPointerMove={onPointerMove}
                      onPointerUp={finishPointer}
                      onPointerCancel={finishPointer}
                    >
                      {lesson.title}
                    </button>
                  ))}
                </div>
              ) : item.kind === 'lesson' ? (
                <button
                  key={item.id}
                  type="button"
                  className={styles.drawerItem}
                  onPointerDown={(e) => onPointerDown(e, { type: 'lesson', id: item.id })}
                  onPointerMove={onPointerMove}
                  onPointerUp={finishPointer}
                  onPointerCancel={finishPointer}
                >
                  <span className={styles.kind}>{itemKindLabel(item)}</span>
                  {item.title}
                </button>
              ) : (
                <button
                  key={item.id}
                  type="button"
                  className={styles.drawerItem}
                  draggable
                  onDragStart={(e) =>
                    setMoveDrag(e, { type: item.kind === 'note' ? 'note' : 'magnet', id: item.id })
                  }
                  onPointerDown={(e) =>
                    onPointerDown(e, {
                      type: item.kind === 'note' ? 'note' : 'magnet',
                      id: item.id,
                    })
                  }
                  onPointerMove={onPointerMove}
                  onPointerUp={finishPointer}
                  onPointerCancel={finishPointer}
                  onClick={() => {
                    if (item.kind === 'note') moveNoteToFridge(item.id);
                    else moveMagnetToFridge(item.id);
                  }}
                >
                  <span className={styles.kind}>{itemKindLabel(item)}</span>
                  {item.title}
                </button>
              ),
            )}
          </div>
        )}
      </section>
    </>
  );
}

export function FridgePanel() {
  const openPanel = useWorkspaceStore((s) => s.ui.openPanel);
  const isOpen = openPanel === 'fridge';
  const openFurniture = useWorkspaceStore((s) => s.openFurniture);
  const drop = useFridgeDrop();

  return (
    <aside
      id="arc-fridge-panel"
      className={styles.panel}
      data-open={isOpen}
      data-drop={drop.over}
      aria-hidden={!isOpen}
      inert={!isOpen}
      aria-label="Fridge"
      onDragOver={drop.onDragOver}
      onDragLeave={drop.onDragLeave}
      onDrop={drop.onDrop}
    >
      <div className={styles.folder}>
        <button type="button" className={styles.closeButton} onClick={() => openFurniture(null)} aria-label="Close fridge">
          {'\u2715'}
        </button>
        <div className={styles.paper}>
          <h2 className={styles.heading}>Later</h2>
          <FridgeInterior key={isOpen ? 'open' : 'shut'} />
        </div>
      </div>
    </aside>
  );
}
