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

export type Stitch = {
  id: string;
  type: StitchType;
  loop: LoopType;
  x: number;
  y: number;
  connections: string[];
};