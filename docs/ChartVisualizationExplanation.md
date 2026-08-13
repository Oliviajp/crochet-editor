# ChartVisualization.tsx — Word-by-Word Explanation

Source file: `src/components/Canvas/ChartVisualization.tsx`

`ChartVisualization.tsx` is the **classic SVG chart** view. It draws every row of the pattern as a row of crochet symbols inside an SVG. Each stitch type (chain, slip stitch, single crochet, etc.) has its own little glyph built from SVG shapes (lines, circles, ellipses). The component measures the pattern, computes an SVG canvas big enough to hold it, then lays the rows out evenly.

---

## Imports

```tsx
import type { ReactNode } from "react";
```

**Word-by-word:** `import type` — import only the TypeScript *type* (erased at compile time). `{ ReactNode }` — the type describing anything React can render (a number, string, element, fragment, array, etc.). `from` — from. `"react"` — the React package. `ReactNode` is the return type of the `stitchGlyph` helper, since it returns different SVG elements depending on the stitch type.

```tsx
import type { Pattern } from "../../types/Pattern";
```

**Word-by-word:** `import type` — type-only import. `{ Pattern }` — the `Pattern` type. `from` — from. `"../../types/Pattern"` — go up two folders, then `types/Pattern` (file `Pattern.ts`). Used to type the props.

```tsx
import type { Stitch, StitchType } from "../../types/Stitch";
```

**Word-by-word:** `import type` — type-only import. `{ Stitch, StitchType }` — two types from the stitch definitions file: `Stitch` (a single stitch object with an `id`, `type`, etc.) and `StitchType` (the union of allowed stitch types like `"sc"`, `"dc"`, ...). `from "../../types/Stitch"` — path to `src/types/Stitch.ts`.

---

## The stitch label dictionary

```tsx
const STITCH_LABELS: Record<StitchType, string> = {
```

**Word-by-word:** `const` — declare a constant. `STITCH_LABELS` — its name (uppercase = constant). `: Record<StitchType, string>` — TypeScript type: a `Record` is an object type where every key is a `StitchType` and every value is a `string`. `=` — assigned. `{` — start the object.

```tsx
  ch: "Chain (CH)",
```

**Word-by-word:** `ch` — the key (a stitch type). `:` — colon separates key from value. `"Chain (CH)"` — the human-readable label shown in the tooltip. `,` — end of this entry.

```tsx
  slst: "Slip Stitch (SLST)",
  sc: "Single Crochet (SC)",
  hdc: "Half Double Crochet (HDC)",
  dc: "Double Crochet (DC)",
  tr: "Treble Crochet (TR)",
  puff: "Puff Stitch",
  bobble: "Bobble Stitch",
  popcorn: "Popcorn Stitch",
};
```

**Word-by-word:** The remaining entries, one per stitch type, mapping the internal key (e.g. `sc`) to a friendly name (e.g. `"Single Crochet (SC)"`). `};` — close the object and end the statement. Because of the `Record<StitchType, string>` annotation, TypeScript checks that every stitch type has an entry.

---

## The `stitchGlyph` helper

```tsx
/**
 * Draw a single crochet chart symbol centered at (cx, cy).
 */
function stitchGlyph(
  stitch: Stitch,
  cx: number,
  cy: number,
  size: number
): ReactNode {
```

**Word-by-word:** A JSDoc comment describing the function. `function` — declare a function. `stitchGlyph` — its name (glyph = a symbol drawn on the chart). It takes four arguments: `stitch` (the stitch to draw, typed `Stitch`), `cx` and `cy` (the center X and Y coordinates where the symbol should be drawn, both `number`), and `size` (how big the symbol should be, `number`). `): ReactNode` — the return type: anything React can render. `{` — start the body.

```tsx
  const strokeWidth = 2;
```

**Word-by-word:** `const` — declare. `strokeWidth` — the thickness of the lines used to draw symbols. `= 2` — two units thick.

```tsx
  const half = size * 0.3;
```

**Word-by-word:** `half` — half of the "X" used by some stitches (like the single crochet). `size * 0.3` — 30% of the symbol size. These derived values keep the glyphs proportional to `size`.

```tsx
  const stem = size * 0.36;
```

**Word-by-word:** `stem` — the length of the vertical stem for tall stitches (hdc, dc, tr, popcorn). `size * 0.36` — 36% of the symbol size.

```tsx
  const topBar = size * 0.34;
```

**Word-by-word:** `topBar` — the length of the horizontal bar(s) across the top of tall stitches. `size * 0.34` — 34% of the symbol size.

```tsx
  switch (stitch.type) {
```

**Word-by-word:** `switch` — a switch statement that runs different code depending on the value of one expression. `(stitch.type)` — the value being switched on: the type of the stitch (e.g. `"ch"`, `"sc"`). `{` — start the switch body.

### Case: chain

```tsx
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
```

**Word-by-word:** `case "ch":` — when the stitch type is `ch` (chain). `return (` — output an `<ellipse>` SVG element: `cx={cx}` / `cy={cy}` — centered at the given coordinates; `rx={size * 0.42}` / `ry={size * 0.26}` — horizontal/vertical radius (wider than tall, so it looks like an oval chain loop); `fill="none"` — no fill, just the outline; `stroke="currentColor"` — line color inherits the CSS `color` of the parent (the `.canvas-stitch` class sets it to teal); `strokeWidth={strokeWidth}` — line thickness 2. `/>` — self-closing tag. `);` — return it.

### Case: slip stitch

```tsx
    case "slst":
      return <circle cx={cx} cy={cy} r={size * 0.18} fill="currentColor" />;
```

**Word-by-word:** `case "slst":` — slip stitch. `return <circle ... />` — a filled `<circle>` at the center, radius `size * 0.18` (a small solid dot), filled with the current color.

### Case: single crochet

```tsx
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
```

**Word-by-word:** `case "sc":` — single crochet. `return (` — return a `<g>` (SVG group; a container that holds multiple shapes so they move/scaling together). The first `<line>`: from `(cx - half, cy - half)` (top-left) to `(cx + half, cy + half)` (bottom-right) — one diagonal of the X. `stroke` and `strokeWidth` as before.

```tsx
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
```

**Word-by-word:** The second `<line>`: from `(cx + half, cy - half)` (top-right) to `(cx - half, cy + half)` (bottom-left) — the other diagonal. Together the two lines form an **X**, the classic single-crochet symbol. `</g>` — close the group; `);` — return it.

### Case: half double crochet

```tsx
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
```

**Word-by-word:** `case "hdc":` — half double crochet. A vertical `<line>`: `x1={cx}` / `x2={cx}` (same X = perfectly vertical), from `cy - stem` (top of stem) to `cy + stem` (bottom of stem). This is the upright stem.

```tsx
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
```

**Word-by-word:** A horizontal `<line>`: `y1={cy - stem}` / `y2={cy - stem}` (same Y = horizontal), from `cx - topBar` to `cx + topBar`. This is the bar across the top. Stem + one top bar = the HDC symbol (an upright T). `</g>` / `);` — close and return.

### Case: double crochet

```tsx
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
```

**Word-by-word:** `case "dc":` — double crochet. Three lines: (1) the vertical stem (same as HDC), (2) the top bar (same as HDC), and (3) a **diagonal slash** across the stem — from `(cx - half, cy - stem * 0.2)` (upper-left of the stem, 20% down the stem) to `(cx + half, cy + stem * 0.2)` (lower-right). The extra diagonal is what distinguishes a DC (one slash) from an HDC (no slash).

### Case: treble crochet

```tsx
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
```

**Word-by-word:** `case "tr":` — treble crochet. Stem + top bar (as before) plus **two** diagonal slashes: one in the upper half of the stem (from `cy - stem * 0.45` to `cy - stem * 0.05`), one in the lower half (from `cy - stem * 0.15` to `cy + stem * 0.25`). Two slashes = one more than DC, matching the real crochet convention.

### Case: puff

```tsx
    case "puff":
      return <circle cx={cx} cy={cy} r={size * 0.34} fill="currentColor" />;
```

**Word-by-word:** `case "puff":` — puff stitch. A filled `<circle>` of radius `size * 0.34` — a big solid dot.

### Case: bobble

```tsx
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
```

**Word-by-word:** `case "bobble":` — bobble stitch. Two circles: a big filled one (radius `size * 0.3`, slightly transparent with `opacity={0.85}`) and a smaller hollow one on top (radius `size * 0.15`, no fill, stroked outline) — a filled dot with a ring in the middle.

### Case: popcorn

```tsx
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
```

**Word-by-word:** `case "popcorn":` — popcorn stitch. A filled `<circle>` (radius `size * 0.34`) plus a vertical `<line>` from the center up to `cy - stem * 1.2` — a dot with a little stem on top.

### Default

```tsx
    default:
      return null;
  }
}
```

**Word-by-word:** `default:` — if the stitch type matches none of the cases (shouldn't happen given the types, but needed for exhaustiveness). `return null;` — render nothing. `}` — close the switch. `}` — close the `stitchGlyph` function.

---

## The component

```tsx
type ChartVisualizationProps = {
  pattern: Pattern;
};
```

**Word-by-word:** `type` — declare a type alias. `ChartVisualizationProps` — the props type for this component. `{ pattern: Pattern }` — one property, `pattern`, of type `Pattern`.

```tsx
export default function ChartVisualization({ pattern }: ChartVisualizationProps) {
```

**Word-by-word:** `export default` — the default export of this file. `function ChartVisualization` — the component function. `({ pattern }` — destructure the `pattern` prop. `: ChartVisualizationProps` — type the props object. `{` — start body.

### Layout constants

```tsx
  const size = 24;
```

**Word-by-word:** `const size = 24;` — the size of each stitch symbol in SVG units.

```tsx
  const stitchSpacing = 46;
```

**Word-by-word:** `stitchSpacing` — the horizontal distance between the centers of adjacent stitches in a row.

```tsx
  const rowGap = 64;
```

**Word-by-word:** `rowGap` — the vertical distance between the baseline of consecutive rows.

```tsx
  const labelWidth = 100;
```

**Word-by-word:** `labelWidth` — horizontal space reserved on the left for the row labels (e.g. "Round 1").

```tsx
  const padding = 40;
```

**Word-by-word:** `padding` — empty margin around the whole drawing inside the SVG.

```tsx
  const minWidth = 600;
  const minHeight = 360;
```

**Word-by-word:** `minWidth` / `minHeight` — the smallest the SVG canvas can be, so even an empty or tiny pattern gets a reasonably sized canvas.

### Measurement

```tsx
  const rows = pattern.rows;
```

**Word-by-word:** `const rows` — a local shorthand. `= pattern.rows` — the array of rows from the pattern.

```tsx
  const maxStitches = rows.reduce(
    (max, row) => Math.max(max, row.stitches.length),
    0
  );
```

**Word-by-word:** `rows.reduce(...)` — fold over the array into one value. `(max, row) => Math.max(max, row.stitches.length)` — for each row, keep the larger of the current max and that row's stitch count. `, 0` — start from 0. Result: `maxStitches` — the number of stitches in the widest row. This drives both the canvas width and the centering of each row.

### Canvas size

```tsx
  const width = Math.max(
    padding * 2 + labelWidth + Math.max(maxStitches, 6) * stitchSpacing,
    minWidth
  );
```

**Word-by-word:** `width` — the SVG width: `padding * 2` (left + right padding) plus `labelWidth` (row label column) plus `Math.max(maxStitches, 6) * stitchSpacing` (room for at least 6 stitches, or the widest row's count, times the spacing). `Math.max(..., minWidth)` — but never smaller than 600.

```tsx
  const height = Math.max(
    padding * 2 + Math.max(rows.length, 1) * rowGap,
    minHeight
  );
```

**Word-by-word:** `height` — the SVG height: top + bottom padding plus the number of rows (at least 1) times the row gap, but never smaller than 360.

### The SVG element

```tsx
  return (
    <svg
      className="canvas-svg"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
    >
```

**Word-by-word:** `return (` — output this JSX. `<svg` — the SVG root element. `className="canvas-svg"` — CSS class (fills the canvas area, `display: block`). `viewBox={`0 0 ${width} ${height}`}` — a template literal producing e.g. `0 0 1188 448`: the coordinate system of the drawing (starting at origin, sized `width` × `height`). `preserveAspectRatio="xMidYMid meet"` — scale the drawing to fit its container while keeping the aspect ratio, centered both ways.

### Empty state

```tsx
      {rows.length === 0 ? (
```

**Word-by-word:** `{` — JavaScript expression in JSX. `rows.length === 0` — is the pattern empty (no rows)? `? (` — "if true" branch.

```tsx
        <text
          className="canvas-empty"
          x={width / 2}
          y={height / 2}
          textAnchor="middle"
        >
          No stitches yet — pick a stitch, then hit "Add Stitch"
        </text>
```

**Word-by-word:** `<text>` — an SVG text element. `className="canvas-empty"` — gray styling class. `x={width / 2}` / `y={height / 2}` — centered at the middle of the canvas. `textAnchor="middle"` — the text is centered on that X point. Inside: the hint message. `</text>` — close.

```tsx
      ) : (
```

**Word-by-word:** `) : (` — the "else" branch (there are rows to draw).

### Row layout

```tsx
        rows.map((row, rowIndex) => {
```

**Word-by-word:** `rows.map(...)` — loop over the rows, producing an array of JSX groups. `(row, rowIndex) =>` — for each `row` with its index `rowIndex`. `{` — start the mapping function body.

```tsx
          const rowY = padding + rowIndex * rowGap;
```

**Word-by-word:** `rowY` — this row's vertical position: the top padding plus its index times the row gap. Row 0 sits at `padding`, row 1 at `padding + rowGap`, etc.

```tsx
          // Center this row's stitches relative to the widest row.
          const startX =
            padding +
            labelWidth +
            ((maxStitches - row.stitches.length) * stitchSpacing) / 2;
```

**Word-by-word:** A comment explains the intent. `startX` — the X position of this row's first stitch: padding + label column + half the leftover space. `(maxStitches - row.stitches.length) * stitchSpacing` — how much narrower this row is than the widest row; dividing by 2 pushes the row right by half that amount, so the row is horizontally centered under the widest row.

### The row group

```tsx
          return (
            <g key={row.id} className="canvas-row">
```

**Word-by-word:** `return (` — output one `<g>` (SVG group) per row. `key={row.id}` — React's unique key for list items (uses the row's id). `className="canvas-row"` — grouping class.

```tsx
              <text
                className="canvas-row-label"
                x={padding}
                y={rowY + size * 0.7}
              >
                {row.label}
              </text>
```

**Word-by-word:** `<text>` — the row label. `className="canvas-row-label"` — bold gray styling. `x={padding}` — at the far left. `y={rowY + size * 0.7}` — slightly below the row baseline so the text lines up with the stitch symbols. `{row.label}` — the row's label text (e.g. "Round 1"). `</text>` — close.

### The stitches

```tsx
              {row.stitches.map((stitch, stitchIndex) => (
```

**Word-by-word:** `{row.stitches.map(...)}` — loop over the row's stitches, producing JSX. `(stitch, stitchIndex) => (` — for each stitch with its index; note the `(` (implicit return, no braces).

```tsx
                <g
                  key={stitch.id}
                  className="canvas-stitch"
                  transform={`translate(${
                    startX + stitchIndex * stitchSpacing
                  } ${rowY})`}
                >
```

**Word-by-word:** `<g` — a group for one stitch. `key={stitch.id}` — React key from the stitch id. `className="canvas-stitch"` — the class that gives the stitch its teal color and hover highlight. `transform={`translate(${startX + stitchIndex * stitchSpacing} ${rowY})`}` — a template literal producing e.g. `translate(326 104)`: shifts the coordinate system to this stitch's position — its column is `startX` plus its index times the spacing, its row is `rowY`. This is why the glyph helper only needs to draw around `(0, 0)`.

```tsx
                  <title>{STITCH_LABELS[stitch.type]}</title>
```

**Word-by-word:** `<title>` — SVG tooltip element. `{STITCH_LABELS[stitch.type]}` — look up the stitch type in the labels dictionary; hovering the symbol shows e.g. "Single Crochet (SC)".

```tsx
                  {stitchGlyph(stitch, 0, 0, size)}
                </g>
```

**Word-by-word:** `{stitchGlyph(stitch, 0, 0, size)}` — call the glyph helper with the stitch and center `(0, 0)` (the group's transform already positioned it), sized `size`. `</g>` — close the stitch group.

```tsx
              ))}
```

**Word-by-word:** `))}` — close the arrow function, the `.map()` call, and the JSX expression.

```tsx
            </g>
          );
        })
      )}
    </svg>
  );
}
```

**Word-by-word:** `</g>` — close the row group; `);` — return it. `})` — close the mapping arrow function; `)` — close `.map()`. `)}` — close the ternary and the JSX expression. `</svg>` — close the SVG. `);` — end the returned JSX. `}` — end the component.

---

## Summary

- `stitchGlyph` draws each stitch type as a small SVG symbol (X, T, T with slashes, dots, rings) centered at `(0, 0)` and scaled by `size`.
- The component measures the pattern: `maxStitches` (widest row) drives the width and the centering; `rows.length` drives the height.
- Each row is a `<g>` translated down by `rowY`; each stitch is a `<g>` translated across by `startX + index * spacing`.
- Rows with fewer stitches than the widest row are centered horizontally.
- An empty pattern shows a centered hint message instead of rows.
