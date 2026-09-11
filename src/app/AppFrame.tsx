import { CalendarShell } from '../surfaces/calendar/CalendarShell';
import { CreateItemDialog } from '../components/CreateItemDialog';
import { EditDialog } from '../components/EditDialog';
import { ShiftDialog } from '../components/ShiftDialog';
import { DeskField } from '../surfaces/desk/DeskField';
import { FridgePanel } from '../surfaces/fridge/FridgePanel';
import { FridgeTab } from '../surfaces/fridge/FridgeTab';
import { SettingsPanel } from '../surfaces/settings/SettingsPanel';
import { SettingsTab } from '../surfaces/settings/SettingsTab';
import { TaskBarPanel } from '../surfaces/taskbar/TaskBarPanel';
import { TaskBarTab } from '../surfaces/taskbar/TaskBarTab';
import { useWorkspaceStore } from '../state/store';
import { useEffect, useState } from 'react';
import styles from './AppFrame.module.css';

const TAB_IDS: Record<string, string> = {
  settings: 'arc-settings-tab',
  fridge: 'arc-fridge-tab',
  taskbar: 'arc-taskbar-tab',
};

/**
 * Desk + bound planner. Furniture hangs off the cover into the wall.
 * It must not overlay, dim, squeeze, or reflow the pages.
 */
export function AppFrame() {
  const openPanel = useWorkspaceStore((s) => s.ui.openPanel);
  const cleanUp = useWorkspaceStore((s) => s.cleanUp);
  const [editingId, setEditingId] = useState<{ type: string; id: string } | null>(null);
  const [creatingFor, setCreatingFor] = useState<{ date: string; unitId?: string; sectionId?: string } | null>(null);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      const state = useWorkspaceStore.getState();
      if (state.ui.openPanel) {
        const tabId = TAB_IDS[state.ui.openPanel];
        state.openFurniture(null);
        if (tabId) requestAnimationFrame(() => document.getElementById(tabId)?.focus());
      } else if (state.ui.selection) {
        state.select(null);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className={styles.environment}>
      <div className={styles.pattern} aria-hidden="true" />
      <a href="#arc-calendar-shell" className={styles.skipLink}>
        Skip to calendar
      </a>

      <div className={styles.desk}>
        <DeskField />
        <div className={styles.stage}>
          <aside className={styles.edgeLeft}>
            <SettingsPanel />
            <TaskBarPanel />
            <div className={styles.tabStack}>
              <SettingsTab />
              <TaskBarTab />
            </div>
          </aside>

          <div className={styles.bookColumn}>
            <CalendarShell
              onEdit={(type, id) => setEditingId({ type, id })}
              onCreate={(date, nest) => setCreatingFor({ date, ...nest })}
            />
          </div>

          <aside className={styles.edgeRight} data-open={openPanel === 'fridge'}>
            <FridgeTab />
            <FridgePanel />
          </aside>
        </div>

        <button type="button" className={styles.cleanUp} onClick={() => cleanUp()}>
          Clean up workspace
        </button>
      </div>

      {creatingFor && (
        <CreateItemDialog
          date={creatingFor.date}
          unitId={creatingFor.unitId}
          sectionId={creatingFor.sectionId}
          onClose={() => setCreatingFor(null)}
        />
      )}
      {editingId && (
        <EditDialog objectType={editingId.type} objectId={editingId.id} onClose={() => setEditingId(null)} />
      )}
      <ShiftDialog />
    </div>
  );
}
