import type { Stitch } from "./Stitch";
export type Pattern = {
  id: number;

  name: string;

  hookSize: number;

  yarnWeightId: string;

  yarnMaterialIds: string[];

  stitches: Stitch[];
};
