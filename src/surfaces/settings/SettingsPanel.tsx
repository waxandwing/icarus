import { useState } from 'react';
import type { PaletteToken } from '../../domain/types';
import { addCalendarDays, formatFriendly, formatYearSpan } from '../../calendar/dates';
import { getSectionsForCourse } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import formStyles from '../../components/Form.module.css';
import styles from './SettingsPanel.module.css';

const COLOR_OPTIONS: PaletteToken[] = ['sage', 'blue', 'terracotta', 'mustard', 'pink', 'lavender', 'kraft'];

function groupedExceptions(days: Record<string, { date: string; kind: string; label?: string }>) {
  const list = Object.values(days).sort((a, b) => a.date.localeCompare(b.date));
  const groups: { start: string; end: string; kind: string; label?: string }[] = [];
  for (const day of list) {
    const prev = groups[groups.length - 1];
    const nextDate = prev ? addCalendarDays(prev.end, 1) : null;
    if (prev && prev.kind === day.kind && prev.label === day.label && nextDate === day.date) {
      prev.end = day.date;
    } else {
      groups.push({ start: day.date, end: day.date, kind: day.kind, label: day.label });
    }
  }
  return groups;
}

function kindLabel(kind: string) {
  if (kind === 'no-school') return 'no school';
  if (kind === 'early-release') return 'early release';
  return 'instructional';
}

export function SettingsPanel() {
  const openPanel = useWorkspaceStore((s) => s.ui.openPanel);
  const isOpen = openPanel === 'settings';
  const domain = useWorkspaceStore((s) => s.domain);
  const openFurniture = useWorkspaceStore((s) => s.openFurniture);
  const updateSettings = useWorkspaceStore((s) => s.updateSettings);
  const createCourse = useWorkspaceStore((s) => s.createCourse);
  const createSection = useWorkspaceStore((s) => s.createSection);
  const setCalendarDay = useWorkspaceStore((s) => s.setCalendarDay);
  const resetWorkspace = useWorkspaceStore((s) => s.resetWorkspace);

  const [newCourseName, setNewCourseName] = useState('');
  const [newSectionName, setNewSectionName] = useState<Record<string, string>>({});
  const [overrideDate, setOverrideDate] = useState('');
  const [overrideKind, setOverrideKind] = useState<'no-school' | 'early-release' | 'instructional'>('no-school');
  const [overrideLabel, setOverrideLabel] = useState('');

  const { settings } = domain;
  const courses = Object.values(domain.courses);
  const exceptions = groupedExceptions(domain.calendar.days);

  return (
    <aside
      id="arc-settings-panel"
      className={styles.panel}
      data-open={isOpen}
      aria-hidden={!isOpen}
      aria-label="Settings"
    >
      <div className={styles.folder}>
        <button type="button" className={styles.closeButton} onClick={() => openFurniture(null)} aria-label="Close settings">
          {'\u2715'}
        </button>
        <div className={styles.paper}>
          <h2 className={styles.heading}>Settings</h2>

          <details className={styles.fold} open>
            <summary>Calendar</summary>
            <div className={styles.nest}>
              <details className={styles.fold}>
                <summary>School year</summary>
                <p className={styles.help}>
                  {formatFriendly(domain.calendar.startDate, 'MMMM d, yyyy')}
                  {' \u2013 '}
                  {formatFriendly(domain.calendar.endDate, 'MMMM d, yyyy')}
                  {' \u00b7 '}
                  {formatYearSpan(domain.calendar.startDate, domain.calendar.endDate)}
                </p>
              </details>

              <details className={styles.fold} open>
                <summary>Week</summary>
                <div className={styles.nest}>
                  <label className={styles.toggleRow}>
                    Show weekends
                    <input
                      type="checkbox"
                      checked={settings.showWeekends}
                      onChange={(e) => updateSettings({ showWeekends: e.target.checked })}
                    />
                  </label>
                  <p className={styles.help}>
                    Week defaults to Monday{'\u2013'}Friday. Turning on weekends shows Sunday through Saturday,
                    Sunday first.
                  </p>
                </div>
              </details>

              <details className={styles.fold}>
                <summary>Confirmed school days</summary>
                <div className={styles.nest}>
                  {exceptions.length === 0 && <p className={styles.help}>No exceptions marked yet.</p>}
                  <ul className={styles.exceptionList}>
                    {exceptions.map((group) => (
                      <li key={`${group.start}-${group.kind}`}>
                        <span className={styles.exceptionName}>{group.label || kindLabel(group.kind)}</span>
                        <span className={styles.exceptionMeta}>
                          {formatFriendly(group.start)}
                          {group.end !== group.start ? ` ${'\u2013'} ${formatFriendly(group.end)}` : ''}
                          {' \u00b7 '}
                          {kindLabel(group.kind)}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <details className={styles.fold}>
                    <summary>Add a confirmed day</summary>
                    <form
                      className={styles.nest}
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (overrideDate) {
                          setCalendarDay(overrideDate, overrideKind, overrideLabel.trim() || undefined);
                          setOverrideLabel('');
                        }
                      }}
                    >
                      <div className={formStyles.field}>
                        <label htmlFor="override-date">Date</label>
                        <input id="override-date" type="date" value={overrideDate} onChange={(e) => setOverrideDate(e.target.value)} />
                      </div>
                      <div className={formStyles.field}>
                        <label htmlFor="override-kind">Type</label>
                        <select
                          id="override-kind"
                          value={overrideKind}
                          onChange={(e) => setOverrideKind(e.target.value as typeof overrideKind)}
                        >
                          <option value="no-school">No school</option>
                          <option value="early-release">Early release</option>
                          <option value="instructional">Instructional</option>
                        </select>
                      </div>
                      <div className={formStyles.field}>
                        <label htmlFor="override-label">Label (optional)</label>
                        <input
                          id="override-label"
                          type="text"
                          value={overrideLabel}
                          onChange={(e) => setOverrideLabel(e.target.value)}
                        />
                      </div>
                      <button type="submit" className={formStyles.primaryButton}>
                        Set day
                      </button>
                    </form>
                  </details>
                </div>
              </details>
            </div>
          </details>

          <details className={styles.fold} open>
            <summary>Courses</summary>
            <div className={styles.nest}>
              {courses.map((course, index) => (
                <details key={course.id} className={styles.fold} open={index === 0}>
                  <summary className={`arc-token-${course.colorToken} ${styles.courseSummary}`}>
                    {course.name}
                  </summary>
                  <div className={`arc-token-${course.colorToken} ${styles.sections}`}>
                    <p className={styles.sectionsLabel}>Sections</p>
                    {getSectionsForCourse(domain, course.id).map((section) => (
                      <div key={section.id} className={styles.leaf}>
                        {section.name}
                      </div>
                    ))}
                    <form
                      className={styles.inlineForm}
                      onSubmit={(e) => {
                        e.preventDefault();
                        const name = newSectionName[course.id]?.trim();
                        if (name) {
                          createSection(course.id, name);
                          setNewSectionName((s) => ({ ...s, [course.id]: '' }));
                        }
                      }}
                    >
                      <input
                        type="text"
                        placeholder={'Add a section\u2026'}
                        value={newSectionName[course.id] ?? ''}
                        onChange={(e) => setNewSectionName((s) => ({ ...s, [course.id]: e.target.value }))}
                        aria-label={`Add a section to ${course.name}`}
                      />
                      <button type="submit" className={formStyles.secondaryButton}>
                        Add
                      </button>
                    </form>
                  </div>
                </details>
              ))}
              <form
                className={styles.inlineForm}
                onSubmit={(e) => {
                  e.preventDefault();
                  if (newCourseName.trim()) {
                    createCourse(newCourseName.trim(), COLOR_OPTIONS[courses.length % COLOR_OPTIONS.length]);
                    setNewCourseName('');
                  }
                }}
              >
                <input
                  type="text"
                  placeholder={'New course name\u2026'}
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
                  aria-label="New course name"
                />
                <button type="submit" className={formStyles.primaryButton}>
                  Add course
                </button>
              </form>
            </div>
          </details>

          <details className={styles.fold}>
            <summary>View options</summary>
            <div className={styles.nest}>
              <label className={styles.toggleRow}>
                High contrast
                <input
                  type="checkbox"
                  checked={settings.highContrast}
                  onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                />
              </label>
              <label className={styles.toggleRow}>
                Reduce motion
                <input
                  type="checkbox"
                  checked={settings.reducedMotion}
                  onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                />
              </label>
            </div>
          </details>

          <details className={styles.fold}>
            <summary>Workspace</summary>
            <div className={styles.nest}>
              <button
                type="button"
                className={formStyles.dangerButton}
                onClick={() => {
                  if (confirm('Reset the entire workspace back to the demo starting point? This cannot be undone.')) {
                    void resetWorkspace();
                  }
                }}
              >
                Reset workspace
              </button>
            </div>
          </details>
        </div>
      </div>
    </aside>
  );
}
