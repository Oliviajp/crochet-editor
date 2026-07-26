//everything about a stitch, including its type, loop type, position, and connections to other stitches
export type StitchType = "slst" | "ch" | "sc" | "hdc" | "dc" | "tr";

export type LoopType = "both" | "front" | "back";

export type Stitch = {
  id: string;
  type: StitchType;
  loop: LoopType;
  x: number;
  y: number;
  connections: string[];
};
