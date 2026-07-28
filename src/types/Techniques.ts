// technique.ts

/** Actions before crochet begins */
export type SetupTechnique =
  | "slipKnot";

/** Techniques that define how the project starts */
export type StarterTechnique =
  | "magicRing"
  | "chainStart";

/** Techniques performed during or after the pattern */
export type PatternTechnique =
  | "joinRound"
  | "increase"
  | "decrease"
  | "fastenOff"
  | "colorChange"
  | "joinParts";


/** Every possible crochet technique */
export type TechniqueType =
  | SetupTechnique
  | StarterTechnique
  | PatternTechnique;


/** Setup actions */
export function isSetupTechnique(
  technique: TechniqueType
): technique is SetupTechnique {
  return technique === "slipKnot";
}


/** Starting methods */
export function isStarterTechnique(
  technique: TechniqueType
): technique is StarterTechnique {
  return technique === "magicRing" || technique === "chainStart";
}


/** Pattern modification techniques */
export function isPatternTechnique(
  technique: TechniqueType
): technique is PatternTechnique {
  return !isSetupTechnique(technique) && !isStarterTechnique(technique);
}