import type { KeyboardEvent } from 'react';
import { ImportantCircle } from '../assets/Icons';
import type { PlacementView } from '../projections/selectors';
import { useWorkspaceStore } from '../state/store';
import styles from './PlacementChip.module.css';

const TYPE_NOUN: Record<PlacementView['objectType'], string> = {
  unit: 'Unit',
  lesson: 'Lesson',
  note: 'Note',
  magnet: 'Magnet',
};

export function PlacementChip({ view, date }: { view: PlacementView; date: string }) {
  const selection = useWorkspaceStore((s) => s.ui.selection);
  const select = useWorkspaceStore((s) => s.select);
  const isSelected = selection?.objectId === view.objectId && selection?.objectType === view.objectType;

  const showOnThisDay =
    view.objectType !== 'unit' || view.isRangeStart || date === view.startDate;
  if (!showOnThisDay) return null;

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

  const label = `${TYPE_NOUN[view.objectType]}: ${view.title}${view.important ? ', important' : ''}${
    view.crossedOut ? ', crossed out' : ''
  }`;

  return (
    <button
      type="button"
      className={`${view.colorToken ? `arc-token-${view.colorToken}` : ''} ${styles.chip}`}
      data-type={view.objectType}
      data-selected={isSelected}
      data-crossed={view.crossedOut}
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
          {'\u{1F4CC}'}
        </span>
      )}
    </button>
  );
}
