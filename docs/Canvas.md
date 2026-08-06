# Canvas Component (`src/components/Canvas/Canvas.tsx`)

A complete guide to how the crochet pattern canvas works.

## Table of contents

1. [Overview](#overview)
2. [Where it fits in the app](#where-it-fits-in-the-app)
3. [The data model it renders](#the-data-model-it-renders)
4. [Props](#props)
5. [How rendering works](#how-rendering-works)
6. [The layout system](#the-layout-system)
7. [Drawing stitch symbols: `stitchGlyph`](#drawing-stitch-symbols-stitchglyph)
8. [Styling](#styling)
9. [Empty state](#empty-state)
10. [React considerations](#react-considerations)
11. [How to extend the canvas](#how-to-extend-the-canvas)

---

## Overview

`Canvas.tsx` is the visual heart of the crochet editor. It takes a **`Pattern`** and
renders it as a **crochet chart** — an SVG drawing where each row of the pattern
appears on its own horizontal band, and each stitch is drawn with the classic
standard crochet chart symbol (chain = oval, slip stitch = dot, single crochet = ×,
double crochet = T with a slash, and so on).

The component is **fully presentational**: it holds no state of its own and never
mutates the pattern. It receives a `Pattern` via props, does a pure render, and
leaves all logic (creating stitches, rows, patterns) to the CRUD modules in
`src/Logic/`.

---

## Where it fits in the app

```
src/App.tsx                    ← owns the Pattern state
  └─ <Canvas pattern={pattern} />   ← presentational: just draws
  └─ <Toolbar ... />            ← asks App to add stitches/rows
```

- `App.tsx` holds `const [pattern, setPattern] = useState<Pattern>(...)`.
- The user clicks stitch tools and "Add Stitch" / "New Row" in the **Toolbar**.
- `App` updates the `pattern` state through the pure CRUD helpers
  (`createStitch`, `addStitch`, `createRow`, `addRow`, `updateRow`).
- Every state change re-renders `<Canvas pattern={pattern} />`, which redraws the SVG.

---

## The data model it renders

Canvas consumes the three core types, imported as type-only imports:

```
Pattern  ── rows: Row[]
Row      ── label: string, stitches: Stitch[]
Stitch   ── type: StitchType, parentId: number | null, workedInto: "front" | "back" | "both"
```

From `src/types/Pattern.ts`:

```ts
export type Pattern = {
  id: number;
  name: string;
  hookSize: number;
  yarnWeightId: string;
  yarnMaterialIds: string[];
  rows: Row[];
  Children: Pattern[];
};
```

From `src/types/Row.ts`:

```ts
export type Row = {
  id: number;
  label: string;      // e.g. "Round 1"
  stitches: Stitch[];
};
```

From `src/types/Stitch.ts` — the full set of stitch types the canvas can draw:

```ts
export type StitchType =
  | "ch" | "slst" | "sc" | "hdc" | "dc" | "tr"
  | "puff" | "bobble" | "popcorn";
```

Canvas only reads `pattern.rows` — the metadata fields (`name`, `hookSize`, yarn,
`Children`) are not drawn by this component (yet).

---

## Props

```ts
type CanvasProps = {
  pattern: Pattern;
};
```

The component destructures the single prop and renders:

```tsx
export default function Canvas({ pattern }: CanvasProps) {
```

That's the entire public API. If you want selection or click-handling later, add
more props here (e.g. `selectedStitchId`, `onStitchClick`).

---

## How rendering works

The render output is a `<div className="canvas">` containing one `<svg>`:

```tsx
<svg
  className="canvas-svg"
  viewBox={`0 0 ${width} ${height}`}
  preserveAspectRatio="xMidYMid meet"
>
```

Notes:

- The SVG uses a computed **`viewBox`** (see layout below), so the drawing is
  resolution-independent and scales to whatever size the container is.
- `preserveAspectRatio="xMidYMid meet"` letterboxes the drawing so it keeps its
  proportions and stays centered.
- The outer `<div>` is a flex child of `App`'s `.main` row and provides the
  graph-paper background via CSS (see [Styling](#styling)).

Inside the SVG there are two branches:

1. **Empty pattern** (`pattern.rows.length === 0`) → a single centered hint `<text>`.
2. **Pattern with rows** → a `rows.map(...)` producing one `<g className="canvas-row">`
   per row.

Each row group contains:

- a `<text className="canvas-row-label">` with `row.label` (e.g. "Round 1"), and
- one `<g className="canvas-stitch">` per stitch, positioned with an SVG
  `transform="translate(x y)"`, containing:
  - a `<title>` element (native SVG tooltip, e.g. "Single Crochet (SC)"), and
  - the shape(s) returned by `stitchGlyph(...)`.

### Positioning one row

```tsx
const rowY = padding + rowIndex * rowGap;
const startX =
  padding +
  labelWidth +
  ((maxStitches - row.stitches.length) * stitchSpacing) / 2;
```

- `rowY` = vertical origin of the row's first stitch (rows stack top → down).
- `startX` = horizontal origin of the row's first stitch. It shifts the row to the
  **right** by half the difference between the widest row and this row, which
  **centers the row's stitches** horizontally relative to the widest row.

Each stitch then lands at `translate(startX + stitchIndex * stitchSpacing, rowY)`.

### Visual layout sketch

```
 padding
 ┌────────────────────────────────────────────────────────┐
 │  padding                                              │
 │  ┌─────────┬────────────────────────────────────────┐ │
 │  │ label   │  stitch 0   stitch 1   stitch 2 ...    │ │
 │  │ (x=pad) │  startX ──► (each + stitchSpacing)     │ │
 │  └─────────┴────────────────────────────────────────┘ │
 │  ┌─────────┬────────────────────────────────────────┐ │
 │  │ Round 2 │  (centered relative to widest row)     │ │
 │  └─────────┴────────────────────────────────────────┘ │
 │  ── rowGap between rows ──                            │
 └────────────────────────────────────────────────────────┘
```

---

## The layout system

All layout numbers are local constants at the top of the component:

| Constant         | Value | Meaning                                                    |
| ---------------- | ----- | ---------------------------------------------------------- |
| `size`           | `24`  | Base size of one stitch symbol (used for all glyph maths)  |
| `stitchSpacing`  | `46`  | Horizontal distance between stitch centers in a row        |
| `rowGap`         | `64`  | Vertical distance between row origins                      |
| `labelWidth`     | `100` | Horizontal space reserved for the row label                |
| `padding`        | `40`  | Margin around the whole drawing                            |
| `minWidth`       | `600` | viewBox width floor (so the empty state has room)          |
| `minHeight`      | `360` | viewBox height floor                                       |

### Computing the viewBox size

```ts
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
```

- `maxStitches` is the stitch count of the widest row.
- `width` = left padding + label column + (widest row × spacing) + right padding,
  floored at `minWidth`. The `Math.max(maxStitches, 6)` just guarantees at least
  6 stitch slots of width.
- `height` = top padding + (number of rows × `rowGap`) + bottom padding, floored
  at `minHeight` (the `Math.max(rows.length, 1)` keeps an empty pattern tall enough
  to show the hint message).

---

## Drawing stitch symbols: `stitchGlyph`

```ts
function stitchGlyph(
  stitch: Stitch,
  cx: number,
  cy: number,
  size: number
): ReactNode
```

This is a pure helper (not a component) that returns the SVG shape(s) for **one**
stitch, centered at `(cx, cy)`. In the render loop it is always called as
`stitchGlyph(stitch, 0, 0, size)` because the wrapping `<g>` already applies the
`translate(...)` transform.

### Shared geometry constants

| Constant     | Value             | Used for                                       |
| ------------ | ----------------- | ---------------------------------------------- |
| `strokeWidth`| `2`               | Line/ellipse stroke thickness                  |
| `half`       | `size * 0.30`     | Half-width of crosses (sc) and diagonal slashes |
| `stem`       | `size * 0.36`     | Half-height of the T-stems (hdc/dc/tr)         |
| `topBar`     | `size * 0.34`     | Half-length of the horizontal T top bar        |

### The symbols, type by type

| Type      | Symbol drawn                                                        |
| --------- | ------------------------------------------------------------------- |
| `ch`      | Outlined **ellipse** (classic chain symbol)                         |
| `slst`    | Small **filled circle** (dot)                                       |
| `sc`      | **×** — two crossing diagonal lines                                 |
| `hdc`     | **T** — vertical stem + top bar                                     |
| `dc`      | **T with one diagonal slash** through the stem                      |
| `tr`      | **T with two diagonal slashes**                                     |
| `puff`    | **Large filled circle**                                             |
| `bobble`  | **Filled circle with an inner outlined ring**                       |
| `popcorn` | **Filled circle with a short vertical stem** poking out the top     |
| (default) | `null` — nothing rendered (defensive fallback)                      |

The `switch` returns JSX in every case and never falls through
(`noFallthroughCasesInSwitch` is enabled in `tsconfig.app.json`), so each case
must end in `return`. A `default: return null` keeps the function total.

### The `currentColor` trick

Every shape uses either `stroke="currentColor"` or `fill="currentColor"` —
**never a hard-coded color**. The actual color is decided by CSS on the parent
`.canvas-stitch` group:

```css
.canvas-stitch { color: #0f766e; }        /* teal */
.canvas-stitch:hover { color: #f59e0b; }  /* amber on hover */
```

Because SVG `currentColor` inherits down the DOM tree, changing the `color`
property on the group recolors every line and fill inside it instantly — which
is what makes the hover effect work with zero JavaScript.

---

## Styling

The CSS lives in `src/components/Canvas/Canvas.css`.

| Selector            | Purpose                                                              |
| ------------------- | -------------------------------------------------------------------- |
| `.canvas`           | Flex-fill panel, rounded border, **graph-paper dot grid** background (a `radial-gradient` tiled every 22px), `overflow: hidden` |
| `.canvas-svg`       | `display: block; width/height: 100%` so the SVG fills the panel      |
| `.canvas-row-label` | Gray `#71717a`, 13px semibold row labels                             |
| `.canvas-empty`     | Muted `#a1a1aa` hint text                                            |
| `.canvas-stitch`    | Sets the symbol `color` (teal), `cursor: pointer`, and a 150ms color transition |
| `.canvas-stitch:hover` | Recolors symbols to amber on hover                               |

Hover and tooltips:

- **Tooltip** — the `<title>` child inside each `.canvas-stitch` group; browsers
  show it natively on hover and it doubles as an accessibility label.
- **Hover color** — pure CSS `:hover` + `currentColor`, no React involved.

---

## Empty state

When `pattern.rows` is empty, the canvas renders a centered hint instead of the
row loop:

```tsx
<text className="canvas-empty" x={width / 2} y={height / 2} textAnchor="middle">
  No stitches yet — pick a stitch, then hit "Add Stitch"
</text>
```

Note the branch is `rows.length === 0`. A pattern that **has** rows but a row with
zero stitches is not "empty" — the row label is still drawn (with no symbols next
to it), which is intentional.

---

## React considerations

- **Keys**: row groups use `key={row.id}` and stitch groups use `key={stitch.id}`.
  Ids come from the CRUD modules and are unique within their arrays, so React can
  diff updates efficiently.
- **Pure render**: the component reads `pattern` and computes everything inline.
  No state, no effects, no memoization needed at this size.
- **`import type { ReactNode } from "react"`**: `ReactNode` is a type-only import,
  required by the project's `verbatimModuleSyntax` setting. Same for
  `Pattern` / `Stitch` / `StitchType`.
- **Lint**: the file exports only the `Canvas` component (the `stitchGlyph`
  helper is module-private), which keeps the react-refresh ESLint rule happy.

---

## How to extend the canvas

### Add a new stitch type

1. **`src/types/Stitch.ts`** — add the new literal to the `StitchType` union.
2. **`STITCH_LABELS`** (top of `Canvas.tsx`) — add the human-readable label for
   the tooltip. The type annotation `Record<StitchType, string>` will now force
   you to add it (compile error otherwise).
3. **`stitchGlyph`** — add a `case "yourType":` that returns the SVG shape(s).
   Reuse `strokeWidth`, `half`, `stem`, `topBar` for consistent sizing.

### Tune the look

- Symbol size / density → `size`, `stitchSpacing`, `rowGap`.
- Margins and minimum canvas → `padding`, `labelWidth`, `minWidth`, `minHeight`.
- Colors → the `color` properties in `Canvas.css`.

### Future ideas (not implemented)

- Click handling / stitch selection (add `onStitchClick` + `selectedStitchId` props).
- Draw `workedInto` (front/back loop) as a small marker on the symbol.
- Per-row or per-stitch colors.
- Render pattern metadata (name, hook size, yarn) as a header inside the SVG.
