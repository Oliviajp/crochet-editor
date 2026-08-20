import type { Row } from "./Row";

export type StartType = "magic-circle" | "slip-knot";

export type Pattern = {
  id: number;

  name: string;

  startType: StartType;

  finished: boolean;

  hookSize: number;

  yarnWeightId: string;

  yarnMaterialIds: string[];

  rows: Row[];

  Children: Pattern[];
};
