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
 * Compress a row of stitches into crochet-style notation,
 * e.g. [SC, CH, SC, SC, CH, SC] -> "(SC, CH, SC) x2".
 */
function formatStitches(stitches: Stitch[]): string {
  const parts: string[] = [];
  let i = 0;

  while (i < stitches.length) {
    let bestCount = 1;
    let bestUnit: Stitch[] = [stitches[i]];

    // Greedily find the longest repeating unit at this position.
    for (let len = 1; len <= Math.floor((stitches.length - i) / 2); len++) {
      const unit = stitches.slice(i, i + len);
      const count = repeatCount(stitches, i, unit);
      if (count > bestCount || (count === bestCount && len > bestUnit.length)) {
        bestCount = count;
        bestUnit = unit;
      }
    }

    const unitText = bestUnit
      .map((stitch) => STITCH_ABBREVIATIONS[stitch.type])
      .join(", ");

    if (bestCount > 1) {
      parts.push(
        bestUnit.length === 1
          ? `${unitText} x${bestCount}`
          : `(${unitText}) x${bestCount}`
      );
    } else {
      parts.push(unitText);
    }

    i += bestUnit.length * bestCount;
  }

  return parts.join(", ");
}

type SimpleVisualizationProps = {
  pattern: Pattern;
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
      {pattern.rows.map((row) => (
        <p key={row.id} className="simple-row">
          <span className="simple-row-label">{row.label}:</span>{" "}
          <span className="simple-row-text">
            {formatStitches(row.stitches)}
          </span>
        </p>
      ))}
    </div>
  );
}
