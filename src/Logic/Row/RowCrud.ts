import type { Row } from "../../types/Row";
import type { Stitch } from "../../types/Stitch";

let nextId = 1;

/**
 * Create a new row.
 */
export function createRow(
  label: string = "Round 1",
  stitches: Stitch[] = []
): Row {
  return {
    id: nextId++,
    label,
    stitches,
  };
}

/**
 * Add a row to a pattern.
 */
export function addRow(
  rows: Row[],
  row: Row
): Row[] {
  return [...rows, row];
}

/**
 * Update an existing row.
 * map over the rows and replace the one with the same id as the updated row.
 */
export function updateRow(
  rows: Row[],
  updated: Row
): Row[] {
  return rows.map((r) =>
    r.id === updated.id ? updated : r
  );
}

/**
 * Delete a row.
 * filter out the row with the given id from the rows array.
 */
export function deleteRow(
  rows: Row[],
  id: number
): Row[] {
  return rows.filter((r) => r.id !== id);
}
