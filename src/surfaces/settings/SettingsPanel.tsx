import { useState } from 'react';
import type { DayKind, PaletteToken } from '../../domain/types';
import { getSectionsForCourse } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import formStyles from '../../components/Form.module.css';
import styles from './SettingsPanel.module.css';

const COLOR_OPTIONS: PaletteToken[] = ['sage', 'blue', 'terracotta', 'mustard', 'pink', 'lavender', 'kraft'];

type EditableDayKind = Exclude<DayKind, 'weekend'>;

export function SettingsPanel() {
  const isOpen = useWorkspaceStore((s) => s.ui.openPanels.settings);
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
  const [overrideKind, setOverrideKind] = useState<EditableDayKind>('no-school');
  const [overrideLabel, setOverrideLabel] = useState('');

  const { settings } = domain;
  const courses = Object.values(domain.courses);

  return (
    <aside
      id="arc-settings-panel"
      className={styles.panel}
      data-open={isOpen}
      aria-hidden={!isOpen}
      aria-label="Settings"
    >
      <button
        type="button"
        className={styles.closeButton}
        onClick={() => openFurniture('settings', false)}
        aria-label="Close settings"
      >
        {'\u2715'}
      </button>
      <h2 className={styles.heading}>Settings</h2>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Calendar</div>
        <label className={styles.toggleRow}>
          Show weekends
          <input
            type="checkbox"
            checked={settings.showWeekends}
            onChange={(e) => updateSettings({ showWeekends: e.target.checked })}
          />
        </label>
        <p style={{ fontSize: 12, color: 'var(--arc-charcoal)', margin: '4px 0 0' }}>
          Week defaults to Monday–Friday. Turning on weekends shows Sunday through Saturday, Sunday first.
        </p>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Accessibility</div>
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

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Courses &amp; sections</div>
        <div className={styles.list}>
          {courses.map((course) => (
            <div key={course.id}>
              <div className={`arc-token-${course.colorToken} ${styles.listItem}`}>
                <span>{course.name}</span>
              </div>
              <div style={{ marginLeft: 12, marginTop: 4 }}>
                {getSectionsForCourse(domain, course.id).map((section) => (
                  <div key={section.id} className={styles.listItem} style={{ marginBottom: 4 }}>
                    <span>{section.name}</span>
                  </div>
                ))}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const name = newSectionName[course.id]?.trim();
                    if (name) {
                      createSection(course.id, name);
                      setNewSectionName((s) => ({ ...s, [course.id]: '' }));
                    }
                  }}
                  style={{ display: 'flex', gap: 6, marginTop: 4 }}
                >
                  <input
                    type="text"
                    placeholder="Add a section…"
                    value={newSectionName[course.id] ?? ''}
                    onChange={(e) => setNewSectionName((s) => ({ ...s, [course.id]: e.target.value }))}
                    style={{ flex: 1, fontSize: 13, padding: '4px 8px', borderRadius: 6, border: '1px solid var(--arc-line-strong)' }}
                  />
                  <button type="submit" className={formStyles.secondaryButton} style={{ padding: '4px 10px' }}>
                    Add
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (newCourseName.trim()) {
              createCourse(newCourseName.trim(), COLOR_OPTIONS[courses.length % COLOR_OPTIONS.length]);
              setNewCourseName('');
            }
          }}
          style={{ display: 'flex', gap: 6 }}
        >
          <input
            type="text"
            placeholder="New course name…"
            value={newCourseName}
            onChange={(e) => setNewCourseName(e.target.value)}
            style={{ flex: 1, fontSize: 14, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--arc-line-strong)' }}
          />
          <button type="submit" className={formStyles.primaryButton} style={{ padding: '6px 12px' }}>
            Add course
          </button>
        </form>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>Confirmed school calendar</div>
        <p style={{ fontSize: 13, color: 'var(--arc-charcoal)', marginTop: 0 }}>
          Mark a date as no school, early release, testing, special schedule, or instructional.
        </p>
        <form
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
            <select id="override-kind" value={overrideKind} onChange={(e) => setOverrideKind(e.target.value as EditableDayKind)}>
              <option value="no-school">No school</option>
              <option value="early-release">Early release</option>
              <option value="testing">Testing</option>
              <option value="special-schedule">Special schedule</option>
              <option value="instructional">Instructional</option>
            </select>
          </div>
          <div className={formStyles.field}>
            <label htmlFor="override-label">Label (optional)</label>
            <input id="override-label" type="text" value={overrideLabel} onChange={(e) => setOverrideLabel(e.target.value)} />
          </div>
          <button type="submit" className={formStyles.primaryButton}>
            Set day
          </button>
        </form>
      </div>

      <div className={styles.dangerZone}>
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
    </aside>
  );
}
