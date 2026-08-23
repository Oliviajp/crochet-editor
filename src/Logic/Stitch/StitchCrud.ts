import type { Stitch, StitchType, LoopType } from "../../types/Stitch";

let nextId = 1;

/**
 * Create a new stitch.
 */
export function createStitch(
  type: StitchType,
  parentId: number | null = null,
  workedInto: LoopType = "both"
): Stitch {
  return {
    id: nextId++,
    type,
    parentId,
    workedInto,
    note: "",
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
 * Add multiple stitches to a pattern.
 */
export function addStitches(
  stitches: Stitch[],
  stitchesToAdd: Stitch[]
): Stitch[] {
  return [...stitches, ...stitchesToAdd];
}

/**
 * Update an existing stitch.
 * map over the stitches and replace the one with the same id as the updated stitch.
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
 * filter out the stitch with the given id from the stitches array.
 */
export function deleteStitch(
  stitches: Stitch[], 
  id: number
): Stitch[] {
  return stitches.filter((s) => s.id !== id);
}

/**
 * Change the type of a stitch by id.
 */
export function setStitchType(
  stitches: Stitch[],
  id: number,
  newType: StitchType
): Stitch[] {
  return stitches.map((s) =>
    s.id === id ? { ...s, type: newType } : s
  );
}

/**
 * Set the note on a stitch by id.
 */
export function setStitchNote(
  stitches: Stitch[],
  id: number,
  note: string
): Stitch[] {
  return stitches.map((s) =>
    s.id === id ? { ...s, note } : s
  );
}