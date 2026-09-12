import { formatFriendly } from '../../calendar/dates';
import { resolveLessonFrame, resolveLessonStructure } from '../../domain/lessonStructure';
import { getSectionLessonsForDate } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import { readTableDeskFacts } from '../../table/tableDeskFacts';
import styles from './ClassOverview.module.css';

export function ClassOverview() {
  const sectionId = useWorkspaceStore((s) => s.ui.overviewSectionId);
  const date = useWorkspaceStore((s) => s.ui.anchorDate);
  const domain = useWorkspaceStore((s) => s.domain);
  const close = useWorkspaceStore((s) => s.closeClassOverview);
  const setSectionDayMark = useWorkspaceStore((s) => s.setSectionDayMark);

  if (!sectionId) return null;
  const section = domain.sections[sectionId];
  if (!section) return null;
  const course = domain.courses[section.courseId];
  const lessons = getSectionLessonsForDate(domain, section.id, date);
  const todayLesson = lessons[0] ? domain.lessons[lessons[0].objectId] : undefined;
  const mark = section.dayMarks?.[date] ?? { complete: false, note: '' };
  const facts = readTableDeskFacts(section.id);
  const structure = resolveLessonStructure(domain, section.courseId, section.id);
  const frame = resolveLessonFrame(domain, section.courseId, section.id);
  const frameLabel = frame === 'ubd' ? 'UbD' : frame === 'marzano' ? 'Marzano' : 'None';
  const recipe =
    structure.length > 0
      ? `${structure.map((part) => part.title).join(' · ')}${frame !== 'none' ? ` · ${frameLabel}` : ''}`
      : frame !== 'none'
        ? frameLabel
        : null;

  return (
    <aside
      className={`${styles.page} arc-token-${course?.colorToken ?? 'charcoal'}`}
      aria-label="Class overview"
    >
      <header className={styles.head}>
        <div className={styles.titleBlock}>
          <h2>{course?.name ?? 'Course'}</h2>
          <p className={styles.sectionName}>{section.name}</p>
        </div>
        <p className={styles.kicker}>{formatFriendly(date, 'EEEE, MMMM d')}</p>
        <button type="button" className={styles.close} onClick={() => close()} aria-label="Close class overview">
          ×
        </button>
      </header>

      <div className={styles.register}>
        <dl className={styles.scan}>
          <div className={styles.scanRow}>
            <dt>Today</dt>
            <dd className={styles.lesson}>{todayLesson?.title ?? 'No lesson placed'}</dd>
          </div>
          {facts && (
            <div className={styles.scanRow}>
              <dt>Roster</dt>
              <dd>
                {facts.rosterCount} {facts.rosterCount === 1 ? 'student' : 'students'}
                {facts.outName ? ` · ${facts.outName} out${facts.outKind ? ` (${facts.outKind})` : ''}` : ''}
              </dd>
            </div>
          )}
          {recipe ? (
            <div className={styles.scanRow}>
              <dt>Plan</dt>
              <dd>{recipe}</dd>
            </div>
          ) : null}
        </dl>

        <div className={styles.marks}>
          <label className={styles.check}>
            <input
              type="checkbox"
              checked={mark.complete}
              onChange={(e) => setSectionDayMark(section.id, date, { complete: e.target.checked, note: mark.note })}
            />
            <span>Practice complete for this period</span>
          </label>
          <label className={styles.note}>
            <span>Note for {section.name}</span>
            <textarea
              value={mark.note}
              rows={2}
              onChange={(e) => setSectionDayMark(section.id, date, { complete: mark.complete, note: e.target.value })}
              placeholder="Behavioral reminder, bathroom note, leftover from the period…"
            />
          </label>
        </div>
      </div>

      <p className={styles.limit}>Class page for this period — not a gradebook.</p>
    </aside>
  );
}
