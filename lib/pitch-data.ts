import type { PitchSection } from "@/lib/types";

export const GRID_COLS = 40;
export const GRID_ROWS = 25;

const sectionMap = new Map<string, PitchSection>();

export const pitchSections: PitchSection[] = Array.from(
  { length: GRID_ROWS },
  (_rowEl, row) =>
    Array.from({ length: GRID_COLS }, (_colEl, col) => {
      const id = `${row}-${col}`;
      const section: PitchSection = {
        id,
        row,
        col,
        price: 50,
        label: `R${row + 1}C${col + 1}`,
        available: true,
      };
      sectionMap.set(id, section);
      return section;
    })
).flat();

export function getSectionById(id: string | null): PitchSection | undefined {
  if (!id) return undefined;
  return sectionMap.get(id);
}
