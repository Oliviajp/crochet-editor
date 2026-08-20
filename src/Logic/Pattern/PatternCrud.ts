import type { Pattern, StartType } from "../../types/Pattern";
import type { Row } from "../../types/Row";

let nextId = 1;

/**
 * Create a new pattern.
 */
export function createPattern(
  name: string = "Untitled Pattern",
  startType: StartType = "magic-circle",
  hookSize: number = 0,
  yarnWeightId: string = "",
  yarnMaterialIds: string[] = [],
  rows: Row[] = []
): Pattern {
  return {
    id: nextId++,
    name,
    startType,
    finished: false,
    hookSize,
    yarnWeightId,
    yarnMaterialIds,
    rows,
    Children: [],
  };
}

/**
 * Add a pattern to a collection.
 */
export function addPattern(
  patterns: Pattern[],
  pattern: Pattern
): Pattern[] {
  return [...patterns, pattern];
}

/**
 * Update an existing pattern.
 * map over the patterns and replace the one with the same id as the updated pattern.
 */
export function updatePattern(
  patterns: Pattern[],
  updated: Pattern
): Pattern[] {
  return patterns.map((p) =>
    p.id === updated.id ? updated : p
  );
}

/**
 * Delete a pattern.
 * filter out the pattern with the given id from the patterns array.
 */
export function deletePattern(
  patterns: Pattern[],
  id: number
): Pattern[] {
  return patterns.filter((p) => p.id !== id);
}
