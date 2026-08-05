// Stitch definitions for crochet patterns

export type StitchType =
  | "ch"
  | "slst"
  | "sc"
  | "hdc"
  | "dc"
  | "tr"
  | "puff"
  | "bobble"
  | "popcorn";

export type LoopType =
  | "both"
  | "front"
  | "back";

export interface Stitch {
    id: number;
    type: StitchType;
    parentId: number | null;
    workedInto: LoopType;
    row: number;
}
