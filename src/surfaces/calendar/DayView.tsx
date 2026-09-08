import { dayKind, dayLabel } from '../../calendar/dates';
import { AddMark } from '../../assets/Icons';
import { PlacementChip } from '../../components/PlacementChip';
import { getContinuingUnits, getPlacementsForDate } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import type { ViewProps } from './CalendarShell';
import styles from './DayView.module.css';

export function DayView({ onCreate }: ViewProps) {
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const domain = useWorkspaceStore((s) => s.domain);
  const openLiveClassroom = useWorkspaceStore((s) => s.openLiveClassroom);
  const openShiftDialog = useWorkspaceStore((s) => s.openShiftDialog);

  const kind = dayKind(domain.calendar, anchor);
  const label = dayLabel(domain.calendar, anchor);
  const continuing = getContinuingUnits(domain, anchor);
  const placements = getPlacementsForDate(domain, anchor).filter(
    (p) => p.objectType !== 'unit' || p.isRangeStart,
  );

  return (
    <div className={styles.wrap}>
      {continuing.length > 0 && (
        <div className={styles.continuity}>
          <h3>Continuing from before</h3>
          <div className={styles.list}>
            {continuing.map((u) => (
              <PlacementChip key={u.placementId} view={u} date={anchor} />
            ))}
          </div>
        </div>
      )}

      {kind !== 'instructional' && (
        <div className={styles.dayKindBanner}>
          {kind === 'weekend' && 'Weekend \u2014 no scheduled instruction.'}
          {kind === 'no-school' && `No school${label ? `: ${label}` : ''}.`}
          {kind === 'early-release' && `Early release${label ? `: ${label}` : ''}.`}
        </div>
      )}

      <div>
        <h3 className="arc-visually-hidden">Today&apos;s plan</h3>
        {placements.length === 0 ? (
          <p className={styles.empty}>Nothing placed on this day yet.</p>
        ) : (
          <div className={styles.list}>
            {placements.map((p) => (
              <div className={styles.row} key={p.placementId}>
                <PlacementChip view={p} date={anchor} />
                {p.objectType === 'lesson' && p.sectionId && (
                  <>
                    {p.deliveryState === 'completed' || p.deliveryState === 'skipped' ? (
                      <span className={styles.finalBadge}>
                        {p.deliveryState === 'completed' ? 'Taught' : 'Skipped'}
                      </span>
                    ) : (
                      <button
                        type="button"
                        className={styles.startClassButton}
                        onClick={() => openLiveClassroom(p.sectionId!, p.objectId)}
                      >
                        {p.deliveryState === 'in-progress' ? 'Resume class' : 'Start class'}
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.startClassButton}
                      style={{ background: 'transparent', color: 'var(--arc-ink)' }}
                      onClick={() => openShiftDialog(p.sectionId!, anchor)}
                    >
                      Shift from here
                    </button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <button type="button" className={styles.addRow} onClick={() => onCreate(anchor)}>
        <AddMark size={18} />
        Add to this day
      </button>
    </div>
  );
}
