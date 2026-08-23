# Crochet Editor — Implementation Explanation

A full walkthrough of how the app is built, from data types to UI rendering.

---

## 1. Data Model (Types)

Everything starts with three core types defined in `src/types/`:

### Stitch (`src/types/Stitch.ts`)

```ts
type Stitch = {
  id: number;               // unique, auto-incremented
  type: StitchType;         // "ch" | "slst" | "sc" | "hdc" | "dc" | "tr" | ...
  parentId: number | null;  // which stitch this is worked into (null = foundation)
  workedInto: "front" | "back" | "both";  // which loop of the parent stitch
  note: string;             // user-added annotation, shown as [note]
};
```

`StitchType` is a union of all crochet stitch abbreviations. The `note` field lets users annotate individual stitches (e.g., "increase", "skip").

### Row (`src/types/Row.ts`)

```ts
type Row = {
  id: number;
  label: string;          // e.g. "Round 1"
  stitches: Stitch[];     // ordered list of stitches in this row
};
```

A row is simply a labeled array of stitches.

### Pattern (`src/types/Pattern.ts`)

```ts
type Pattern = {
  id: number;
  name: string;
  startType: "magic-circle" | "slip-knot";
  finished: boolean;
  hookSize: number;
  yarnWeightId: string;
  yarnMaterialIds: string[];
  rows: Row[];
  Children: Pattern[];    // nested patterns (e.g. separate amigurumi parts)
};
```

The top-level object. A pattern owns an array of rows, and rows own arrays of stitches. This three-level hierarchy (Pattern → Row → Stitch) is the backbone of the entire app.

---

## 2. CRUD Logic (Pure Functions)

All state mutations go through small, pure helper functions in `src/Logic/`. React state is never mutated directly — each function returns a **new** array/object.

### Stitch CRUD (`src/Logic/Stitch/StitchCrud.ts`)

| Function | Purpose |
|----------|---------|
| `createStitch(type, parentId?, workedInto?)` | Creates a new `Stitch` with an auto-incremented `id` and empty `note` |
| `addStitch(stitches, stitch)` | Appends one stitch to an array |
| `addStitches(stitches, stitchesToAdd)` | Appends multiple stitches |
| `updateStitch(stitches, updated)` | Replaces a stitch by `id` |
| `deleteStitch(stitches, id)` | Filters out a stitch by `id` |
| `setStitchType(stitches, id, newType)` | Changes the `type` of a stitch by `id` |
| `setStitchNote(stitches, id, note)` | Sets the `note` on a stitch by `id` |

Key pattern: every function takes the current `stitches: Stitch[]` as its first argument and returns a **new** array. This makes state updates predictable and reversible.

### Row CRUD (`src/Logic/Row/RowCrud.ts`)

Same pattern — `createRow`, `addRow`, `updateRow`, `deleteRow`. Each returns a new array.

### Pattern CRUD (`src/Logic/Pattern/PatternCrud.ts`)

`createPattern`, `addPattern`, `updatePattern`, `deletePattern`. The `createPattern` function accepts defaults for all fields and initializes `finished: false` and `Children: []`.

---

## 3. State Management (App.tsx)

`src/App.tsx` is the single source of truth. It holds all state in `useState` hooks:

```ts
const [view, setView] = useState<"home" | "editor">("home");
const [pattern, setPattern] = useState<Pattern>(() => createPattern());
const [selectedTool, setSelectedTool] = useState<StitchType>("sc");
const [loopOption, setLoopOption] = useState<LoopType>("both");
const [editMode, setEditMode] = useState(false);
```

### How a stitch gets added

1. User clicks "Add Stitch" in the Toolbar → calls `handleAddStitch(count)`.
2. `handleAddStitch` creates `count` new `Stitch` objects via `createStitch(selectedTool, null, loopOption)`.
3. If the pattern has no rows yet, it creates "Round 1" with those stitches via `addRow([], createRow("Round 1", stitches))`.
4. If a last row exists, it appends the stitches to it via `addStitches(lastRow.stitches, stitches)` and `updateRow`.
5. The entire `pattern` object is replaced with `{ ...pattern, rows }`, triggering a re-render.

### How stitch editing works

Two handlers are passed down to the Canvas:

```ts
function handleStitchTypeChange(stitchId: number, newType: StitchType) {
  setPattern((p) => ({
    ...p,
    rows: p.rows.map((row) => ({
      ...row,
      stitches: setStitchType(row.stitches, stitchId, newType),
    })),
  }));
}

function handleStitchNoteChange(stitchId: number, note: string) {
  setPattern((p) => ({
    ...p,
    rows: p.rows.map((row) => ({
      ...row,
      stitches: setStitchNote(row.stitches, stitchId, note),
    })),
  }));
}
```

Both use the functional form of `setState` to safely read the previous state, then map over all rows to find and update the target stitch. This ensures every stitch update is a clean immutable operation.

---

## 4. Component Architecture

```
App
├── Header              (menu bar)
├── FileExplorer        (sidebar, placeholder)
├── Canvas              (zoom/pan wrapper, view switcher)
│   ├── SimpleVisualization   (text notation)
│   └── ChartVisualization    (SVG chart)
├── Toolbar             (stitch tools, add stitch, add row, edit toggle)
├── Properties          (pattern metadata, fasten off)
└── State               (debug panel)
```

### Data flow

`App` owns the `pattern` state and passes it down:

- **Canvas** receives `pattern`, `editMode`, `onStitchTypeChange`, `onStitchNoteChange`.
- **Canvas** chooses which visualization to render (Simple or Chart) and passes the same props through.
- **Toolbar** receives `editMode` and `onToggleEditMode` to control the edit mode toggle.
- **Properties** receives `pattern` and `onFastenOff`.

Everything flows **down**. No prop drilling beyond one level because Canvas acts as the routing layer.

---

## 5. Edit Mode

The `editMode` boolean in `App.tsx` controls a global toggle:

- **Off** (default): Canvas allows pan/zoom. Stitches display as grouped text (`SC x7, HDC`) in Simple view or as SVG symbols in Chart view. Clicking stitches does nothing.
- **On** (toolbar "Edit" button toggles it): Pan/zoom is disabled. Stitches become clickable. Clicking opens the stitch editing popover.

### Why pan is disabled in edit mode

In edit mode, pointer events on the canvas need to reach the stitch elements for click handlers. If pan/zoom is active, the `onPointerDown` handler on the canvas wrapper captures the event first, making stitches unclickable. So in edit mode, the pan handlers are conditionally removed:

```tsx
{...(!editMode && {
  onPointerDown: startPan,
  onPointerMove: movePan,
  onPointerUp: endPan,
  onPointerCancel: endPan,
})}
```

The canvas also gets a teal border in edit mode (`canvas-edit-mode` CSS class) to visually indicate the mode.

---

## 6. Simple View — Stitch Groups

`src/components/Canvas/SimpleVisualization.tsx` is the text notation view. The key concept is **stitch grouping**.

### What is a StitchGroup?

Consecutive stitches of the same type are collapsed into a group:

```ts
type StitchGroup = {
  type: StitchType;
  count: number;
  note: string;
  ids: number[];  // all stitch IDs in this group
};
```

### How grouping works (`buildGroups`)

```ts
function buildGroups(stitches: Stitch[]): StitchGroup[] {
  const groups: StitchGroup[] = [];
  for (const s of stitches) {
    const last = groups[groups.length - 1];
    if (last && last.type === s.type) {
      last.count++;
      last.ids.push(s.id);
    } else {
      groups.push({ type: s.type, count: 1, note: s.note, ids: [s.id] });
    }
  }
  return groups;
}
```

It scans the stitches left-to-right. If the current stitch has the same `type` as the last group, it increments `count` and adds the `id`. Otherwise, it starts a new group.

**Example:** `SC, SC, SC, HDC, SC, SC` → `[{type: "sc", count: 3}, {type: "hdc", count: 1}, {type: "sc", count: 2}]`

### Display format

- Single stitch: `SC`
- Multiple: `SC x7`
- With note: `SC x7 [increase]`
- Groups separated by commas: `SC x3, HDC, DC x2 [skip]`

### Rendering

The Simple view iterates over rows, calls `buildGroups` for each row's stitches, and renders each group as a `<span>`.

---

## 7. The Stitch Popover

When a user clicks a stitch group in edit mode, a popover appears. This is the core editing UI.

### Simple View Popover

Portaled to `document.body` via `createPortal` so it floats above everything:

```tsx
createPortal(
  <div className="stitch-popover" onClick={(e) => e.stopPropagation()}>
    {/* Type buttons */}
    {/* Note input */}
    {/* Done button */}
  </div>,
  document.body
)
```

**What's in the popover:**

1. **Type buttons** — CH, SLST, SC, HDC, DC, TR. Clicking one changes the stitch type. The current type is highlighted with an `.active` class.

2. **Note input** — A text field. Typing updates the note on the first stitch of the group. The note displays as `[note]` next to the group multiplier in the Simple view.

3. **Done button** — Closes the popover.

### How group editing works

When the user clicks a type button in the popover, **all stitches in the group** are updated:

```ts
function handleTypeChange(newType: StitchType) {
  for (const id of popover.group.ids) {
    onStitchTypeChange(id, newType);
  }
  setPopover({ ...popover, group: { ...popover.group, type: newType } });
}
```

So `SC x7` → clicking "HDC" → all 7 stitches change to HDC → display becomes `HDC x7`.

The note is stored on the **first** stitch of the group only (since the group collapses them, one note per group is sufficient).

### Chart View Popover

The Chart view works similarly but positions the popover based on the SVG element's bounding rect:

```ts
const rect = (e.currentTarget as SVGElement).getBoundingClientRect();
setPopover({
  stitch,
  x: rect.left + rect.width / 2,
  y: rect.top,
});
```

The popover is rendered with `position: fixed` and `transform: translateX(-50%)` to center it below the clicked stitch.

In Chart view, each stitch is individual (not grouped), so the popover edits one stitch at a time.

---

## 8. Chart View — SVG Rendering

`src/components/Canvas/ChartVisualization.tsx` renders an SVG crochet chart.

### Layout calculation

```ts
const size = 24;
const stitchSpacing = 46;
const rowGap = 64;
const labelWidth = 100;
const padding = 40;
```

- Each stitch gets a `46px` horizontal slot.
- Rows are spaced `64px` apart vertically.
- Rows are centered horizontally relative to the widest row.
- The SVG viewBox is computed to fit all content with padding.

### Stitch symbols (`stitchGlyph`)

Each stitch type has a hand-drawn SVG glyph:

| Type | Symbol |
|------|--------|
| CH | Ellipse (oval) |
| SLST | Filled dot |
| SC | Cross (×) |
| HDC | T-shape |
| DC | T-shape with a slash |
| TR | T-shape with two slashes |
| Puff | Large filled circle |
| Bobble | Filled circle with inner ring |
| Popcorn | Filled circle with a stem |

All drawn using SVG `<line>`, `<circle>`, `<ellipse>`, and `<g>` elements, centered at `(0, 0)` and positioned via `transform="translate(x y)"`.

---

## 9. Zoom & Pan (`useZoom` hook)

`src/hooks/useZoom.ts` encapsulates all zoom/pan logic:

- **State:** `zoom` (number, default 1), `pan` ({x, y}), `panning` (boolean).
- **Ref-based:** `canvasRef` (the container), `wrapRef` (the content wrapper).
- **Zoom:** `zoomBy(factor)` multiplies the zoom level. Mouse wheel zooms toward cursor position.
- **Pan:** Pointer events on the wrapper track drag gestures. Pan is clamped to prevent losing the content off-screen.
- **Reset:** `resetView()` returns to zoom=1, pan={0,0}.

The hook returns all state and handlers, which Canvas spreads onto the wrapper div.

---

## 10. Type System

The app uses TypeScript with strict mode and `verbatimModuleSyntax`. Key type patterns:

- **Union types** for domain values: `StitchType`, `LoopType`, `StartType`.
- **Type guards** in `Techniques.ts`: `isSetupTechnique()`, `isStarterTechnique()`, etc.
- **Discriminated unions** are avoided — the types are simple string unions.
- **Props types** are defined inline in each component file (not shared).

---

## 11. CSS Architecture

Each component has its own CSS file co-located next to it:

```
Canvas.css              → Canvas.tsx
SimpleVisualization.css → SimpleVisualization.tsx
Toolbar.css             → Toolbar.tsx
Properties.css          → Properties.tsx
```

No CSS modules, no CSS-in-JS — plain CSS with BEM-like class naming (`.simple-row`, `.stitch-popover-btn`, `.canvas-edit-mode`).

The popover styles live in `SimpleVisualization.css` since that's where the popover is defined (it's portaled to `document.body`, but the styles must be imported somewhere).

---

## 12. Data Flow Summary

```
User clicks "Add Stitch"
  → Toolbar calls handleAddStitch(count)
  → App creates Stitch[] via createStitch()
  → App appends to last row via addStitches()
  → setPattern({...pattern, rows}) triggers re-render
  → SimpleVisualization rebuilds groups via buildGroups()
  → Display updates

User clicks stitch group (edit mode)
  → SimpleVisualization opens popover with StitchGroup data
  → User clicks "HDC" button
  → handleTypeChange loops over group.ids
  → For each id: onStitchTypeChange(id, "hdc")
  → App maps over rows, calls setStitchType() per row
  → setPattern triggers re-render
  → Group now shows HDC x7
```

---

## 13. Key Design Decisions

1. **Immutable state everywhere** — No `push`, `splice`, or direct mutation. All CRUD functions return new arrays. This makes React re-renders predictable.

2. **Single source of truth** — All state lives in `App.tsx`. No Redux, no Context, no external state libraries. Props flow down, callbacks flow up.

3. **Pure CRUD modules** — Pattern, Row, and Stitch logic are separated into their own modules. They know nothing about React — they're just functions that take data and return new data.

4. **Popover via Portal** — The stitch editing popover uses `createPortal` to render at the document root, avoiding CSS overflow/clipping issues inside the canvas.

5. **Group-first editing** — In Simple view, users edit groups (not individual stitches). This matches how crochet patterns are written ("SC x7, HDC x2").

6. **Edit mode as a gate** — Rather than always allowing stitch clicks (which would conflict with pan/zoom), edit mode is a deliberate toggle. This keeps the default UX clean.

---

## 14. File Map

```
src/
├── App.tsx                          # State owner, handler definitions, layout
├── App.css                          # Global app layout
├── components/
│   ├── Canvas/
│   │   ├── Canvas.tsx               # View switcher, zoom wrapper, pointer events
│   │   ├── Canvas.css               # Canvas layout, zoom, edit-mode styles
│   │   ├── SimpleVisualization.tsx   # Text view: groups, popover, rendering
│   │   ├── SimpleVisualization.css   # Text view + popover styles
│   │   ├── ChartVisualization.tsx    # SVG chart: glyphs, popover, rendering
│   │   └── ChartVisualization.css    # Chart-specific styles
│   ├── Toolbar/
│   │   ├── Toolbar.tsx              # Stitch tools, add row/stitch, edit toggle
│   │   └── Toolbar.css
│   ├── Properties/
│   │   ├── Properties.tsx           # Pattern metadata, fasten off
│   │   └── Properties.css
│   ├── Header/                      # Menu bar
│   ├── FileExplorer/                # Sidebar (placeholder)
│   ├── State/                       # Debug panel
│   └── Menu/                        # Pattern home / creation
├── Logic/
│   ├── Pattern/PatternCrud.ts       # create/add/update/delete Pattern
│   ├── Row/RowCrud.ts               # create/add/update/delete Row
│   └── Stitch/StitchCrud.ts         # create/add/update/delete Stitch
├── types/
│   ├── Pattern.ts                   # Pattern type + StartType
│   ├── Row.ts                       # Row type
│   ├── Stitch.ts                    # Stitch, StitchType, LoopType
│   ├── Techniques.ts                # Technique type guards
│   ├── Yarn.ts                      # Yarn type
│   ├── HookSize.ts                  # HookSize type
│   ├── YarnMaterial.ts              # YarnMaterial type
│   └── YarnWeight.ts                # YarnWeight type
├── data/
│   ├── HookSizes.ts                 # Hook size reference table
│   ├── YarnWeights.ts               # Yarn weight categories
│   └── YarnMaterials.ts             # Fiber properties
├── hooks/
│   └── useZoom.ts                   # Zoom + pan logic (ref-based)
└── main.tsx                         # Entry point
```
