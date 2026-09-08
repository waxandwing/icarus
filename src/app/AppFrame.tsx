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
import { useWorkspaceStore } from '../state/store';
import { useEffect, useState } from 'react';
import styles from './AppFrame.module.css';

const TAB_IDS: Record<string, string> = {
  settings: 'arc-settings-tab',
  fridge: 'arc-fridge-tab',
  taskbar: 'arc-taskbar-tab',
};

/**
 * Composition-only shell: lays out the environment, the centered calendar,
 * and the exterior-edge furniture. It owns no calendar domain state itself.
 */
export function AppFrame() {
  const openPanel = useWorkspaceStore((s) => s.ui.openPanel);
  const [editingId, setEditingId] = useState<{ type: string; id: string } | null>(null);
  const [creatingFor, setCreatingFor] = useState<string | null>(null);

  // Escape closes open edge furniture before clearing general object selection
  // (Desktop Interaction Blueprint \u00a721), and focus returns to the pull-tab that
  // opened the drawer rather than being lost.
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
      <a href="#arc-calendar-shell" className={styles.skipLink}>
        Skip to calendar
      </a>

      <SettingsTab />
      <FridgeTab />
      <TaskBarTab />

      <div
        className={styles.scrim}
        data-visible={openPanel !== null}
        onClick={() => useWorkspaceStore.getState().openFurniture(null)}
        aria-hidden="true"
      />

      <SettingsPanel />
      <FridgePanel />
      <TaskBarPanel />

      <main className={styles.stage} id="arc-calendar-shell">
        <CalendarShell onEdit={(type, id) => setEditingId({ type, id })} onCreate={(date) => setCreatingFor(date)} />
      </main>

      <SelectionToolbar onEdit={(type, id) => setEditingId({ type, id })} />
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
