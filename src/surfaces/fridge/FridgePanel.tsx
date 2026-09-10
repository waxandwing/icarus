import { useState } from 'react';
import type { MagnetKind } from '../../domain/types';
import { getDrawerItems, getFridgeItems } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import formStyles from '../../components/Form.module.css';
import styles from './FridgePanel.module.css';

const MAGNET_KINDS: { id: MagnetKind; label: string }[] = [
  { id: 'idea', label: 'Idea' },
  { id: 'voice', label: 'Voice' },
  { id: 'resource', label: 'Resource' },
  { id: 'reminder', label: 'Reminder' },
];

export function FridgePanel() {
  const isOpen = useWorkspaceStore((s) => s.ui.openPanels.fridge);
  const domain = useWorkspaceStore((s) => s.domain);
  const openFurniture = useWorkspaceStore((s) => s.openFurniture);
  const select = useWorkspaceStore((s) => s.select);
  const createMagnet = useWorkspaceStore((s) => s.createMagnet);
  const moveNoteToFridge = useWorkspaceStore((s) => s.moveNoteToFridge);
  const moveMagnetToFridge = useWorkspaceStore((s) => s.moveMagnetToFridge);

  const [subTab, setSubTab] = useState<'fridge' | 'drawer'>('fridge');
  const [kind, setKind] = useState<MagnetKind>('idea');
  const [title, setTitle] = useState('');

  const fridgeItems = getFridgeItems(domain);
  const drawerItems = getDrawerItems(domain);
  const slots: (typeof fridgeItems)[number][] = Array.from({ length: domain.fridge.capacity });
  fridgeItems.forEach((item) => {
    if (item.fridgeSlot != null) slots[item.fridgeSlot] = item;
  });

  return (
    <aside
      id="arc-fridge-panel"
      className={styles.panel}
      data-open={isOpen}
      aria-hidden={!isOpen}
      aria-label="Fridge"
    >
      <button
        type="button"
        className={styles.closeButton}
        onClick={() => openFurniture('fridge', false)}
        aria-label="Close fridge"
      >
        {'\u2715'}
      </button>
      <h2 className={styles.heading}>Fridge</h2>

      <div className={styles.tabs} role="tablist">
        <button
          type="button"
          role="tab"
          aria-pressed={subTab === 'fridge'}
          className={styles.subTab}
          onClick={() => setSubTab('fridge')}
        >
          Door ({fridgeItems.length}/{domain.fridge.capacity})
        </button>
        <button
          type="button"
          role="tab"
          aria-pressed={subTab === 'drawer'}
          className={styles.subTab}
          onClick={() => setSubTab('drawer')}
        >
          Drawer ({drawerItems.length})
        </button>
      </div>

      {subTab === 'fridge' ? (
        <>
          <div className={styles.artworkRow}>
            <span className="arc-visually-hidden">Pinned paper notes</span>
          </div>
          <div className={styles.grid}>
            {slots.map((item, i) => (
              <div key={item?.id ?? `empty-${i}`} className={styles.slot}>
                {item ? (
                  <button
                    type="button"
                    className={styles.item}
                    draggable
                    onDragStart={(e) =>
                      e.dataTransfer.setData(
                        'text/arc-unplaced',
                        JSON.stringify({ type: item.kind === 'note' ? 'note' : 'magnet', id: item.id }),
                      )
                    }
                    onClick={() =>
                      select({ objectType: item.kind === 'note' ? 'note' : 'magnet', objectId: item.id })
                    }
                  >
                    {item.title}
                  </button>
                ) : null}
              </div>
            ))}
          </div>
          <form
            className={styles.quickAdd}
            onSubmit={(e) => {
              e.preventDefault();
              if (title.trim()) {
                createMagnet({ magnetKind: kind, title: title.trim() });
                setTitle('');
              }
            }}
          >
            <div className={formStyles.field}>
              <label htmlFor="fridge-kind">Pin a new magnet</label>
              <select id="fridge-kind" value={kind} onChange={(e) => setKind(e.target.value as MagnetKind)}>
                {MAGNET_KINDS.map((k) => (
                  <option key={k.id} value={k.id}>
                    {k.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={formStyles.field}>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Quick thought\u2026"
                aria-label="Magnet title"
              />
            </div>
            <button type="submit" className={formStyles.primaryButton} style={{ width: '100%' }}>
              Pin to fridge
            </button>
          </form>
        </>
      ) : (
        <div className={styles.drawerList}>
          {drawerItems.length === 0 && (
            <p style={{ fontStyle: 'italic', color: 'var(--arc-charcoal)' }}>The drawer is empty.</p>
          )}
          {drawerItems.map((item) => (
            <button
              key={item.id}
              type="button"
              className={styles.drawerItem}
              draggable
              onDragStart={(e) =>
                e.dataTransfer.setData(
                  'text/arc-unplaced',
                  JSON.stringify({ type: item.kind === 'note' ? 'note' : 'magnet', id: item.id }),
                )
              }
              onClick={() => {
                if (item.kind === 'note') moveNoteToFridge(item.id);
                else moveMagnetToFridge(item.id);
              }}
            >
              {item.title}
              <div style={{ fontSize: 11, opacity: 0.7 }}>Tap to bring back to the fridge door</div>
            </button>
          ))}
        </div>
      )}
    </aside>
  );
}
