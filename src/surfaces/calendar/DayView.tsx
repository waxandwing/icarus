import { useState } from 'react';
import { dayKind, dayLabel, formatFriendly } from '../../calendar/dates';
import { PlacementChip } from '../../components/PlacementChip';
import {
  deliveryForSection,
  getCourseUnitsIntersecting,
  getLoosePlacementsForDate,
  getNextUp,
  getOrderedSections,
  getSectionLessonsForDate,
  nestLessonsInUnits,
} from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import type { ViewProps } from './CalendarShell';
import styles from './DayView.module.css';

export function DayView({ onCreate }: ViewProps) {
  const anchor = useWorkspaceStore((s) => s.ui.anchorDate);
  const domain = useWorkspaceStore((s) => s.domain);
  const openLiveClassroom = useWorkspaceStore((s) => s.openLiveClassroom);
  const openShiftDialog = useWorkspaceStore((s) => s.openShiftDialog);
  const createNote = useWorkspaceStore((s) => s.createNote);
  const select = useWorkspaceStore((s) => s.select);
  const [teacherDraft, setTeacherDraft] = useState('');

  const kind = dayKind(domain.calendar, anchor);
  const label = dayLabel(domain.calendar, anchor);
  const sections = getOrderedSections(domain);
  const notes = getLoosePlacementsForDate(domain, anchor);
  const instructional = kind === 'instructional' || kind === 'early-release';
  const nextUp = getNextUp(domain, anchor);

  return (
    <div className={styles.layout}>
      <div className={styles.classes}>
        {kind !== 'instructional' && (
          <div className={styles.dayKindBanner}>
            {kind === 'weekend' && 'Weekend — no scheduled instruction.'}
            {kind === 'no-school' && `No school${label ? `: ${label}` : ''}.`}
            {kind === 'early-release' && `Early release${label ? `: ${label}` : ''}.`}
          </div>
        )}

        {sections.length === 0 && (
          <p className={styles.empty}>Add a course in Settings, then place a lesson on this day.</p>
        )}

        {sections.map((section) => {
          const course = domain.courses[section.courseId];
          const units = getCourseUnitsIntersecting(domain, section.courseId, anchor, anchor);
          const lessons = getSectionLessonsForDate(domain, section.id, anchor);
          const { groups, loose } = nestLessonsInUnits(units, lessons);
          const inProgress = lessons.filter(
            (l) => deliveryForSection(domain, section.id, l.objectId) === 'in-progress',
          );
          const headline = inProgress[0] ?? lessons[0] ?? groups[0]?.unit;

          return (
            <article
              key={section.id}
              className={`arc-token-${course?.colorToken ?? 'charcoal'} ${styles.classCard}`}
            >
              <header className={styles.classHead}>
                <h3>{course?.name ?? 'Course'}</h3>
                <p>{section.name}</p>
              </header>

              {headline &&
                (headline.objectType === 'lesson' ? (
                  <button
                    type="button"
                    className={styles.headline}
                    onClick={() => select({ objectType: 'lesson', objectId: headline.objectId })}
                  >
                    {headline.title}
                  </button>
                ) : (
                  <p className={styles.headline}>{headline.title.replace(/^Unit\s+\d+\s*[·.•\-–]\s*/i, '')}</p>
                ))}

              {inProgress.length > 0 && (
                <p className={styles.hold}>Holding your place in {inProgress[0].title}.</p>
              )}

              {groups.map(({ unit, lessons: kids }) => (
                <div key={unit.placementId} className={styles.unitNest}>
                  <div className={styles.unitChildren}>
                    {kids.length === 0 ? (
                      <p className={styles.empty}>Nothing placed in this unit today.</p>
                    ) : (
                      kids.map((lesson) => {
                        const delivery =
                          deliveryForSection(domain, section.id, lesson.objectId) ?? lesson.deliveryState;
                        const final = delivery === 'completed' || delivery === 'skipped';
                        const notesLine = domain.lessons[lesson.objectId]?.body;
                        return (
                          <div className={styles.row} key={lesson.placementId}>
                            {notesLine && <p className={styles.lessonNote}>{notesLine}</p>}
                            {instructional &&
                              (final ? (
                                <span className={styles.finalBadge}>
                                  {delivery === 'completed' ? 'Taught' : 'Skipped'}
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  className={styles.textAction}
                                  onClick={() => openLiveClassroom(section.id, lesson.objectId)}
                                >
                                  {delivery === 'in-progress' ? 'Resume class' : 'Start class'}
                                </button>
                              ))}
                            {instructional && (
                              <button
                                type="button"
                                className={styles.textAction}
                                onClick={() => openShiftDialog(section.id, anchor)}
                              >
                                Shift from today
                              </button>
                            )}
                          </div>
                        );
                      })
                    )}
                    <button
                      type="button"
                      className={styles.nestAdd}
                      onClick={() => onCreate(anchor, { unitId: unit.objectId, sectionId: section.id })}
                    >
                      Add a lesson in {unit.title}
                    </button>
                  </div>
                </div>
              ))}

              {loose.map((lesson) => {
                const delivery =
                  deliveryForSection(domain, section.id, lesson.objectId) ?? lesson.deliveryState;
                const final = delivery === 'completed' || delivery === 'skipped';
                return (
                  <div className={styles.row} key={lesson.placementId}>
                    <PlacementChip view={{ ...lesson, deliveryState: delivery }} date={anchor} />
                    {instructional &&
                      (final ? (
                        <span className={styles.finalBadge}>
                          {delivery === 'completed' ? 'Taught' : 'Skipped'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          className={styles.textAction}
                          onClick={() => openLiveClassroom(section.id, lesson.objectId)}
                        >
                          {delivery === 'in-progress' ? 'Resume class' : 'Start class'}
                        </button>
                      ))}
                  </div>
                );
              })}

              {groups.length === 0 && lessons.length === 0 && (
                <p className={styles.empty}>Nothing placed for {section.name}.</p>
              )}
            </article>
          );
        })}

        <button type="button" className={styles.addRow} onClick={() => onCreate(anchor)}>
          + Add to this day
        </button>
      </div>

      <aside className={styles.side}>
        <section className={styles.teacherNotes} aria-label="Teacher notes">
          <h3>Teacher notes</h3>
          {notes.map((n) => (
            <PlacementChip key={n.placementId} view={n} date={anchor} />
          ))}
          <form
            className={styles.noteForm}
            onSubmit={(e) => {
              e.preventDefault();
              if (!teacherDraft.trim()) return;
              createNote({ title: teacherDraft.trim(), location: 'calendar', date: anchor });
              setTeacherDraft('');
            }}
          >
            <label className="arc-visually-hidden" htmlFor="teacher-note">
              Add a teacher note
            </label>
            <textarea
              id="teacher-note"
              value={teacherDraft}
              onChange={(e) => setTeacherDraft(e.target.value)}
              placeholder={'Add a note\u2026'}
            />
            <button type="submit">Save note</button>
          </form>
        </section>

        <section className={styles.nextUp} aria-label="Next up">
          <h3>Next up</h3>
          {nextUp ? (
            <p>
              {nextUp.kind === 'resume'
                ? 'Continue where you left off'
                : formatFriendly(nextUp.date, 'EEEE')}
              {' \u00b7 '}
              {nextUp.title}
            </p>
          ) : (
            <p>Nothing waiting after this day.</p>
          )}
        </section>
      </aside>
    </div>
  );
}
