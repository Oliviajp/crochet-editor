import  type { Stitch } from "./Stitch"
export type Pattern = {
  id: string

  name: string

  hookSize: number

  yarnWeightId: string

  yarnMaterialIds: string[]

  stitches: Stitch[]
}