import { PaperGrain } from '../../assets/PaperTexture';
import { ArcMark } from '../../assets/ArcMark';
import { SampleDataBanner } from '../../components/SampleDataBanner';
import { LiveClassroomOverlay } from '../../components/LiveClassroomOverlay';
import { SelectionToolbar } from '../../components/SelectionToolbar';
import {
  formatFriendly,
  formatMonthTitle,
  formatMonthYear,
  formatWeekKicker,
  formatYearSpan,
  getWeekDays,
  schoolWeekNumber,
  schoolYearWindow,
} from '../../calendar/dates';
import { useWorkspaceStore } from '../../state/store';
import type { CalendarViewMode } from '../../state/store';
import { CalendarNav } from './CalendarNav';
import { DayView } from './DayView';
import { MonthView } from './MonthView';
import { ViewSwitcher } from './ViewSwitcher';
import { WeekView } from './WeekView';
import { YearView } from './YearView';
import { Toast } from '../../components/Toast';
import styles from './CalendarShell.module.css';

export interface CreateNest {
  unitId?: string;
  sectionId?: string;
}

export interface ViewProps {
  onEdit: (type: string, id: string) => void;
  onCreate: (date: string, nest?: CreateNest) => void;
}

function headerTitle(view: CalendarViewMode, anchor: string, yearStart: string, yearEnd: string) {
  if (view === 'day') return formatFriendly(anchor, 'EEEE, MMMM d');
  if (view === 'month') return formatMonthYear(anchor);
  if (view === 'year') return formatYearSpan(yearStart, yearEnd);
  return formatMonthTitle(anchor);
}

function viewKicker(
  view: CalendarViewMode,
  anchor: string,
  weekStartsOn: 'monday' | 'sunday',
  showWeekends: boolean,
  schoolStart: string,
) {
  const weekNo = schoolWeekNumber(anchor, schoolStart, weekStartsOn);
  if (view === 'week') {
    const days = getWeekDays(anchor, weekStartsOn, showWeekends);
    return `Week ${weekNo}  \u00b7  ${formatWeekKicker(days)}`;
  }
  if (view === 'day') return `Day \u00b7 Week ${weekNo}`;
  if (view === 'month') return 'Month';
  return 'School year';
}

export function CalendarShell({ onEdit, onCreate }: ViewProps) {
  const view = useWorkspaceStore((s) => s.ui.view);
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const live = useWorkspaceStore((s) => s.ui.liveClassroom);
  const setView = useWorkspaceStore((s) => s.setView);
  const cleanUp = useWorkspaceStore((s) => s.cleanUp);
  const showWeekends = useWorkspaceStore((s) => s.domain.settings.showWeekends);
  const weekStartsOn = useWorkspaceStore((s) => s.domain.settings.weekStartsOn);
  const calendarStart = useWorkspaceStore((s) => s.domain.calendar.startDate);
  const calendarEnd = useWorkspaceStore((s) => s.domain.calendar.endDate);

  const liveOpen = live.open;
  const yearWindow = schoolYearWindow(anchor, calendarStart, calendarEnd);
  const title = liveOpen ? 'Live Classroom' : headerTitle(view, anchor, yearWindow.start, yearWindow.end);

  return (
    <section className={styles.workspace} aria-label="Calendar">
      <div className={styles.cover} id="arc-calendar-shell">
        <div className={styles.pages}>
          <PaperGrain baseColor="transparent" opacity={0.35} className={styles.grain} />
          <div className={`${styles.fold} ${styles.foldHead}`} aria-hidden="true" />
          <div className={`${styles.fold} ${styles.foldFoot}`} aria-hidden="true" />

          <header className={styles.spreadHeader}>
            <button
              type="button"
              className={styles.brand}
              onClick={() => {
                cleanUp();
                setView('week');
              }}
              aria-label="Back to the teaching week"
            >
              <ArcMark size={40} />
              <span className={styles.titles}>
                <span className={styles.monthName}>{title}</span>
                {!liveOpen && (
                  <span className={styles.kicker}>
                    {viewKicker(view, anchor, weekStartsOn, showWeekends, calendarStart)}
                  </span>
                )}
              </span>
            </button>
            {!liveOpen && (
              <div className={styles.headerTools}>
                <ViewSwitcher />
                <CalendarNav />
              </div>
            )}
          </header>

          <SampleDataBanner />

          <div className={styles.page}>
            {liveOpen ? (
              <LiveClassroomOverlay />
            ) : (
              <>
                {view === 'day' && <DayView onEdit={onEdit} onCreate={onCreate} />}
                {view === 'week' && <WeekView onEdit={onEdit} onCreate={onCreate} />}
                {view === 'month' && <MonthView onEdit={onEdit} onCreate={onCreate} />}
                {view === 'year' && <YearView />}
              </>
            )}
          </div>

          {!liveOpen && <SelectionToolbar onEdit={onEdit} />}

          <footer className={styles.spreadFooter}>
            <div className={styles.footerReceipt}>
              <Toast />
            </div>
            <span>Arc {'\u00b7'} teacher planner</span>
          </footer>
        </div>
      </div>
    </section>
  );
}
