import { useState } from 'react';
import type { Magnet, MagnetKind, Note } from '../../domain/types';
import { getDrawerItems, getFridgeItems } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import styles from './FridgePanel.module.css';

const MAGNET_KINDS: { id: MagnetKind; label: string }[] = [
  { id: 'idea', label: 'Idea' },
  { id: 'voice', label: 'Voice' },
  { id: 'resource', label: 'Resource' },
  { id: 'reminder', label: 'Reminder' },
];

function itemKindLabel(item: Note | Magnet) {
  if (item.kind === 'note') return 'Note';
  const match = MAGNET_KINDS.find((k) => k.id === item.magnetKind);
  return match?.label ?? 'Magnet';
}

function setMoveDrag(e: React.DragEvent, payload: { type: 'note' | 'magnet'; id: string }) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/arc-unplaced', JSON.stringify(payload));
}

function FridgeInterior() {
  const domain = useWorkspaceStore((s) => s.domain);
  const select = useWorkspaceStore((s) => s.select);
  const createNote = useWorkspaceStore((s) => s.createNote);
  const moveNoteToFridge = useWorkspaceStore((s) => s.moveNoteToFridge);
  const moveMagnetToFridge = useWorkspaceStore((s) => s.moveMagnetToFridge);
  const [showDrawer, setShowDrawer] = useState(false);
  const [dump, setDump] = useState('');

  const fridgeItems = getFridgeItems(domain);
  const drawerItems = getDrawerItems(domain);
  const magnets = fridgeItems.filter((item): item is Magnet => item.kind === 'magnet');
  const papers = fridgeItems.filter((item): item is Note => item.kind === 'note');

  function captureDump() {
    const title = dump.trim();
    if (!title) return;
    createNote({ title, location: 'fridge' });
    setDump('');
  }

  return (
    <>
      <section className={styles.block}>
        <h3>Brain dump</h3>
        <form
          className={styles.dump}
          onSubmit={(e) => {
            e.preventDefault();
            captureDump();
          }}
        >
          <textarea
            value={dump}
            onChange={(e) => setDump(e.target.value)}
            placeholder={'Type, paste, or drop something here\u2026'}
            aria-label="Brain dump"
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const text = e.dataTransfer.getData('text/plain').trim();
              if (text) setDump((current) => (current ? `${current}\n${text}` : text));
            }}
          />
          <button type="submit">Pin to fridge</button>
        </form>
      </section>

      <section className={styles.block}>
        <h3>Units</h3>
        <div className={styles.magnetRow}>
          {magnets.length === 0 && <p className={styles.empty}>No magnets on the door.</p>}
          {magnets.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`arc-token-${item.magnetKind === 'resource' ? 'blue' : item.magnetKind === 'reminder' ? 'sage' : 'mustard'} ${styles.magnet}`}
              draggable
              onDragStart={(e) => setMoveDrag(e, { type: 'magnet', id: item.id })}
              onClick={() => select({ objectType: 'magnet', objectId: item.id })}
            >
              <span className={styles.magnetTitle}>{item.title}</span>
            </button>
          ))}
        </div>
      </section>

      <section className={styles.block}>
        <h3>Lessons + notes</h3>
        <div className={styles.paperRow}>
          {papers.length === 0 && <p className={styles.empty}>No papers on the door.</p>}
          {papers.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={styles.scrap}
              data-tilt={index % 2 === 0 ? 'left' : 'right'}
              draggable
              onDragStart={(e) => setMoveDrag(e, { type: 'note', id: item.id })}
              onClick={() => select({ objectType: 'note', objectId: item.id })}
            >
              <span className={styles.kind}>{itemKindLabel(item)}</span>
              {item.title}
            </button>
          ))}
        </div>
      </section>

      <section className={styles.block}>
        <button
          type="button"
          className={styles.later}
          aria-expanded={showDrawer}
          onClick={() => setShowDrawer((open) => !open)}
        >
          <span>Saved for later</span>
          <span className={styles.laterMeta}>
            Ideas you are not ready to schedule yet
            <strong>
              {drawerItems.length} {drawerItems.length === 1 ? 'item' : 'items'}
            </strong>
          </span>
        </button>
        {showDrawer && (
          <div className={styles.drawerList}>
            {drawerItems.length === 0 && <p className={styles.empty}>The drawer is empty.</p>}
            {drawerItems.map((item) => (
              <button
                key={item.id}
                type="button"
                className={styles.drawerItem}
                draggable
                onDragStart={(e) =>
                  setMoveDrag(e, { type: item.kind === 'note' ? 'note' : 'magnet', id: item.id })
                }
                onClick={() => {
                  if (item.kind === 'note') moveNoteToFridge(item.id);
                  else moveMagnetToFridge(item.id);
                }}
              >
                <span className={styles.kind}>{itemKindLabel(item)}</span>
                {item.title}
                <div className={styles.drawerHint}>Tap to bring back to the fridge door</div>
              </button>
            ))}
          </div>
        )}
      </section>
    </>
  );
}

export function FridgePanel() {
  const openPanel = useWorkspaceStore((s) => s.ui.openPanel);
  const isOpen = openPanel === 'fridge';
  const openFurniture = useWorkspaceStore((s) => s.openFurniture);

  return (
    <aside
      id="arc-fridge-panel"
      className={styles.panel}
      data-open={isOpen}
      aria-hidden={!isOpen}
      aria-label="Fridge"
    >
      <div className={styles.folder}>
        <button type="button" className={styles.closeButton} onClick={() => openFurniture(null)} aria-label="Close fridge">
          {'\u2715'}
        </button>
        <div className={styles.paper}>
          <h2 className={styles.heading}>The Fridge</h2>
          <FridgeInterior key={isOpen ? 'open' : 'shut'} />
        </div>
      </div>
    </aside>
  );
}
