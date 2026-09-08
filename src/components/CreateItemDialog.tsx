import { useState } from 'react';
import { formatFriendly } from '../calendar/dates';
import { addSchoolDays } from '../calendar/dates';
import type { PaletteToken, TaskColumn } from '../domain/types';
import { getSectionsForCourse } from '../projections/selectors';
import { useWorkspaceStore } from '../state/store';
import formStyles from './Form.module.css';
import { Modal } from './Modal';

type ItemType = 'lesson' | 'note' | 'unit';

const COLOR_OPTIONS: PaletteToken[] = [
  'mustard',
  'terracotta',
  'blue',
  'sage',
  'pink',
  'lavender',
  'kraft',
  'charcoal',
];

export function CreateItemDialog({ date, onClose }: { date: string; onClose: () => void }) {
  const domain = useWorkspaceStore((s) => s.domain);
  const createLesson = useWorkspaceStore((s) => s.createLesson);
  const createNote = useWorkspaceStore((s) => s.createNote);
  const createUnit = useWorkspaceStore((s) => s.createUnit);

  const courses = Object.values(domain.courses);
  const [type, setType] = useState<ItemType>('lesson');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [courseId, setCourseId] = useState(courses[0]?.id ?? '');
  const [sectionId, setSectionId] = useState('');
  const [endDate, setEndDate] = useState(() => addSchoolDays(domain.calendar, date, 9));
  const [colorToken, setColorToken] = useState<PaletteToken>('blue');
  const [noteDestination, setNoteDestination] = useState<'calendar' | 'fridge' | 'taskbar'>('calendar');
  const [taskColumn, setTaskColumn] = useState<TaskColumn>('must');
  const [error, setError] = useState<string | null>(null);

  const sections = getSectionsForCourse(domain, courseId);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!title.trim()) {
      setError('Give it a title first.');
      return;
    }
    let result;
    if (type === 'lesson') {
      if (!courseId) {
        setError('Create a course in Settings first.');
        return;
      }
      result = createLesson({
        courseId,
        sectionId: sectionId || undefined,
        title: title.trim(),
        body: body.trim() || undefined,
        date,
      });
    } else if (type === 'unit') {
      if (!courseId) {
        setError('Create a course in Settings first.');
        return;
      }
      result = createUnit({
        courseId,
        title: title.trim(),
        colorToken,
        startDate: date,
        endDate,
      });
    } else {
      result = createNote({
        title: title.trim(),
        body: body.trim() || undefined,
        location: noteDestination,
        taskColumn: noteDestination === 'taskbar' ? taskColumn : undefined,
        date: noteDestination === 'calendar' ? date : undefined,
      });
    }
    if (result.ok) onClose();
    else setError(result.error ?? 'Could not create that.');
  }

  return (
    <Modal title={`Add to ${formatFriendly(date)}`} onClose={onClose}>
      <div className={formStyles.typeTabs} role="tablist" aria-label="Item type">
        {(['lesson', 'note', 'unit'] as ItemType[]).map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-pressed={type === t}
            className={formStyles.typeTab}
            onClick={() => setType(t)}
          >
            {t === 'lesson' ? 'Lesson' : t === 'note' ? 'Note' : 'Unit'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <div className={formStyles.field}>
          <label htmlFor="ci-title">Title</label>
          <input id="ci-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
        </div>

        {type !== 'unit' && (
          <div className={formStyles.field}>
            <label htmlFor="ci-body">Notes (optional)</label>
            <textarea id="ci-body" value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
        )}

        {(type === 'lesson' || type === 'unit') && (
          <div className={formStyles.row}>
            <div className={formStyles.field}>
              <label htmlFor="ci-course">Course</label>
              <select
                id="ci-course"
                value={courseId}
                onChange={(e) => {
                  setCourseId(e.target.value);
                  setSectionId('');
                }}
              >
                <option value="">Select a course{'\u2026'}</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            {type === 'lesson' && (
              <div className={formStyles.field}>
                <label htmlFor="ci-section">Section (optional)</label>
                <select id="ci-section" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                  <option value="">Shared \u2014 all sections</option>
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        {type === 'unit' && (
          <>
            <div className={formStyles.field}>
              <label htmlFor="ci-end">Ends on</label>
              <input id="ci-end" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            </div>
            <div className={formStyles.field}>
              <label>Color</label>
              <div className={formStyles.colorSwatchRow}>
                {COLOR_OPTIONS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className={`arc-token-${c} ${formStyles.colorSwatch}`}
                    aria-pressed={colorToken === c}
                    aria-label={c}
                    onClick={() => setColorToken(c)}
                  />
                ))}
              </div>
            </div>
          </>
        )}

        {type === 'note' && (
          <div className={formStyles.field}>
            <label htmlFor="ci-dest">Place it in</label>
            <select
              id="ci-dest"
              value={noteDestination}
              onChange={(e) => setNoteDestination(e.target.value as typeof noteDestination)}
            >
              <option value="calendar">This day on the calendar</option>
              <option value="fridge">The Fridge</option>
              <option value="taskbar">The Task Bar</option>
            </select>
          </div>
        )}
        {type === 'note' && noteDestination === 'taskbar' && (
          <div className={formStyles.field}>
            <label htmlFor="ci-col">Column</label>
            <select id="ci-col" value={taskColumn} onChange={(e) => setTaskColumn(e.target.value as TaskColumn)}>
              <option value="must">Must</option>
              <option value="should">Should</option>
              <option value="could">Could</option>
            </select>
          </div>
        )}

        {error && <p className={formStyles.errorText}>{error}</p>}

        <div className={formStyles.actions}>
          <button type="button" className={formStyles.secondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className={formStyles.primaryButton}>
            Create
          </button>
        </div>
      </form>
    </Modal>
  );
}
