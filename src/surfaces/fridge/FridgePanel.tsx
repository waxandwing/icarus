import { useState, type CSSProperties } from 'react';
import type { Magnet, Note, Unit } from '../../domain/types';
import { getDrawerItems, getFridgeItems, getLessonsForUnit } from '../../projections/selectors';
import { useWorkspaceStore } from '../../state/store';
import { applyFridgeDrop } from './fridgeDrop';
import { useFridgeDrop } from './useFridgeDrop';
import styles from './FridgePanel.module.css';

function itemKindLabel(item: Note | Magnet | Unit) {
  if (item.kind === 'unit') return 'Unit';
  return item.kind === 'note' ? 'Note' : 'Magnet';
}

function setMoveDrag(e: React.DragEvent, payload: { type: 'note' | 'magnet' | 'unit'; id: string }) {
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/arc-unplaced', JSON.stringify(payload));
}

function FridgeInterior() {
  const domain = useWorkspaceStore((s) => s.domain);
  const select = useWorkspaceStore((s) => s.select);
  const moveNoteToFridge = useWorkspaceStore((s) => s.moveNoteToFridge);
  const moveMagnetToFridge = useWorkspaceStore((s) => s.moveMagnetToFridge);
  const moveNoteToDrawer = useWorkspaceStore((s) => s.moveNoteToDrawer);
  const moveMagnetToDrawer = useWorkspaceStore((s) => s.moveMagnetToDrawer);
  const stowUnitInDrawer = useWorkspaceStore((s) => s.stowUnitInDrawer);
  const createUnitInDrawer = useWorkspaceStore((s) => s.createUnitInDrawer);
  const [showDrawer, setShowDrawer] = useState(true);
  const [drawerOver, setDrawerOver] = useState(false);

  const fridgeItems = getFridgeItems(domain);
  const drawerItems = getDrawerItems(domain);

  const drawerDrop = {
    domain,
    stowUnitInDrawer,
    createUnitInDrawer,
    moveNoteToFridge,
    moveMagnetToFridge,
    moveNoteToDrawer,
    moveMagnetToDrawer,
    target: 'drawer' as const,
  };

  return (
    <>
      <section className={styles.block}>
        <h3>On the door</h3>
        <div className={styles.paperRow}>
          {fridgeItems.length === 0 && <p className={styles.empty}>Nothing parked here.</p>}
          {fridgeItems.map((item, index) =>
            item.kind === 'note' ? (
              <button
                key={item.id}
                type="button"
                className={styles.scrap}
                data-tilt={index % 2 === 0 ? 'left' : 'right'}
                draggable
                onDragStart={(e) => setMoveDrag(e, { type: 'note', id: item.id })}
                onClick={() => select({ objectType: 'note', objectId: item.id })}
              >
                {item.title}
              </button>
            ) : (
              <button
                key={item.id}
                type="button"
                className={styles.magnet}
                data-kind={item.magnetKind}
                draggable
                onDragStart={(e) => setMoveDrag(e, { type: 'magnet', id: item.id })}
                onClick={() => select({ objectType: 'magnet', objectId: item.id })}
              >
                <span className={styles.magnetTitle}>{item.title}</span>
              </button>
            ),
          )}
        </div>
      </section>

      <section
        className={styles.block}
        data-drop={drawerOver}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
          e.dataTransfer.dropEffect = 'move';
          setDrawerOver(true);
        }}
        onDragLeave={() => setDrawerOver(false)}
        onDrop={(e) => {
          e.stopPropagation();
          setDrawerOver(false);
          applyFridgeDrop(e, drawerDrop);
        }}
      >
        <button
          type="button"
          className={styles.later}
          aria-expanded={showDrawer}
          onClick={() => setShowDrawer((open) => !open)}
        >
          <span>The drawer</span>
          <span className={styles.laterMeta}>
            <strong>
              {drawerItems.length} {drawerItems.length === 1 ? 'item' : 'items'}
            </strong>
          </span>
        </button>
        {showDrawer && (
          <div className={styles.drawerList}>
            {drawerItems.length === 0 && <p className={styles.empty}>The drawer is empty.</p>}
            {drawerItems.map((item) =>
              item.kind === 'unit' ? (
                <div
                  key={item.id}
                  className={styles.drawerUnit}
                  draggable
                  onDragStart={(e) => setMoveDrag(e, { type: 'unit', id: item.id })}
                >
                  <button
                    type="button"
                    className={`arc-token-${item.colorToken} ${styles.drawerMagnet}`}
                    onClick={() => select({ objectType: 'unit', objectId: item.id })}
                  >
                    <span className={styles.kind}>Unit</span>
                    {item.title.replace(/^Unit\s+\d+\s*[·.•\-\u2013]\s*/i, '')}
                  </button>
                  {getLessonsForUnit(domain, item.id).map((lesson, index) => (
                    <button
                      key={lesson.id}
                      type="button"
                      className={styles.drawerSlip}
                      style={{ '--n': index } as CSSProperties}
                      onClick={() => select({ objectType: 'lesson', objectId: lesson.id })}
                    >
                      {lesson.title}
                    </button>
                  ))}
                </div>
              ) : (
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
                </button>
              ),
            )}
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
  const drop = useFridgeDrop();

  return (
    <aside
      id="arc-fridge-panel"
      className={styles.panel}
      data-open={isOpen}
      data-drop={drop.over}
      aria-hidden={!isOpen}
      aria-label="Fridge"
      onDragOver={drop.onDragOver}
      onDragLeave={drop.onDragLeave}
      onDrop={drop.onDrop}
    >
      <div className={styles.folder}>
        <button type="button" className={styles.closeButton} onClick={() => openFurniture(null)} aria-label="Close fridge">
          {'\u2715'}
        </button>
        <div className={styles.paper}>
          <h2 className={styles.heading}>Fridge</h2>
          <FridgeInterior key={isOpen ? 'open' : 'shut'} />
        </div>
      </div>
    </aside>
  );
}
