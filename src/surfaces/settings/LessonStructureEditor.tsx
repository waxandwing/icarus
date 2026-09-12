import type { LessonFrame, LessonPartDefault, LessonPartKind } from '../../domain/types';
import formStyles from '../../components/Form.module.css';
import styles from './SettingsPanel.module.css';

const KINDS: { value: LessonPartKind | ''; label: string }[] = [
  { value: '', label: 'Infer' },
  { value: 'block', label: 'Block' },
  { value: 'demo', label: 'Demo' },
  { value: 'cleanup', label: 'Cleanup' },
];

function nextPart(existing: LessonPartDefault[]): LessonPartDefault {
  if (existing.length === 0) return { title: 'Bell work', minutes: 5, prompt: 'Daily doodle' };
  return { title: 'Studio', minutes: 10, prompt: 'Studio' };
}

export function LessonStructureEditor({
  parts,
  frame,
  onParts,
  onFrame,
  inheritHint,
}: {
  parts: LessonPartDefault[];
  frame: LessonFrame;
  onParts: (next: LessonPartDefault[]) => void;
  onFrame: (next: LessonFrame) => void;
  inheritHint?: string;
}) {
  function patch(index: number, change: Partial<LessonPartDefault>) {
    onParts(parts.map((part, i) => (i === index ? { ...part, ...change } : part)));
  }

  return (
    <div className={styles.structure}>
      <p className={styles.help}>
        Set Bell work, Demo, and the rest once. New lessons and Start my day refill these parts unless that lesson already has headings.
      </p>
      {inheritHint && parts.length === 0 && <p className={styles.help}>{inheritHint}</p>}
      {parts.map((part, index) => (
        <div key={index} className={styles.partRow}>
          <label className={formStyles.field}>
            <span>Part</span>
            <input
              type="text"
              value={part.title}
              onChange={(e) => patch(index, { title: e.target.value })}
              aria-label={`Part ${index + 1} title`}
            />
          </label>
          <label className={formStyles.field}>
            <span>Minutes</span>
            <input
              type="number"
              min={1}
              value={part.minutes}
              onChange={(e) => patch(index, { minutes: Math.max(1, Number(e.target.value) || 1) })}
              aria-label={`${part.title || 'Part'} minutes`}
            />
          </label>
          <label className={formStyles.field}>
            <span>Kind</span>
            <select
              value={part.kind ?? ''}
              onChange={(e) =>
                patch(index, { kind: (e.target.value || undefined) as LessonPartKind | undefined })
              }
              aria-label={`${part.title || 'Part'} kind`}
            >
              {KINDS.map((kind) => (
                <option key={kind.label} value={kind.value}>
                  {kind.label}
                </option>
              ))}
            </select>
          </label>
          <label className={`${formStyles.field} ${styles.partPrompt}`}>
            <span>Default prompt</span>
            <input
              type="text"
              value={part.prompt ?? ''}
              onChange={(e) => patch(index, { prompt: e.target.value })}
              placeholder={part.title || 'Prompt'}
              aria-label={`${part.title || 'Part'} prompt`}
            />
          </label>
          <div className={styles.partMoves}>
            <button type="button" className={styles.writeAction} onClick={() => onParts(move(parts, index, -1))} disabled={index === 0}>
              Up
            </button>
            <button
              type="button"
              className={styles.writeAction}
              onClick={() => onParts(move(parts, index, 1))}
              disabled={index === parts.length - 1}
            >
              Down
            </button>
            <button
              type="button"
              className={styles.writeAction}
              onClick={() => onParts(parts.filter((_, i) => i !== index))}
            >
              Remove
            </button>
          </div>
        </div>
      ))}
      <button type="button" className={styles.writeAction} onClick={() => onParts([...parts, nextPart(parts)])}>
        Add a part
      </button>
      <label className={formStyles.field}>
        <span>Lesson frame</span>
        <select value={frame} onChange={(e) => onFrame(e.target.value as LessonFrame)}>
          <option value="none">None</option>
          <option value="ubd">Understanding by Design</option>
          <option value="marzano">Marzano</option>
        </select>
      </label>
      <p className={styles.help}>Stored for later. Does not change the planner this pass — no UbD or Marzano library yet.</p>
    </div>
  );
}

function move(parts: LessonPartDefault[], index: number, direction: -1 | 1): LessonPartDefault[] {
  const target = index + direction;
  if (target < 0 || target >= parts.length) return parts;
  const next = [...parts];
  const current = next[index];
  const swap = next[target];
  if (!current || !swap) return parts;
  next[index] = swap;
  next[target] = current;
  return next;
}
