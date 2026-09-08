import { useState } from 'react';
import { formatFriendly } from '../calendar/dates';
import type { PaletteToken } from '../domain/types';
import { useWorkspaceStore } from '../state/store';
import formStyles from './Form.module.css';
import { Modal } from './Modal';

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

export function EditDialog({
  objectType,
  objectId,
  onClose,
}: {
  objectType: string;
  objectId: string;
  onClose: () => void;
}) {
  const domain = useWorkspaceStore((s) => s.domain);
  const editUnit = useWorkspaceStore((s) => s.editUnit);
  const editLesson = useWorkspaceStore((s) => s.editLesson);
  const editNote = useWorkspaceStore((s) => s.editNote);
  const editMagnet = useWorkspaceStore((s) => s.editMagnet);
  const deleteObject = useWorkspaceStore((s) => s.deleteObject);
  const unplace = useWorkspaceStore((s) => s.unplace);
  const setPlacementFixed = useWorkspaceStore((s) => s.setPlacementFixed);

  const unit = objectType === 'unit' ? domain.units[objectId] : undefined;
  const lesson = objectType === 'lesson' ? domain.lessons[objectId] : undefined;
  const note = objectType === 'note' ? domain.notes[objectId] : undefined;
  const magnet = objectType === 'magnet' ? domain.magnets[objectId] : undefined;

  const [title, setTitle] = useState(unit?.title ?? lesson?.title ?? note?.title ?? magnet?.title ?? '');
  const [body, setBody] = useState(lesson?.body ?? note?.body ?? magnet?.body ?? '');
  const [colorToken, setColorToken] = useState<PaletteToken>(unit?.colorToken ?? 'blue');
  const [error, setError] = useState<string | null>(null);

  const placement = Object.values(domain.placements).find(
    (p) => p.objectType === objectType && p.objectId === objectId,
  );

  if (!unit && !lesson && !note && !magnet) return null;

  function handleSave() {
    let result;
    if (unit) result = editUnit(objectId, { title, colorToken });
    else if (lesson) result = editLesson(objectId, { title, body });
    else if (note) result = editNote(objectId, { title, body });
    else if (magnet) result = editMagnet(objectId, { title, body });
    if (result && !result.ok) setError(result.error ?? 'Could not save.');
    else onClose();
  }

  function handleDelete() {
    if (!confirm(`Delete "${title}"? This destroys the object and cannot be undone.`)) return;
    const result = deleteObject(objectType as 'unit' | 'lesson' | 'note' | 'magnet', objectId);
    if (result.ok) onClose();
    else setError(result.error ?? 'Could not delete.');
  }

  function handleUnplace() {
    if (!placement) return;
    const result = unplace(placement.id);
    if (result.ok) onClose();
    else setError(result.error ?? 'Could not unplace.');
  }

  return (
    <Modal title={`Edit ${objectType}`} onClose={onClose}>
      <div className={formStyles.field}>
        <label htmlFor="ed-title">Title</label>
        <input id="ed-title" type="text" value={title} onChange={(e) => setTitle(e.target.value)} autoFocus />
      </div>

      {(lesson || note || magnet) && (
        <div className={formStyles.field}>
          <label htmlFor="ed-body">Notes</label>
          <textarea id="ed-body" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
      )}

      {unit && (
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
      )}

      {placement && (
        <div style={{ fontSize: 13, color: 'var(--arc-charcoal)', marginBottom: 12 }}>
          <p style={{ margin: '0 0 6px' }}>
            Placed on {formatFriendly(placement.date)}
            {placement.endDate ? ` \u2013 ${formatFriendly(placement.endDate)}` : ''}
          </p>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <input
              type="checkbox"
              checked={placement.fixed}
              onChange={(e) => setPlacementFixed(placement.id, e.target.checked)}
            />
            Fixed date \u2014 won&apos;t move during a disruption shift
          </label>
        </div>
      )}

      {error && <p className={formStyles.errorText}>{error}</p>}

      <div className={formStyles.actions} style={{ justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {placement && (
            <button type="button" className={formStyles.secondaryButton} onClick={handleUnplace}>
              Unplace
            </button>
          )}
          <button type="button" className={formStyles.dangerButton} onClick={handleDelete}>
            Delete
          </button>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className={formStyles.secondaryButton} onClick={onClose}>
            Cancel
          </button>
          <button type="button" className={formStyles.primaryButton} onClick={handleSave}>
            Save
          </button>
        </div>
      </div>
    </Modal>
  );
}
