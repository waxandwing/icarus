export const TABLE_DESK_FACTS_KEY = 'arc-table-desk-facts';

export type TableDeskFacts = {
  sectionId: string;
  rosterCount: number;
  outName?: string;
  outKind?: string;
};

export function writeTableDeskFacts(facts: TableDeskFacts): void {
  try {
    localStorage.setItem(TABLE_DESK_FACTS_KEY, JSON.stringify(facts));
  } catch {
    /* private mode */
  }
}

export function readTableDeskFacts(sectionId?: string): TableDeskFacts | null {
  try {
    const raw = localStorage.getItem(TABLE_DESK_FACTS_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as TableDeskFacts;
    if (!parsed || typeof parsed.sectionId !== 'string') return null;
    if (sectionId && parsed.sectionId !== sectionId) return null;
    return parsed;
  } catch {
    return null;
  }
}
