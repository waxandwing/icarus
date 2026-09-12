import { useState } from 'react';
import { formatFriendly } from '../calendar/dates';
import { addSchoolDays } from '../calendar/dates';
import type { PaletteToken, TaskColumn } from '../domain/types';
import { getCourseUnitsIntersecting, getSectionsForCourse, getUnitsForCourse } from '../projections/selectors';
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

export function CreateItemDialog({
  date,
  unitId: nestUnitId,
  sectionId: nestSectionId,
  onClose,
}: {
  date: string;
  unitId?: string;
  sectionId?: string;
  onClose: () => void;
}) {
  const domain = useWorkspaceStore((s) => s.domain);
  const createLesson = useWorkspaceStore((s) => s.createLesson);
  const createNote = useWorkspaceStore((s) => s.createNote);
  const createUnit = useWorkspaceStore((s) => s.createUnit);

  const courses = Object.values(domain.courses);
  const nestUnit = nestUnitId ? domain.units[nestUnitId] : undefined;
  const nestCourseId = nestUnit?.courseId ?? (nestSectionId ? domain.sections[nestSectionId]?.courseId : undefined);
  const [type, setType] = useState<ItemType>('lesson');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [courseId, setCourseId] = useState(nestCourseId ?? courses[0]?.id ?? '');
  const [sectionId, setSectionId] = useState(nestSectionId ?? '');
  const courseUnits = getUnitsForCourse(domain, courseId);
  const covering = getCourseUnitsIntersecting(domain, courseId, date, date)[0]?.objectId;
  const defaultUnit =
    (nestUnitId && courseUnits.some((u) => u.id === nestUnitId) ? nestUnitId : undefined) ?? covering ?? courseUnits[0]?.id ?? '';
  const [unitId, setUnitId] = useState(defaultUnit);
  const [endDate, setEndDate] = useState(() => addSchoolDays(domain.calendar, date, 9));
  const [colorToken, setColorToken] = useState<PaletteToken>('blue');
  const [noteDestination, setNoteDestination] = useState<'calendar' | 'fridge' | 'taskbar'>('calendar');
  const [taskColumn, setTaskColumn] = useState<TaskColumn>('must');
  const [error, setError] = useState<string | null>(null);

  const sections = getSectionsForCourse(domain, courseId);

  function selectCourse(next: string) {
    setCourseId(next);
    setSectionId('');
    const nextUnits = getUnitsForCourse(domain, next);
    const nextCovering = getCourseUnitsIntersecting(domain, next, date, date)[0]?.objectId;
    setUnitId(nextCovering ?? nextUnits[0]?.id ?? '');
  }

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
      if (courseUnits.length > 0 && !unitId) {
        setError('Choose the unit this lesson belongs to.');
        return;
      }
      if (courseUnits.length === 0) {
        setError('Create a unit for this course first, then nest the lesson in it.');
        return;
      }
      result = createLesson({
        courseId,
        unitId,
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
            aria-selected={type === t}
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
            <label htmlFor="ci-body">{type === 'lesson' ? 'Lesson parts (optional)' : 'Notes (optional)'}</label>
            <textarea
              id="ci-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder={
                type === 'lesson'
                  ? 'Optional: ## Warm Up or 1. Demo — each heading becomes a table block.'
                  : undefined
              }
            />
          </div>
        )}

        {(type === 'lesson' || type === 'unit') && (
          <div className={formStyles.field}>
            <label htmlFor="ci-course">Course</label>
            <select
              id="ci-course"
              value={courseId}
              onChange={(e) => {
                selectCourse(e.target.value);
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
        )}
        {type === 'lesson' && (
          <div className={formStyles.nest}>
            <div className={formStyles.field}>
              <label htmlFor="ci-unit">Unit (parent span)</label>
              <select id="ci-unit" value={unitId} onChange={(e) => setUnitId(e.target.value)}>
                {courseUnits.length === 0 && <option value="">Create a unit first</option>}
                {courseUnits.map((unit) => (
                  <option key={unit.id} value={unit.id}>
                    {unit.title}
                  </option>
                ))}
              </select>
            </div>
            <div className={formStyles.field}>
              <label htmlFor="ci-section">Section (optional)</label>
              <select id="ci-section" value={sectionId} onChange={(e) => setSectionId(e.target.value)}>
                <option value="">Shared {'\u2014'} all sections</option>
                {sections.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
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
