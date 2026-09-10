import { CalendarShell } from '../surfaces/calendar/CalendarShell';
import { CreateItemDialog } from '../components/CreateItemDialog';
import { EditDialog } from '../components/EditDialog';
import { LiveClassroomOverlay } from '../components/LiveClassroomOverlay';
import { SelectionToolbar } from '../components/SelectionToolbar';
import { ShiftDialog } from '../components/ShiftDialog';
import { Toast } from '../components/Toast';
import { FridgePanel } from '../surfaces/fridge/FridgePanel';
import { FridgeTab } from '../surfaces/fridge/FridgeTab';
import { SettingsPanel } from '../surfaces/settings/SettingsPanel';
import { SettingsTab } from '../surfaces/settings/SettingsTab';
import { TaskBarPanel } from '../surfaces/taskbar/TaskBarPanel';
import { TaskBarTab } from '../surfaces/taskbar/TaskBarTab';
import { useWorkspaceStore, type FurniturePanel } from '../state/store';
import { useEffect, useState } from 'react';
import styles from './AppFrame.module.css';

const TAB_IDS: Partial<Record<FurniturePanel, string>> = {
  settings: 'arc-settings-tab',
  fridge: 'arc-fridge-tab',
  taskbar: 'arc-taskbar-tab',
};

/**
 * Composition-only shell: lays out the environment, the centered calendar,
 * and the exterior-edge furniture. It owns no calendar domain state itself.
 */
export function AppFrame() {
  const openPanels = useWorkspaceStore((s) => s.ui.openPanels);
  const anyFurnitureOpen = Object.values(openPanels).some(Boolean);
  const [editingId, setEditingId] = useState<{ type: string; id: string } | null>(null);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);

  // Escape closes all open edge furniture before clearing object selection.
  // Focus returns to one of the tabs that opened the furniture rather than being lost.
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== 'Escape') return;
      const state = useWorkspaceStore.getState();
      const open = (Object.keys(state.ui.openPanels) as FurniturePanel[]).filter(
        (panel) => state.ui.openPanels[panel],
      );
      if (open.length > 0) {
        const focusTarget = open.map((panel) => TAB_IDS[panel]).find(Boolean);
        state.closeAllFurniture();
        if (focusTarget) requestAnimationFrame(() => document.getElementById(focusTarget)?.focus());
      } else if (state.ui.selection) {
        state.select(null);
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, []);

  return (
    <div className={styles.environment}>
      <a href="#arc-calendar-shell" className={styles.skipLink}>
        Skip to calendar
      </a>

      <SettingsTab />
      <FridgeTab />
      <TaskBarTab />

      <div
        className={styles.scrim}
        data-visible={anyFurnitureOpen}
        onClick={() => useWorkspaceStore.getState().closeAllFurniture()}
        aria-hidden="true"
      />

      <SettingsPanel />
      <FridgePanel />
      <TaskBarPanel />

      <main className={styles.stage} id="arc-calendar-shell">
        <CalendarShell
          onEdit={(type, id) => setEditingId({ type, id })}
          onCreate={(date) => setCreatingFor(date)}
        />
      </main>

      <SelectionToolbar
        onEdit={(type, id) => setEditingId({ type, id })}
        onCreate={(date) => setCreatingFor(date)}
      />
      {creatingFor && <CreateItemDialog date={creatingFor} onClose={() => setCreatingFor(null)} />}
      {editingId && (
        <EditDialog objectType={editingId.type} objectId={editingId.id} onClose={() => setEditingId(null)} />
      )}
      <ShiftDialog />
      <LiveClassroomOverlay />
      <Toast />
    </div>
  );
}
