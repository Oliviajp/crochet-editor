import type { ReactNode } from "react";

import type { Pattern } from "../../types/Pattern";
import type { Stitch, StitchType } from "../../types/Stitch";

const STITCH_LABELS: Record<StitchType, string> = {
  ch: "Chain (CH)",
  slst: "Slip Stitch (SLST)",
  sc: "Single Crochet (SC)",
  hdc: "Half Double Crochet (HDC)",
  dc: "Double Crochet (DC)",
  tr: "Treble Crochet (TR)",
  puff: "Puff Stitch",
  bobble: "Bobble Stitch",
  popcorn: "Popcorn Stitch",
};

/**
 * Draw a single crochet chart symbol centered at (cx, cy).
 */
function stitchGlyph(
  stitch: Stitch,
  cx: number,
  cy: number,
  size: number
): ReactNode {
  const strokeWidth = 2;
  const half = size * 0.3;
  const stem = size * 0.36;
  const topBar = size * 0.34;

  switch (stitch.type) {
    case "ch":
      return (
        <ellipse
          cx={cx}
          cy={cy}
          rx={size * 0.42}
          ry={size * 0.26}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
        />
      );
    case "slst":
      return <circle cx={cx} cy={cy} r={size * 0.18} fill="currentColor" />;
    case "sc":
      return (
        <g>
          <line
            x1={cx - half}
            y1={cy - half}
            x2={cx + half}
            y2={cy + half}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <line
            x1={cx + half}
            y1={cy - half}
            x2={cx - half}
            y2={cy + half}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </g>
      );
    case "hdc":
      return (
        <g>
          <line
            x1={cx}
            y1={cy - stem}
            x2={cx}
            y2={cy + stem}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <line
            x1={cx - topBar}
            y1={cy - stem}
            x2={cx + topBar}
            y2={cy - stem}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </g>
      );
    case "dc":
      return (
        <g>
          <line
            x1={cx}
            y1={cy - stem}
            x2={cx}
            y2={cy + stem}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <line
            x1={cx - topBar}
            y1={cy - stem}
            x2={cx + topBar}
            y2={cy - stem}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <line
            x1={cx - half}
            y1={cy - stem * 0.2}
            x2={cx + half}
            y2={cy + stem * 0.2}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </g>
      );
    case "tr":
      return (
        <g>
          <line
            x1={cx}
            y1={cy - stem}
            x2={cx}
            y2={cy + stem}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <line
            x1={cx - topBar}
            y1={cy - stem}
            x2={cx + topBar}
            y2={cy - stem}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <line
            x1={cx - half}
            y1={cy - stem * 0.45}
            x2={cx + half}
            y2={cy - stem * 0.05}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <line
            x1={cx - half}
            y1={cy - stem * 0.15}
            x2={cx + half}
            y2={cy + stem * 0.25}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </g>
      );
    case "puff":
      return <circle cx={cx} cy={cy} r={size * 0.34} fill="currentColor" />;
    case "bobble":
      return (
        <g>
          <circle cx={cx} cy={cy} r={size * 0.3} fill="currentColor" opacity={0.85} />
          <circle
            cx={cx}
            cy={cy}
            r={size * 0.15}
            fill="none"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </g>
      );
    case "popcorn":
      return (
        <g>
          <circle cx={cx} cy={cy} r={size * 0.34} fill="currentColor" />
          <line
            x1={cx}
            y1={cy}
            x2={cx}
            y2={cy - stem * 1.2}
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
        </g>
      );
    default:
      return null;
  }
}

type ChartVisualizationProps = {
  pattern: Pattern;
};

export default function ChartVisualization({ pattern }: ChartVisualizationProps) {
  const size = 24;
  const stitchSpacing = 46;
  const rowGap = 64;
  const labelWidth = 100;
  const padding = 40;
  const minWidth = 600;
  const minHeight = 360;

  const rows = pattern.rows;
  const maxStitches = rows.reduce(
    (max, row) => Math.max(max, row.stitches.length),
    0
  );

  const width = Math.max(
    padding * 2 + labelWidth + Math.max(maxStitches, 6) * stitchSpacing,
    minWidth
  );
  const height = Math.max(
    padding * 2 + Math.max(rows.length, 1) * rowGap,
    minHeight
  );

  return (
    <svg
      className="canvas-svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
      {rows.length === 0 ? (
        <text
          className="canvas-empty"
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
        >
          No stitches yet — pick a stitch, then hit "Add Stitch"
        </text>
      ) : (
        rows.map((row, rowIndex) => {
          const rowY = padding + rowIndex * rowGap;
          // Center this row's stitches relative to the widest row.
          const startX =
            padding +
            labelWidth +
            ((maxStitches - row.stitches.length) * stitchSpacing) / 2;

          return (
            <g key={row.id} className="canvas-row">
              <text
                className="canvas-row-label"
                x={padding}
                y={rowY + size * 0.7}
              >
                {row.label}
              </text>
              {row.stitches.map((stitch, stitchIndex) => (
                <g
                  key={stitch.id}
                  className="canvas-stitch"
                  transform={`translate(${
                    startX + stitchIndex * stitchSpacing
                  } ${rowY})`}
                >
                  <title>{STITCH_LABELS[stitch.type]}</title>
                  {stitchGlyph(stitch, 0, 0, size)}
                </g>
              ))}
            </g>
          );
        })
      )}
    </svg>
  );
}
