import { useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { FixedMark, ImportantCircle } from '../assets/Icons';
import type { PlacementView } from '../projections/selectors';
import { useWorkspaceStore } from '../state/store';
import { applyPlannerObjectDrop } from '../surfaces/drag/applyObjectDrop';
import { plannerDropTarget, writeUnplacedDrag } from '../surfaces/drag/unplacedPayload';
import styles from './PlacementChip.module.css';

const TYPE_NOUN: Record<PlacementView['objectType'], string> = {
  unit: 'Unit',
  lesson: 'Lesson',
  note: 'Note',
  magnet: 'Magnet',
};

function objectLabel(view: PlacementView) {
  return `${TYPE_NOUN[view.objectType]}: ${view.title}${view.important ? ', important' : ''}${
    view.crossedOut ? ', crossed out' : ''
  }${view.fixed ? ', fixed date' : ''}`;
}

const DRAG_THRESHOLD = 8;

function useObjectSelect(view: PlacementView) {
  const selection = useWorkspaceStore((s) => s.ui.selection);
  const select = useWorkspaceStore((s) => s.select);
  const openUnitOrg = useWorkspaceStore((s) => s.openUnitOrg);
  const placeUnitOnDate = useWorkspaceStore((s) => s.placeUnitOnDate);
  const placeLessonOnDate = useWorkspaceStore((s) => s.placeLessonOnDate);
  const nestLessonInUnit = useWorkspaceStore((s) => s.nestLessonInUnit);
  const nestLessonOnBlankMagnet = useWorkspaceStore((s) => s.nestLessonOnBlankMagnet);
  const stowUnitOnDesk = useWorkspaceStore((s) => s.stowUnitOnDesk);
  const stowUnitInDrawer = useWorkspaceStore((s) => s.stowUnitInDrawer);
  const stowLessonOnDesk = useWorkspaceStore((s) => s.stowLessonOnDesk);
  const stowLessonInDrawer = useWorkspaceStore((s) => s.stowLessonInDrawer);
  const isSelected = selection?.objectId === view.objectId && selection?.objectType === view.objectType;
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const drag = useRef<{ pointerId: number; startX: number; startY: number; moved: boolean } | null>(null);
  const justDragged = useRef(false);

  function handleClick(e: { detail: number }) {
    if (e.detail > 1) return;
    if (justDragged.current) {
      justDragged.current = false;
      return;
    }
    select(isSelected ? null : { objectType: view.objectType, objectId: view.objectId });
  }

  function handleDoubleClick() {
    if (view.objectType !== 'unit') return;
    openUnitOrg(view.objectId);
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Escape') select(null);
  }

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('text/arc-placement-id', view.placementId);
    e.dataTransfer.effectAllowed = 'move';
    if (view.objectType === 'unit' || view.objectType === 'lesson') {
      writeUnplacedDrag(e, { type: view.objectType, id: view.objectId });
    }
  }

  function onPointerDown(e: ReactPointerEvent<HTMLButtonElement>) {
    if (e.button !== 0) return;
    drag.current = { pointerId: e.pointerId, startX: e.clientX, startY: e.clientY, moved: false };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLButtonElement>) {
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
    setGhost({ x: e.clientX, y: e.clientY });
  }

  function onPointerUp(e: ReactPointerEvent<HTMLButtonElement>) {
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
    if (!session?.moved) return;
    justDragged.current = true;
    if (view.objectType !== 'unit' && view.objectType !== 'lesson') return;
    const target = plannerDropTarget(e.clientX, e.clientY, e.currentTarget);
    applyPlannerObjectDrop({ type: view.objectType, id: view.objectId }, target, {
      placeUnitOnDate,
      placeLessonOnDate,
      nestLessonInUnit,
      nestLessonOnBlankMagnet,
      stowUnitOnDesk,
      stowUnitInDrawer,
      stowLessonOnDesk,
      stowLessonInDrawer,
    });
  }

  return {
    isSelected,
    handleClick,
    handleDoubleClick,
    handleKeyDown,
    handleDragStart,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    ghost,
  };
}

function displayUnitTitle(title: string) {
  return title.replace(/^Unit\s+\d+\s*[·.•\-–]\s*/i, '');
}

export function UnitBar({
  view,
  continueLeft,
  continueRight,
  showTitle = true,
  density = 'spread',
}: {
  view: PlacementView;
  continueLeft?: boolean;
  continueRight?: boolean;
  showTitle?: boolean;
  density?: 'spread' | 'compact';
}) {
  const {
    isSelected,
    handleClick,
    handleDoubleClick,
    handleKeyDown,
    handleDragStart,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    ghost,
  } = useObjectSelect(view);
  const title = displayUnitTitle(view.title);

  return (
    <button
      type="button"
      className={`arc-token-${view.colorToken} ${styles.unitBar}`}
      data-selected={isSelected}
      data-continue-left={Boolean(continueLeft)}
      data-continue-right={Boolean(continueRight)}
      data-density={density}
      data-arc-unit-id={view.objectId}
      draggable
      onDragStart={handleDragStart}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
      aria-label={objectLabel(view)}
      title={view.title}
    >
      <span className={styles.unitCopy}>
        {showTitle && <span className={styles.unitKicker}>Unit</span>}
        {showTitle ? <span className={styles.unitTitle}>{title}</span> : <span className={styles.unitTitle}>&nbsp;</span>}
        {view.important && (
          <span className={styles.importantHalo} aria-hidden="true">
            <ImportantCircle className={styles.importantRing} />
          </span>
        )}
      </span>
      {view.fixed && (
        <span className={styles.fixedBadge} title="Fixed date">
          <FixedMark />
        </span>
      )}
      {ghost && (
        <span className={styles.dragGhost} style={{ left: ghost.x, top: ghost.y }} aria-hidden="true">
          {title}
        </span>
      )}
    </button>
  );
}

export function PlacementChip({
  view,
  date,
  density = 'slip',
}: {
  view: PlacementView;
  date: string;
  density?: 'slip' | 'compact';
}) {
  const {
    isSelected,
    handleClick,
    handleDoubleClick,
    handleKeyDown,
    handleDragStart,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    ghost,
  } = useObjectSelect(view);

  if (view.objectType === 'unit') {
    const showTitle = view.isRangeStart || date === view.startDate;
    return (
      <UnitBar
        view={view}
        showTitle={showTitle}
        continueLeft={!view.isRangeStart}
        continueRight={!view.isRangeEnd}
      />
    );
  }

  const label = objectLabel(view);

  return (
    <button
      type="button"
      className={`${view.colorToken ? `arc-token-${view.colorToken}` : ''} ${styles.slip}`}
      data-type={view.objectType}
      data-selected={isSelected}
      data-crossed={view.crossedOut}
      data-density={density}
      draggable
      onDragStart={handleDragStart}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
      aria-label={label}
      title={view.title}
    >
      {view.deliveryState && view.deliveryState !== 'not-started' && (
        <span className={styles.deliveryDot} data-state={view.deliveryState} />
      )}
      <span className={styles.titleWrap}>
        <span className={styles.title}>{view.title}</span>
        {view.important && (
          <span className={styles.importantHalo} aria-hidden="true">
            <ImportantCircle className={styles.importantRing} />
          </span>
        )}
      </span>
      {view.fixed && (
        <span className={styles.fixedBadge} title="Fixed date" aria-label="Fixed date">
          <FixedMark />
        </span>
      )}
      {ghost && (
        <span className={styles.dragGhost} style={{ left: ghost.x, top: ghost.y }} aria-hidden="true">
          {view.title}
        </span>
      )}
    </button>
  );
}
