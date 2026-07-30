import type { Stitch, StitchType, LoopType } from "../../types/Stitch";

let nextId = 1;

/**
 * Create a new stitch.
 */
export function createStitch(
  type: StitchType,
  row: number,
  parentId: number | null = null,
  workedInto: LoopType = "both"
): Stitch {
  return {
    id: nextId++,
    type,
    parentId,
    workedInto,
    row,
  };
}

/**
 * Add a stitch to a pattern.
 */
export function addStitch(
  stitches: Stitch[],
  stitch: Stitch
): Stitch[] {
  return [...stitches, stitch];
}

/**
 * Update an existing stitch.
 */
export function updateStitch(
  stitches: Stitch[],
  updated: Stitch
): Stitch[] {
  return stitches.map((s) =>
    s.id === updated.id ? updated : s
  );
}

/**
 * Delete a stitch.
 */
export function deleteStitch(
  stitches: Stitch[],
  id: number
): Stitch[] {
  return stitches.filter((s) => s.id !== id);
}