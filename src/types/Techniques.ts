/** Actions before crochet begins */
export type SetupTechnique =
  | "slipKnot";

/** Techniques that define how the project starts */
export type StarterTechnique =
  | "magicRing"
  | "chainStart";

/** Techniques used while crocheting the pattern */
export type PatternTechnique =
  | "joinRound"
  | "increase"
  | "decrease"
  | "colorChange";

/** Techniques performed after the pattern is complete */
export type FinishingTechnique =
  | "fastenOff"
  | "joinParts";

/** Every possible crochet technique */
export type TechniqueType =
  | SetupTechnique
  | StarterTechnique
  | PatternTechnique
  | FinishingTechnique;


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
  return (
    technique === "magicRing" ||
    technique === "chainStart"
  );
}


/** Finishing methods */
export function isFinishingTechnique(
  technique: TechniqueType
): technique is FinishingTechnique {
  return (
    technique === "fastenOff" ||
    technique === "joinParts"
  );
}


/** Pattern techniques */
export function isPatternTechnique(
  technique: TechniqueType
): technique is PatternTechnique {
  return (
    !isSetupTechnique(technique) &&
    !isStarterTechnique(technique) &&
    !isFinishingTechnique(technique)
  );
}