import { ArcMark } from '../../assets/ArcMark';
import { PaperGrain } from '../../assets/PaperTexture';
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
      <PaperGrain baseColor="transparent" opacity={0.4} className={styles.grain} />
      <header className={styles.header}>
        <div className={styles.brand}>
          <ArcMark size={30} />
          <span className={styles.brandName}>Arc</span>
        </div>
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
