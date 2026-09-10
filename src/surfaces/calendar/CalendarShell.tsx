import { ArcMark } from '../../assets/ArcMark';
import { SampleDataBanner } from '../../components/SampleDataBanner';
import { useWorkspaceStore } from '../../state/store';
import { CalendarNav } from './CalendarNav';
import { DayView } from './DayView';
import { MonthView } from './MonthView';
import { ViewSwitcher } from './ViewSwitcher';
import { WeekView } from './WeekView';
import styles from './CalendarShell.module.css';

export interface ViewProps {
  onEdit: (type: string, id: string) => void;
  onCreate: (date: string) => void;
}

export function CalendarShell({ onEdit, onCreate }: ViewProps) {
  const view = useWorkspaceStore((s) => s.ui.view);

  return (
    <section className={styles.shell} aria-label="Calendar">
      <header className={styles.header}>
        <button type="button" className={styles.brand} aria-label="Arc home">
          <ArcMark size={42} />
        </button>
        <CalendarNav />
        <ViewSwitcher />
      </header>
      <SampleDataBanner />
      <div className={styles.body}>
        {view === 'day' && <DayView onEdit={onEdit} onCreate={onCreate} />}
        {view === 'week' && <WeekView onEdit={onEdit} onCreate={onCreate} />}
        {view === 'month' && <MonthView onEdit={onEdit} onCreate={onCreate} />}
      </div>
    </section>
  );
}
