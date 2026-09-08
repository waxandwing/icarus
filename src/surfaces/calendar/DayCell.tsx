import { useState } from 'react';
import { dayKind, dayLabel, isToday } from '../../calendar/dates';
import { AddMark } from '../../assets/Icons';
import { PlacementChip } from '../../components/PlacementChip';
import { getContinuingUnits, getPlacementsForDate } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import styles from './DayCell.module.css';

export interface DayCellProps {
  date: string;
  dimmed?: boolean;
  compact?: boolean;
  onEdit: (type: string, id: string) => void;
  onCreate: (date: string) => void;
  cellRef?: (el: HTMLDivElement | null) => void;
  onFocusDate?: (date: string) => void;
  tabIndex?: number;
}

export function DayCell({ date, dimmed, compact, onCreate, cellRef, onFocusDate, tabIndex }: DayCellProps) {
  const domain = useWorkspaceStore((s) => s.domain);
  const movePlacement = useWorkspaceStore((s) => s.movePlacement);
  const placeMagnetOnCalendar = useWorkspaceStore((s) => s.placeMagnetOnCalendar);
  const placeNoteOnCalendar = useWorkspaceStore((s) => s.placeNoteOnCalendar);
  const [dragOver, setDragOver] = useState(false);

  const kind = dayKind(domain.calendar, date);
  const label = dayLabel(domain.calendar, date);
  const today = isToday(date);
  const placements = getPlacementsForDate(domain, date);
  const continuing = getContinuingUnits(domain, date);
  const dayNumber = Number(date.slice(-2));

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const placementId = e.dataTransfer.getData('text/arc-placement-id');
    if (placementId) {
      movePlacement(placementId, date);
      return;
    }
    const unplaced = e.dataTransfer.getData('text/arc-unplaced');
    if (unplaced) {
      try {
        const { type, id } = JSON.parse(unplaced) as { type: string; id: string };
        if (type === 'magnet') placeMagnetOnCalendar(id, date);
        else if (type === 'note') placeNoteOnCalendar(id, date);
      } catch {
        // ignore malformed drag payloads
      }
    }
  }

  return (
    <div
      ref={cellRef}
      className={styles.cell}
      data-kind={kind}
      data-today={today}
      data-dimmed={dimmed}
      style={dimmed ? { opacity: 0.45 } : undefined}
      data-dragover={dragOver}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      role="gridcell"
      aria-label={`${date}${today ? ', today' : ''}${label ? `, ${label}` : ''}`}
      tabIndex={tabIndex}
      onFocus={() => onFocusDate?.(date)}
    >
      <div className={styles.dateRow}>
        <span className={styles.dateNumber}>{dayNumber}</span>
        <button
          type="button"
          className={styles.addButton}
          aria-label={`Add to ${date}`}
          onClick={() => onCreate(date)}
        >
          <AddMark size={compact ? 16 : 18} />
        </button>
      </div>
      {label && <span className={styles.dayKindLabel}>{label}</span>}
      {continuing.map((u) => (
        <span key={u.placementId} className={styles.continuityStrip}>
          {'\u21B3'} continuing {u.title}
        </span>
      ))}
      <div className={styles.chips}>
        {placements.map((p) => (
          <PlacementChip key={p.placementId} view={p} date={date} />
        ))}
      </div>
    </div>
  );
}
