import { useState } from 'react';
import { useWorkspaceStore } from '../../state/store';
import { applyFridgeDrop } from './fridgeDrop';

export function useFridgeDrop() {
  const domain = useWorkspaceStore((s) => s.domain);
  const stowUnitInDrawer = useWorkspaceStore((s) => s.stowUnitInDrawer);
  const createUnitInDrawer = useWorkspaceStore((s) => s.createUnitInDrawer);
  const moveNoteToFridge = useWorkspaceStore((s) => s.moveNoteToFridge);
  const moveMagnetToFridge = useWorkspaceStore((s) => s.moveMagnetToFridge);
  const moveNoteToDrawer = useWorkspaceStore((s) => s.moveNoteToDrawer);
  const moveMagnetToDrawer = useWorkspaceStore((s) => s.moveMagnetToDrawer);
  const openFurniture = useWorkspaceStore((s) => s.openFurniture);
  const [over, setOver] = useState(false);

  return {
    over,
    onDragOver: (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: (e: React.DragEvent) => {
      setOver(false);
      applyFridgeDrop(e, {
        domain,
        stowUnitInDrawer,
        createUnitInDrawer,
        moveNoteToFridge,
        moveMagnetToFridge,
        moveNoteToDrawer,
        moveMagnetToDrawer,
      });
      openFurniture('fridge');
    },
  };
}
