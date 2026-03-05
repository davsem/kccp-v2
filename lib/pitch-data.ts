import type { PitchSection } from "@/lib/types";

export const GRID_COLS = 20;
export const GRID_ROWS = 10;

const CENTER_COL_START = 7;
const CENTER_COL_END = 13;
const CENTER_ROW_START = 3;
const CENTER_ROW_END = 6;

function isCentre(row: number, col: number): boolean {
  return (
    col >= CENTER_COL_START &&
    col <= CENTER_COL_END &&
    row >= CENTER_ROW_START &&
    row <= CENTER_ROW_END
  );
}

export const pitchSections: PitchSection[] = Array.from(
  { length: GRID_ROWS },
  (_rowEl, row) =>
    Array.from({ length: GRID_COLS }, (_colEl, col) => {
      const id = `${row}-${col}`;
      return {
        id,
        row,
        col,
        price: isCentre(row, col) ? 100 : 50,
        label: `R${row + 1}C${col + 1}`,
        available: true,
      };
    })
).flat();

export function getSectionById(id: string): PitchSection | undefined {
  return pitchSections.find((s) => s.id === id);
}
