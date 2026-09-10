import { createId } from '../domain/ids';
import type { LessonField } from '../domain/types';
import styles from './LessonFieldsEditor.module.css';

export const LESSON_FIELD_PRESETS = {
  Art: ['Materials', 'Bell Ringer', 'Mini Lesson', 'Studio Time', 'Clean Up'],
  'Direct instruction': ['Objective', 'Bell Ringer', 'Mini Lesson', 'Guided Practice', 'Independent Practice', 'Exit Ticket'],
  Lab: ['Question', 'Materials', 'Procedure', 'Safety', 'Investigation', 'Cleanup', 'Reflection'],
} as const;

function blankField(label = ''): LessonField {
  return {
    id: createId('field'),
    label,
    content: '',
    plannerVisible: true,
    tableVisible: false,
  };
}

export function LessonFieldsEditor({
  fields,
  onChange,
}: {
  fields: LessonField[];
  onChange: (next: LessonField[]) => void;
}) {
  function update(id: string, patch: Partial<LessonField>) {
    onChange(fields.map((field) => (field.id === id ? { ...field, ...patch } : field)));
  }

  function move(index: number, delta: -1 | 1) {
    const nextIndex = index + delta;
    if (nextIndex < 0 || nextIndex >= fields.length) return;
    const next = [...fields];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  }

  function applyPreset(labels: readonly string[]) {
    if (fields.length > 0 && !confirm('Replace the current lesson fields with this preset?')) return;
    onChange(labels.map((label) => blankField(label)));
  }

  return (
    <section className={styles.section} aria-labelledby="lesson-fields-heading">
      <div className={styles.headingRow}>
        <div>
          <h3 id="lesson-fields-heading" className={styles.heading}>Lesson structure</h3>
          <p className={styles.help}>These fields stay on this Lesson. Choose what appears in the planner and what Table can project later.</p>
        </div>
        <button type="button" className={styles.addButton} onClick={() => onChange([...fields, blankField()])}>
          + Add field
        </button>
      </div>

      {fields.length === 0 && (
        <div className={styles.presets} aria-label="Lesson field presets">
          <span className={styles.presetLabel}>Start with</span>
          {Object.entries(LESSON_FIELD_PRESETS).map(([name, labels]) => (
            <button key={name} type="button" className={styles.presetButton} onClick={() => applyPreset(labels)}>
              {name}
            </button>
          ))}
        </div>
      )}

      <div className={styles.list}>
        {fields.map((field, index) => (
          <div key={field.id} className={styles.fieldCard}>
            <div className={styles.fieldTopline}>
              <input
                className={styles.labelInput}
                aria-label={`Field ${index + 1} label`}
                value={field.label}
                placeholder="Field label"
                onChange={(e) => update(field.id, { label: e.target.value })}
              />
              <div className={styles.orderActions} aria-label={`Reorder ${field.label || `field ${index + 1}`}`}>
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label="Move field up">↑</button>
                <button type="button" disabled={index === fields.length - 1} onClick={() => move(index, 1)} aria-label="Move field down">↓</button>
                <button type="button" onClick={() => onChange(fields.filter((item) => item.id !== field.id))} aria-label="Remove field">×</button>
              </div>
            </div>
            <textarea
              className={styles.contentInput}
              aria-label={`${field.label || `Field ${index + 1}`} content`}
              value={field.content}
              placeholder="What needs to happen?"
              onChange={(e) => update(field.id, { content: e.target.value })}
            />
            <div className={styles.visibilityRow}>
              <label>
                <input type="checkbox" checked={field.plannerVisible} onChange={(e) => update(field.id, { plannerVisible: e.target.checked })} />
                Show in planner
              </label>
              <label>
                <input type="checkbox" checked={field.tableVisible} onChange={(e) => update(field.id, { tableVisible: e.target.checked })} />
                Include in Table
              </label>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
