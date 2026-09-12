import { useState } from 'react';
import { dayKind, dayLabel, isToday } from '../../calendar/dates';
import { AddMark } from '../../assets/Icons';
import { PlacementChip } from '../../components/PlacementChip';
import { getPlacementsForDate, nestLessonsInUnits, preferCoveringUnits } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import { applyCalendarDrop } from './calendarDrop';
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
  const placeNoteOnCalendar = useWorkspaceStore((s) => s.placeNoteOnCalendar);
  const placeUnitOnDate = useWorkspaceStore((s) => s.placeUnitOnDate);
  const createUnitFromMagnet = useWorkspaceStore((s) => s.createUnitFromMagnet);
  const placeMagnetOnCalendar = useWorkspaceStore((s) => s.placeMagnetOnCalendar);
  const placeLessonOnDate = useWorkspaceStore((s) => s.placeLessonOnDate);
  const [dragOver, setDragOver] = useState(false);

  const kind = dayKind(domain.calendar, date);
  const label = dayLabel(domain.calendar, date);
  const today = isToday(date);
  const placements = getPlacementsForDate(domain, date);
  const units = preferCoveringUnits(
    placements.filter((p) => p.objectType === 'unit'),
    date,
  );
  const lessons = placements.filter((p) => p.objectType === 'lesson');
  const scraps = placements.filter((p) => p.objectType === 'note' || p.objectType === 'magnet');
  const { groups, loose } = nestLessonsInUnits(units, lessons);
  const dayNumber = Number(date.slice(-2));

  return (
    <div
      ref={cellRef}
      className={styles.cell}
      data-kind={kind}
      data-today={today}
      data-date={date}
      data-dimmed={dimmed}
      data-compact={compact}
      data-dragover={dragOver}
      role="gridcell"
      aria-label={`${date}${today ? ', today' : ''}${label ? `, ${label}` : ''}`}
      tabIndex={tabIndex}
      onFocus={() => onFocusDate?.(date)}
      onDragOver={(e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        setDragOver(false);
        applyCalendarDrop(e, date, {
          movePlacement,
          placeNoteOnCalendar,
          placeUnitOnDate,
          createUnitFromMagnet,
          placeMagnetOnCalendar,
          placeLessonOnDate,
        });
      }}
    >
      <div className={styles.dateRow}>
        <span className={styles.dateNumber}>{dayNumber}</span>
        <button
          type="button"
          className={styles.addButton}
          aria-label={`Add to ${date}`}
          onClick={() => onCreate(date)}
        >
          <AddMark size={compact ? 14 : 18} />
        </button>
      </div>
      {label && <span className={styles.dayKindLabel}>{label}</span>}
      <div className={styles.unitTrack}>
        {groups.map(({ unit, lessons: kids }) => (
          <div key={unit.placementId} className={styles.unitNest}>
            <PlacementChip view={unit} date={date} density="compact" />
            {kids.map((lesson) => (
              <PlacementChip key={lesson.placementId} view={lesson} date={date} density={compact ? 'compact' : 'slip'} />
            ))}
          </div>
        ))}
      </div>
      <div className={styles.chips}>
        {loose.map((p) => (
          <PlacementChip key={p.placementId} view={p} date={date} density={compact ? 'compact' : 'slip'} />
        ))}
        {scraps.map((p) => (
          <PlacementChip key={p.placementId} view={p} date={date} density={compact ? 'compact' : 'slip'} />
        ))}
      </div>
    </div>
  );
}
