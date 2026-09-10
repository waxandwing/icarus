import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import * as cmd from '../domain/commands';
import { DomainError } from '../domain/errors';
import { createInitialState } from '../domain/seed';
import type {
  DeliveryState,
  ISODate,
  MagnetKind,
  NoteLocation,
  PaletteToken,
  PlaceableType,
  TaskColumn,
  Visibility,
  WorkspaceDomainState,
} from '../domain/types';
import { loadPersisted, savePersisted } from '../persistence/db';

export type FurniturePanel = 'settings' | 'fridge' | 'taskbar' | 'drawer';
export type CalendarViewMode = 'day' | 'week' | 'month';

export interface SelectionRef {
  objectType: PlaceableType | 'note' | 'date';
  objectId: string;
}

export interface ShiftDialogState {
  open: boolean;
  sectionId: string | null;
  fromDate: ISODate | null;
  schoolDays: number;
  reason: string;
}

export interface LiveClassroomState {
  open: boolean;
  sectionId: string | null;
  lessonId: string | null;
}

interface UiState {
  ready: boolean;
  view: CalendarViewMode;
  anchorDate: ISODate;
  selection: SelectionRef | null;
  openPanels: Record<FurniturePanel, boolean>;
  shiftDialog: ShiftDialogState;
  liveClassroom: LiveClassroomState;
  toast: { message: string; tone: 'error' | 'info' } | null;
}

export interface ActionResult {
  ok: boolean;
  error?: string;
}

interface WorkspaceStore {
  domain: WorkspaceDomainState;
  undo: { label: string; snapshot: WorkspaceDomainState } | null;
  ui: UiState;

  init: () => Promise<void>;

  setView: (view: CalendarViewMode) => void;
  setAnchorDate: (date: ISODate) => void;
  select: (ref: SelectionRef | null) => void;
  openFurniture: (panel: FurniturePanel, open?: boolean) => void;
  toggleFurniture: (panel: FurniturePanel) => void;
  closeAllFurniture: () => void;
  dismissToast: () => void;

  createCourse: (name: string, colorToken: PaletteToken) => ActionResult;
  createSection: (courseId: string, name: string) => ActionResult;
  createUnit: (payload: {
    courseId: string;
    title: string;
    colorToken: PaletteToken;
    startDate: ISODate;
    endDate: ISODate;
    notes?: string;
  }) => ActionResult;
  createLesson: (payload: {
    courseId: string;
    unitId?: string;
    sectionId?: string;
    title: string;
    body?: string;
    date: ISODate;
    visibility?: Visibility;
    allowCollision?: boolean;
  }) => ActionResult;
  createNote: (payload: {
    title: string;
    body?: string;
    location: NoteLocation;
    taskColumn?: TaskColumn;
    date?: ISODate;
  }) => ActionResult;
  createMagnet: (payload: { magnetKind: MagnetKind; title: string; body?: string }) => ActionResult;

  editUnit: (id: string, patch: Partial<WorkspaceDomainState['units'][string]>) => ActionResult;
  editLesson: (id: string, patch: Partial<WorkspaceDomainState['lessons'][string]>) => ActionResult;
  editNote: (id: string, patch: Partial<WorkspaceDomainState['notes'][string]>) => ActionResult;
  editMagnet: (id: string, patch: Partial<WorkspaceDomainState['magnets'][string]>) => ActionResult;

  movePlacement: (placementId: string, date: ISODate, allowCollision?: boolean) => ActionResult;
  setPlacementFixed: (placementId: string, fixed: boolean) => ActionResult;
  copyLesson: (lessonId: string, date: ISODate) => ActionResult;
  unplace: (placementId: string) => ActionResult;
  deleteObject: (
    objectType: PlaceableType | 'note' | 'course' | 'section',
    objectId: string,
  ) => ActionResult;

  markImportant: (
    objectType: 'unit' | 'lesson' | 'note',
    objectId: string,
    important: boolean,
  ) => ActionResult;
  crossOut: (objectType: 'lesson' | 'note', objectId: string, crossedOut: boolean) => ActionResult;

  moveNoteToFridge: (noteId: string) => ActionResult;
  moveNoteToDrawer: (noteId: string) => ActionResult;
  moveNoteToTaskBar: (noteId: string, column: TaskColumn) => ActionResult;
  placeMagnetOnCalendar: (magnetId: string, date: ISODate) => ActionResult;
  placeNoteOnCalendar: (noteId: string, date: ISODate) => ActionResult;
  moveMagnetToFridge: (magnetId: string) => ActionResult;
  moveMagnetToDrawer: (magnetId: string) => ActionResult;

  setDelivery: (
    sectionId: string,
    lessonId: string,
    state: DeliveryState,
    resumeNote?: string,
  ) => ActionResult;
  openLiveClassroom: (sectionId: string, lessonId: string) => void;
  closeLiveClassroom: () => void;

  setCalendarDay: (
    date: ISODate,
    kind: WorkspaceDomainState['calendar']['days'][string]['kind'],
    label?: string,
  ) => ActionResult;
  updateSettings: (patch: Partial<WorkspaceDomainState['settings']>) => void;

  openShiftDialog: (sectionId: string, fromDate: ISODate) => void;
  closeShiftDialog: () => void;
  setShiftDays: (days: number) => void;
  setShiftReason: (reason: string) => void;
  applyShift: () => ActionResult;
  undoLast: () => ActionResult;

  resetWorkspace: () => Promise<void>;
  clearSampleData: () => ActionResult;
}

let persistTimer: ReturnType<typeof setTimeout> | null = null;
function schedulePersist(get: () => WorkspaceStore) {
  if (persistTimer) clearTimeout(persistTimer);
  persistTimer = setTimeout(() => {
    const { domain, undo } = get();
    void savePersisted({ domain, undo, savedAt: Date.now() });
  }, 250);
}

function createInitialUi(): UiState {
  return {
    ready: false,
    view: 'week',
    anchorDate: new Date().toISOString().slice(0, 10),
    selection: null,
    openPanels: { settings: false, fridge: false, taskbar: false, drawer: false },
    shiftDialog: { open: false, sectionId: null, fromDate: null, schoolDays: 1, reason: '' },
    liveClassroom: { open: false, sectionId: null, lessonId: null },
    toast: null,
  };
}

export const useWorkspaceStore = create<WorkspaceStore>()(
  immer((set, get) => {
    function run(label: string, mutator: (draft: WorkspaceDomainState) => void): ActionResult {
      const previousDomain = get().domain;
      try {
        set((state) => {
          mutator(state.domain);
        });
      } catch (err) {
        const message = err instanceof DomainError ? err.message : 'Something went wrong.';
        if (!(err instanceof DomainError)) console.error(err);
        set((state) => {
          state.ui.toast = { message, tone: 'error' };
        });
        return { ok: false, error: message };
      }
      set((state) => {
        state.undo = { label, snapshot: previousDomain };
      });
      schedulePersist(get);
      return { ok: true };
    }

    return {
      domain: createInitialState(),
      undo: null,
      ui: createInitialUi(),

      init: async () => {
        const persisted = await loadPersisted();
        set((state) => {
          if (persisted) {
            state.domain = persisted.domain;
            state.undo = persisted.undo;
          }
          state.ui.ready = true;
        });
      },

      setView: (view) =>
        set((state) => {
          state.ui.view = view;
        }),
      setAnchorDate: (date) =>
        set((state) => {
          state.ui.anchorDate = date;
        }),
      select: (ref) =>
        set((state) => {
          state.ui.selection = ref;
        }),
      openFurniture: (panel, open = true) =>
        set((state) => {
          state.ui.openPanels[panel] = open;
        }),
      toggleFurniture: (panel) =>
        set((state) => {
          state.ui.openPanels[panel] = !state.ui.openPanels[panel];
        }),
      closeAllFurniture: () =>
        set((state) => {
          for (const panel of Object.keys(state.ui.openPanels) as FurniturePanel[]) {
            state.ui.openPanels[panel] = false;
          }
        }),
      dismissToast: () =>
        set((state) => {
          state.ui.toast = null;
        }),

      createCourse: (name, colorToken) =>
        run(`Create course "${name}"`, (d) => {
          cmd.createCourse(d, { name, colorToken });
        }),
      createSection: (courseId, name) =>
        run(`Create section "${name}"`, (d) => {
          cmd.createSection(d, { courseId, name });
        }),
      createUnit: (payload) =>
        run(`Create unit "${payload.title}"`, (d) => {
          cmd.createUnit(d, payload);
        }),
      createLesson: (payload) =>
        run(`Create lesson "${payload.title}"`, (d) => {
          cmd.createLesson(d, payload);
        }),
      createNote: (payload) =>
        run(`Create note "${payload.title}"`, (d) => {
          cmd.createNote(d, payload);
        }),
      createMagnet: (payload) =>
        run(`Create ${payload.magnetKind}`, (d) => {
          cmd.createMagnet(d, payload);
        }),

      editUnit: (id, patch) =>
        run('Edit unit', (d) => {
          cmd.editUnit(d, { id, patch });
        }),
      editLesson: (id, patch) =>
        run('Edit lesson', (d) => {
          cmd.editLesson(d, { id, patch });
        }),
      editNote: (id, patch) =>
        run('Edit note', (d) => {
          cmd.editNote(d, { id, patch });
        }),
      editMagnet: (id, patch) =>
        run('Edit item', (d) => {
          cmd.editMagnet(d, { id, patch });
        }),

      movePlacement: (placementId, date, allowCollision) =>
        run('Move item', (d) => {
          cmd.move(d, { placementId, date, allowCollision });
        }),
      setPlacementFixed: (placementId, fixed) =>
        run(fixed ? 'Pin date' : 'Unpin date', (d) => {
          cmd.setPlacementFixed(d, { placementId, fixed });
        }),
      copyLesson: (lessonId, date) =>
        run('Copy lesson', (d) => {
          cmd.copyLesson(d, { id: lessonId, date });
        }),
      unplace: (placementId) =>
        run('Unplace item', (d) => {
          cmd.unplace(d, { placementId });
        }),
      deleteObject: (objectType, objectId) =>
        run('Delete item', (d) => {
          cmd.deleteObject(d, { objectType, objectId });
        }),

      markImportant: (objectType, objectId, important) =>
        run('Mark important', (d) => {
          cmd.markImportant(d, { objectType, objectId, important });
        }),
      crossOut: (objectType, objectId, crossedOut) =>
        run('Cross out', (d) => {
          cmd.crossOut(d, { objectType, objectId, crossedOut });
        }),

      moveNoteToFridge: (noteId) =>
        run('Move to fridge', (d) => {
          cmd.moveNoteToFridge(d, { noteId });
        }),
      moveNoteToDrawer: (noteId) =>
        run('Move to drawer', (d) => {
          cmd.moveNoteToDrawer(d, { noteId });
        }),
      moveNoteToTaskBar: (noteId, column) =>
        run('Move to task bar', (d) => {
          cmd.moveNoteToTaskBar(d, { noteId, column });
        }),
      placeMagnetOnCalendar: (magnetId, date) =>
        run('Place magnet', (d) => {
          cmd.place(d, { objectType: 'magnet', objectId: magnetId, date });
        }),
      placeNoteOnCalendar: (noteId, date) =>
        run('Place note', (d) => {
          cmd.place(d, { objectType: 'note', objectId: noteId, date });
        }),
      moveMagnetToFridge: (magnetId) =>
        run('Move to fridge', (d) => {
          cmd.moveMagnetToFridge(d, { magnetId });
        }),
      moveMagnetToDrawer: (magnetId) =>
        run('Move to drawer', (d) => {
          cmd.moveMagnetToDrawer(d, { magnetId });
        }),

      setDelivery: (sectionId, lessonId, state_, resumeNote) =>
        run('Update delivery', (d) => {
          const actualDate = state_ === 'completed' ? new Date().toISOString().slice(0, 10) : undefined;
          cmd.setDelivery(d, { sectionId, lessonId, state: state_, resumeNote, actualDate });
        }),
      openLiveClassroom: (sectionId, lessonId) =>
        set((state) => {
          state.ui.liveClassroom = { open: true, sectionId, lessonId };
        }),
      closeLiveClassroom: () =>
        set((state) => {
          state.ui.liveClassroom = { open: false, sectionId: null, lessonId: null };
        }),

      setCalendarDay: (date, kind, label) =>
        run(`Set ${date}`, (d) => {
          cmd.setCalendarDay(d, { date, kind, label });
        }),
      updateSettings: (patch) => {
        set((state) => {
          cmd.updateSettings(state.domain, patch);
        });
        schedulePersist(get);
      },

      openShiftDialog: (sectionId, fromDate) =>
        set((state) => {
          state.ui.shiftDialog = { open: true, sectionId, fromDate, schoolDays: 1, reason: '' };
        }),
      closeShiftDialog: () =>
        set((state) => {
          state.ui.shiftDialog = { open: false, sectionId: null, fromDate: null, schoolDays: 1, reason: '' };
        }),
      setShiftDays: (days) =>
        set((state) => {
          state.ui.shiftDialog.schoolDays = days;
        }),
      setShiftReason: (reason) =>
        set((state) => {
          state.ui.shiftDialog.reason = reason;
        }),
      applyShift: () => {
        const { sectionId, fromDate, schoolDays, reason } = get().ui.shiftDialog;
        if (!sectionId || !fromDate) return { ok: false, error: 'Nothing to shift.' };
        const result = run(`Shift schedule from ${fromDate}`, (d) => {
          cmd.applyShift(d, { sectionId, fromDate, schoolDays, reason: reason || undefined });
        });
        if (result.ok) {
          set((state) => {
            state.ui.shiftDialog = { open: false, sectionId: null, fromDate: null, schoolDays: 1, reason: '' };
          });
        }
        return result;
      },

      undoLast: () => {
        const undo = get().undo;
        if (!undo) return { ok: false, error: 'Nothing to undo.' };
        set((state) => {
          state.domain = undo.snapshot;
          cmd.pushHistory(state.domain, 'undo', `Undid: ${undo.label}`);
          state.undo = null;
        });
        schedulePersist(get);
        return { ok: true };
      },

      resetWorkspace: async () => {
        const fresh = createInitialState();
        set((state) => {
          state.domain = fresh;
          state.undo = null;
          state.ui = { ...createInitialUi(), ready: true };
        });
        schedulePersist(get);
      },

      clearSampleData: () =>
        run('Clear sample data', (d) => {
          cmd.clearSampleData(d);
        }),
    };
  }),
);
