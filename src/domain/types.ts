/**
 * Canonical domain entities for Arc.
 *
 * These types are the single source of truth for scheduling state. Views
 * (Day/Week/Month) are projections/selectors over this state — they never
 * own a second copy of the truth. See docs/01_ARCHITECTURE_AND_STATE.md.
 */

export type ISODate = string; // "YYYY-MM-DD"

export type DayKind = 'instructional' | 'no-school' | 'early-release' | 'weekend';

export type Confidence = 'confirmed' | 'tentative';

export interface SchoolCalendarDay {
  date: ISODate;
  kind: DayKind;
  label?: string;
  confidence: Confidence;
}

export interface SchoolCalendar {
  startDate: ISODate;
  endDate: ISODate;
  /** Sparse map of exceptions to the default weekday=instructional / weekend=weekend rule. */
  days: Record<ISODate, SchoolCalendarDay>;
  showWeekends: boolean;
  weekStartsOn: 'monday' | 'sunday';
  source: string;
}

export interface Course {
  id: string;
  name: string;
  colorToken: PaletteToken;
  createdAt: number;
  archived?: boolean;
}

export interface Section {
  id: string;
  courseId: string;
  name: string;
  createdAt: number;
  archived?: boolean;
}

export interface Unit {
  id: string;
  kind: 'unit';
  courseId: string;
  title: string;
  colorToken: PaletteToken;
  notes?: string;
  important: boolean;
  createdAt: number;
}

export interface Lesson {
  id: string;
  kind: 'lesson';
  courseId: string;
  unitId?: string;
  sectionId?: string; // absent = shared across all Sections of the Course
  title: string;
  body?: string;
  important: boolean;
  crossedOut: boolean;
  visibility: Visibility;
  createdAt: number;
}

export type TaskColumn = 'must' | 'should' | 'could';
export type NoteLocation = 'calendar' | 'fridge' | 'drawer' | 'taskbar';

export interface Note {
  id: string;
  kind: 'note';
  title: string;
  body?: string;
  important: boolean;
  crossedOut: boolean;
  location: NoteLocation;
  taskColumn?: TaskColumn;
  fridgeSlot?: number;
  createdAt: number;
}

export type MagnetKind = 'idea' | 'voice' | 'resource' | 'reminder';
export type MagnetLocation = 'fridge' | 'drawer' | 'calendar';

export interface Magnet {
  id: string;
  kind: 'magnet';
  magnetKind: MagnetKind;
  title: string;
  body?: string;
  location: MagnetLocation;
  fridgeSlot?: number;
  createdAt: number;
}

export type PlaceableType = 'unit' | 'lesson' | 'note' | 'magnet';

export interface Placement {
  id: string;
  objectType: PlaceableType;
  objectId: string;
  sectionId?: string;
  date: ISODate;
  endDate?: ISODate; // for ranged objects such as Units
  order: number;
  /** Fixed anchors never move through a shift unless explicitly changed. */
  fixed: boolean;
}

export type DeliveryState = 'not-started' | 'in-progress' | 'completed' | 'skipped';

export interface DeliveryRecord {
  state: DeliveryState;
  /** Present when Stop here was used \u2014 required per the Master Operating Document. */
  resumeNote?: string;
  /** The date the lesson was actually taught, distinct from its planned placement date. */
  actualDate?: ISODate;
}

export type Visibility = 'teacher-private' | 'live-classroom' | 'daily-board' | 'sub-plan';

export interface HistoryEntry {
  id: string;
  timestamp: number;
  type: string;
  summary: string;
}

export type PaletteToken =
  | 'mustard'
  | 'terracotta'
  | 'blue'
  | 'sage'
  | 'pink'
  | 'lavender'
  | 'kraft'
  | 'charcoal';

export interface Settings {
  showWeekends: boolean;
  reducedMotion: boolean;
  highContrast: boolean;
  weekStartsOn: 'monday' | 'sunday';
  sampleBannerDismissed?: boolean;
}

export interface FridgeState {
  /** Fixed capacity. Overflow moves to the Drawer; the oldest item is never auto-evicted. */
  capacity: number;
}

export interface TaskBarState {
  columns: Record<TaskColumn, string[]>; // ordered Note ids
}

export interface SelectionRef {
  objectType: PlaceableType | 'note';
  objectId: string;
}

export interface WorkspaceDomainState {
  schemaVersion: number;
  /**
   * True while the workspace still contains the generated example plan.
   * Arc must never present demo content as if it were the teacher's real
   * data (Canonical Product Spec \u00a72), so the UI surfaces this plainly and
   * offers an explicit action to clear it.
   */
  isSampleWorkspace: boolean;
  calendar: SchoolCalendar;
  courses: Record<string, Course>;
  sections: Record<string, Section>;
  units: Record<string, Unit>;
  lessons: Record<string, Lesson>;
  notes: Record<string, Note>;
  magnets: Record<string, Magnet>;
  placements: Record<string, Placement>;
  delivery: Record<string, Record<string, DeliveryRecord>>; // sectionId -> lessonId -> record
  history: HistoryEntry[];
  settings: Settings;
  fridge: FridgeState;
  taskbar: TaskBarState;
}
