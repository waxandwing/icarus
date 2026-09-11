import type { KeyboardEvent } from 'react';
import { FixedMark, ImportantCircle } from '../assets/Icons';
import type { PlacementView } from '../projections/selectors';
import { useWorkspaceStore } from '../state/store';
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

function useObjectSelect(view: PlacementView) {
  const selection = useWorkspaceStore((s) => s.ui.selection);
  const select = useWorkspaceStore((s) => s.select);
  const isSelected = selection?.objectId === view.objectId && selection?.objectType === view.objectType;

  function handleClick() {
    select(isSelected ? null : { objectType: view.objectType, objectId: view.objectId });
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>) {
    if (e.key === 'Escape') select(null);
  }

  function handleDragStart(e: React.DragEvent) {
    e.dataTransfer.setData('text/arc-placement-id', view.placementId);
    e.dataTransfer.effectAllowed = 'move';
  }

  return { isSelected, handleClick, handleKeyDown, handleDragStart };
}

function displayUnitTitle(title: string) {
  return title.replace(/^Unit\s+\d+\s*[·.•\-–]\s*/i, '');
}

export function UnitBar({
  view,
  continueLeft,
  continueRight,
  showTitle = true,
  lessonCount,
  density = 'spread',
}: {
  view: PlacementView;
  continueLeft?: boolean;
  continueRight?: boolean;
  showTitle?: boolean;
  lessonCount?: number;
  density?: 'spread' | 'compact';
}) {
  const { isSelected, handleClick, handleKeyDown, handleDragStart } = useObjectSelect(view);
  const title = displayUnitTitle(view.title);

  return (
    <button
      type="button"
      className={`arc-token-${view.colorToken} ${styles.unitBar}`}
      data-selected={isSelected}
      data-continue-left={Boolean(continueLeft)}
      data-continue-right={Boolean(continueRight)}
      data-density={density}
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
      aria-label={objectLabel(view)}
      title={view.title}
    >
      {showTitle && <span className={styles.unitKicker}>Unit</span>}
      {showTitle ? <span className={styles.unitTitle}>{title}</span> : <span className={styles.unitTitle}>&nbsp;</span>}
      {showTitle && lessonCount != null && lessonCount > 0 && (
        <span className={styles.unitCount}>
          {'\u203A'} {lessonCount} {lessonCount === 1 ? 'lesson' : 'lessons'}
        </span>
      )}
      {view.important && <ImportantCircle size={16} />}
      {view.fixed && (
        <span className={styles.fixedBadge} title="Fixed date">
          <FixedMark />
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
  const { isSelected, handleClick, handleKeyDown, handleDragStart } = useObjectSelect(view);

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
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      aria-pressed={isSelected}
      aria-label={label}
      title={view.title}
    >
      {view.deliveryState && view.deliveryState !== 'not-started' && (
        <span className={styles.deliveryDot} data-state={view.deliveryState} />
      )}
      <span className={styles.title}>{view.title}</span>
      {view.important && (
        <span className={styles.importantBadge}>
          <ImportantCircle size={16} />
        </span>
      )}
      {view.fixed && (
        <span className={styles.fixedBadge} title="Fixed date" aria-label="Fixed date">
          <FixedMark />
        </span>
      )}
    </button>
  );
}
