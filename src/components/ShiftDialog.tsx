import { useMemo } from 'react';
import { formatShort } from '../calendar/dates';
import { previewShift } from '../domain/commands';
import { useWorkspaceStore } from '../state/store';
import formStyles from './Form.module.css';
import { Modal } from './Modal';

export function ShiftDialog() {
  const shiftDialog = useWorkspaceStore((s) => s.ui.shiftDialog);
  const domain = useWorkspaceStore((s) => s.domain);
  const closeShiftDialog = useWorkspaceStore((s) => s.closeShiftDialog);
  const setShiftDays = useWorkspaceStore((s) => s.setShiftDays);
  const setShiftReason = useWorkspaceStore((s) => s.setShiftReason);
  const applyShift = useWorkspaceStore((s) => s.applyShift);

  const preview = useMemo(() => {
    if (!shiftDialog.open || !shiftDialog.sectionId || !shiftDialog.fromDate) return [];
    return previewShift(domain, {
      sectionId: shiftDialog.sectionId,
      fromDate: shiftDialog.fromDate,
      schoolDays: shiftDialog.schoolDays,
    });
  }, [shiftDialog, domain]);

  if (!shiftDialog.open) return null;

  const sectionName = shiftDialog.sectionId ? domain.sections[shiftDialog.sectionId]?.name : '';

  return (
    <Modal title={`Shift ${sectionName ?? 'section'}`} onClose={closeShiftDialog}>
      <p style={{ fontSize: 14, color: 'var(--arc-charcoal)', marginTop: 0 }}>
        Moves every non-fixed item for this section on or after {shiftDialog.fromDate && formatShort(shiftDialog.fromDate)}{' '}
        by whole school days. Fixed anchors and other sections are untouched.
      </p>

      <div className={formStyles.row}>
        <div className={formStyles.field}>
          <label htmlFor="shift-days">School days to shift</label>
          <input
            id="shift-days"
            type="number"
            value={shiftDialog.schoolDays}
            onChange={(e) => setShiftDays(Number(e.target.value))}
          />
        </div>
        <div className={formStyles.field}>
          <label htmlFor="shift-reason">Reason (optional)</label>
          <input
            id="shift-reason"
            type="text"
            value={shiftDialog.reason}
            onChange={(e) => setShiftReason(e.target.value)}
            placeholder="Assembly, snow day\u2026"
          />
        </div>
      </div>

      <div style={{ maxHeight: 220, overflowY: 'auto', border: '1px solid var(--arc-line)', borderRadius: 8 }}>
        {preview.length === 0 ? (
          <p style={{ padding: 12, margin: 0, fontStyle: 'italic', color: 'var(--arc-charcoal)' }}>
            Nothing to move with these settings.
          </p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <tbody>
              {preview.map((item) => (
                <tr key={item.placementId} style={{ borderBottom: '1px solid var(--arc-line)' }}>
                  <td style={{ padding: '6px 10px' }}>{item.title}</td>
                  <td style={{ padding: '6px 10px', color: 'var(--arc-charcoal)' }}>
                    {formatShort(item.fromDate)} {'\u2192'} {formatShort(item.toDate)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <div className={formStyles.actions}>
        <button type="button" className={formStyles.secondaryButton} onClick={closeShiftDialog}>
          Cancel
        </button>
        <button type="button" className={formStyles.primaryButton} onClick={() => applyShift()} disabled={preview.length === 0}>
          Apply shift
        </button>
      </div>
    </Modal>
  );
}
