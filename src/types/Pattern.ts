import type { Row } from "./Row";
export type Pattern = {
  id: number;

  name: string;

  hookSize: number;

  yarnWeightId: string;

  yarnMaterialIds: string[];

  rows: Row[];

  Children: Pattern[];
};
