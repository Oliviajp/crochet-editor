import type { Stitch } from "./Stitch";

export type Row = {
  id: number;

  label: string;

  stitches: Stitch[];
};
