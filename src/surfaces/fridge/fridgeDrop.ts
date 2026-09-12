/** Drop a unit on the Fridge: it goes in the drawer and stays a unit. */

import type { PaletteToken, WorkspaceDomainState } from '../../domain/types';

export type FridgeDropTarget = 'door' | 'drawer';

export interface FridgeDropActions {
  domain: WorkspaceDomainState;
  stowUnitInDrawer: (unitId: string) => void;
  createUnitInDrawer: (colorToken: PaletteToken) => void;
  moveNoteToFridge: (noteId: string) => void;
  moveMagnetToFridge: (magnetId: string) => void;
  moveNoteToDrawer: (noteId: string) => void;
  moveMagnetToDrawer: (magnetId: string) => void;
  target?: FridgeDropTarget;
}

export function applyFridgeDrop(e: React.DragEvent, ctx: FridgeDropActions) {
  e.preventDefault();
  e.dataTransfer.dropEffect = 'move';
  const toDrawer = ctx.target === 'drawer';

  const placementId = e.dataTransfer.getData('text/arc-placement-id');
  if (placementId) {
    const placement = ctx.domain.placements[placementId];
    if (placement?.objectType === 'unit') {
      ctx.stowUnitInDrawer(placement.objectId);
      return;
    }
    if (placement?.objectType === 'note') {
      if (toDrawer) ctx.moveNoteToDrawer(placement.objectId);
      else ctx.moveNoteToFridge(placement.objectId);
      return;
    }
    if (placement?.objectType === 'magnet') {
      if (toDrawer) ctx.moveMagnetToDrawer(placement.objectId);
      else ctx.moveMagnetToFridge(placement.objectId);
    }
    return;
  }

  const unplaced = e.dataTransfer.getData('text/arc-unplaced');
  if (!unplaced) return;
  try {
    const payload = JSON.parse(unplaced) as { type: string; id?: string; colorToken?: string };
    if (payload.type === 'unit' && payload.id) {
      ctx.stowUnitInDrawer(payload.id);
      return;
    }
    if (payload.type === 'unit-blank' && payload.colorToken) {
      ctx.createUnitInDrawer(payload.colorToken as PaletteToken);
      return;
    }
    if (payload.type === 'note' && payload.id) {
      if (toDrawer) ctx.moveNoteToDrawer(payload.id);
      else ctx.moveNoteToFridge(payload.id);
      return;
    }
    if (payload.type === 'magnet' && payload.id) {
      if (toDrawer) ctx.moveMagnetToDrawer(payload.id);
      else ctx.moveMagnetToFridge(payload.id);
    }
  } catch {
    // ignore malformed drag payloads
  }
}
