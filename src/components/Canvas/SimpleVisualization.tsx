import type { Pattern } from "../../types/Pattern";
import type { Stitch, StitchType } from "../../types/Stitch";
import "./SimpleVisualization.css";

const STITCH_ABBREVIATIONS: Record<StitchType, string> = {
  ch: "CH",
  slst: "SLST",
  sc: "SC",
  hdc: "HDC",
  dc: "DC",
  tr: "TR",
  puff: "PUFF",
  bobble: "BOB",
  popcorn: "POP",
};

function sameStitch(a: Stitch, b: Stitch): boolean {
  return a.type === b.type;
}

/** Count how many consecutive repeats of `unit` start at `start`. */
function repeatCount(
  stitches: Stitch[],
  start: number,
  unit: Stitch[]
): number {
  const n = stitches.length;
  let count = 1;
  while (
    start + unit.length * (count + 1) <= n &&
    unit.every((stitch, k) => sameStitch(stitch, stitches[start + unit.length * count + k]))
  ) {
    count++;
  }
  return count;
}

/**
 * Compress a row of stitches into crochet-style notation using a 3-step algorithm:
 *
 * Step 1 — Find the longest repeated group from the current position.
 *   e.g. SC SC SC HDC DC SC SC SC HDC DC → [SC SC SC HDC DC] x2
 *
 * Step 2 — Recursively compress the contents of that group.
 *   e.g. SC SC SC HDC DC → SC x3, HDC, DC
 *
 * Step 3 — Apply the outer repetition.
 *   e.g. (SC x3, HDC, DC) x2
 */
function formatStitches(stitches: Stitch[]): string {
  if (stitches.length === 0) return "";

  // Step 1: Find the longest repeating unit starting at position 0.
  let bestLen = 0;
  let bestCount = 0;

  for (let len = 1; len <= Math.floor(stitches.length / 2); len++) {
    const unit = stitches.slice(0, len);
    const count = repeatCount(stitches, 0, unit);
    if (count > 1 && len > bestLen) {
      // Skip homogeneous multi-stitch units — they are just runs, not groups.
      if (len > 1 && unit.every((s) => s.type === unit[0].type)) continue;
      bestLen = len;
      bestCount = count;
    }
  }

  if (bestLen > 0) {
    // Decompose the unit into its fundamental period to avoid nesting.
    // e.g. bestLen=4 unit=[SC,DC,SC,DC] → periodLen=2 [SC,DC], periodCount=2
    let periodLen = bestLen;
    for (let len = 1; len < bestLen; len++) {
      if (bestLen % len !== 0) continue;
      const isPeriod = stitches
        .slice(0, bestLen)
        .every((s, i) => sameStitch(s, stitches[i % len]));
      if (isPeriod) {
        periodLen = len;
        break;
      }
    }
    const periodCount = bestLen / periodLen; // times the period fits inside the unit
    const totalRepeats = bestCount * periodCount;

    const period = stitches.slice(0, periodLen);
    const compressed = formatStitches(period);
    const unitText = periodLen === 1 ? compressed : `(${compressed})`;
    const remaining = stitches.slice(periodLen * totalRepeats);
    const remainingText =
      remaining.length > 0 ? ", " + formatStitches(remaining) : "";
    return `${unitText} x${totalRepeats}${remainingText}`;
  }

  // No repetition — output this stitch and continue with the rest.
  const first = STITCH_ABBREVIATIONS[stitches[0].type];
  if (stitches.length === 1) return first;
  return first + ", " + formatStitches(stitches.slice(1));
}

type SimpleVisualizationProps = {
  pattern: Pattern;
};

const START_LABELS: Record<Pattern["startType"], string> = {
  "magic-circle": "Magic Circle",
  "slip-knot": "Slip Knot",
};

export default function SimpleVisualization({ pattern }: SimpleVisualizationProps) {
  if (pattern.rows.length === 0) {
    return (
      <p className="simple-empty">
        No stitches yet — pick a stitch, then hit "Add Stitch"
      </p>
    );
  }

  return (
    <div className="simple-view">
      <p className="simple-row simple-start">
        Start: {START_LABELS[pattern.startType]}
      </p>
      {pattern.rows.map((row) => (
        <p key={row.id} className="simple-row">
          <span className="simple-row-label">{row.label}:</span>{" "}
          <span className="simple-row-text">
            {formatStitches(row.stitches)}
          </span>
          <span className="simple-row-count">({row.stitches.length})</span>
        </p>
      ))}
      {pattern.finished && (
        <p className="simple-row simple-finish">
          Fasten Off
        </p>
      )}
    </div>
  );
}
