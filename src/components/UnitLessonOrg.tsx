import { getLessonsForUnit } from '../projections/selectors';
import { isChosenForTable } from '../table/dayPlan';
import { useWorkspaceStore } from '../state/store';
import styles from './UnitLessonOrg.module.css';

function lessonDate(domain: ReturnType<typeof useWorkspaceStore.getState>['domain'], lessonId: string) {
  return Object.values(domain.placements).find((p) => p.objectType === 'lesson' && p.objectId === lessonId)?.date;
}

/** Nested paper under a Unit: pick which lesson slips go to the table. */
export function UnitLessonOrg({ unitId }: { unitId: string }) {
  const domain = useWorkspaceStore((s) => s.domain);
  const editLesson = useWorkspaceStore((s) => s.editLesson);
  const closeUnitOrg = useWorkspaceStore((s) => s.closeUnitOrg);
  const unit = domain.units[unitId];
  const lessons = getLessonsForUnit(domain, unitId);

  if (!unit) return null;

  return (
    <div className={styles.sheet} role="region" aria-label={`Lesson organization for ${unit.title}`}>
      <div className={styles.head}>
        <p className={styles.kicker}>Lessons in this unit</p>
        <button type="button" className={styles.close} onClick={() => closeUnitOrg()}>
          Close
        </button>
      </div>
      <p className={styles.hint}>Start my day sends today&apos;s lesson for the class you are teaching, split into parts on the table.</p>
      {lessons.length === 0 ? (
        <p className={styles.empty}>No lessons nested here yet.</p>
      ) : (
        <ul className={styles.list}>
          {lessons.map((lesson) => {
            const chosen = isChosenForTable(lesson.visibility);
            const date = lessonDate(domain, lesson.id);
            return (
              <li key={lesson.id}>
                <button
                  type="button"
                  className={styles.slip}
                  aria-pressed={chosen}
                  onClick={() =>
                    editLesson(lesson.id, { visibility: chosen ? 'teacher-private' : 'daily-board' })
                  }
                >
                  <span className={styles.mark} aria-hidden="true">
                    {chosen ? '●' : '○'}
                  </span>
                  <span className={styles.copy}>
                    <span className={styles.title}>{lesson.title}</span>
                    {date && <span className={styles.date}>{date}</span>}
                    {chosen && <span className={styles.state}>On the table</span>}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
