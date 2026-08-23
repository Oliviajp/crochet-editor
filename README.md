# Crochet Editor

A web app for designing crochet patterns. Build your pattern row by row with
standard crochet stitch symbols, preview it as either a text-based crochet
notation or a classic SVG chart, and manage the project metadata (hook size,
yarn weight, yarn material).

Built with **React 19**, **TypeScript**, and **Vite**.

## Features

- **Interactive pattern editing** — pick a stitch tool (CH, SLST, SC, HDC, DC,
  TR), add stitches to the current round, and append new rows (`Round 1`,
  `Round 2`, ...).
- **Stitch editing popover** — toggle Edit mode, then click any stitch group
  to open a popup with type buttons (CH/SLST/SC/HDC/DC/TR) and a note input.
  Changing the type converts every stitch in the group (e.g. `SC x7` → `HDC x7`).
  Notes display next to the multiplier as `SC x7 [increase]`.
- **Two canvas views** with a live switcher:
  - **Simple** — human-readable crochet notation. Repeating groups are
    compressed, e.g. `SC, CH, SC, SC, CH, SC` renders as `(SC, CH, SC) x2`.
  - **Chart** — an SVG crochet chart with the classic symbol per stitch type
    (chain = oval, slip stitch = dot, single crochet = ×, double crochet = T
    with a slash, etc.), row labels, native hover tooltips, and rows centered
    relative to the widest row.
- **Zoom controls** — zoom in/out (25%–400%) and reset via the toolbar, or
  **mouse wheel** to zoom toward the cursor, with drag-to-pan to move the camera.
- **Pure, immutable CRUD logic** — `Pattern`, `Row`, and `Stitch` are created
  and updated through small helper modules in `src/Logic/`, so state updates in
  `App.tsx` stay predictable and testable.
- **Crochet domain types** — stitch types, loop types (`front` / `back` /
  `both`), crochet techniques (setup, starter, pattern, finishing), and yarn
  reference data (hook sizes, yarn weights, yarn materials).

## Tech Stack

| Layer        | Technology                                    |
| ------------ | --------------------------------------------- |
| UI           | React 19 (function components, hooks)         |
| Language     | TypeScript (strict, `verbatimModuleSyntax`)   |
| Build        | Vite 8                                        |
| Linting      | ESLint 10 (typescript-eslint, react-hooks)    |
| Styling      | Plain CSS per component                       |
| Rendering    | SVG for the chart view                        |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (the project is developed against a modern
  Node/npm; npm is the package manager used here)

### Install

```bash
npm install
```

### Run the dev server

```bash
npm run dev
```

Open the printed local URL (default `http://localhost:5173`) in your browser.

### Build for production

```bash
npm run build
```

Type-checks the project (`tsc -b`) and bundles with Vite into `dist/`.

### Preview the production build

```bash
npm run preview
```

### Lint

```bash
npm run lint
```

## How to Use

1. The app opens with an empty pattern and the **SC** tool selected.
2. Pick a stitch tool from the **Stitches** section of the toolbar.
3. Click **Add Stitch** to append that stitch to the current round. Use the
   number box next to it to add several at once (defaults to 1).
4. Click **New Row** to start the next round (auto-labeled `Round N`).
5. Switch between **Simple** and **Chart** views in the canvas toolbar. Use the
   **− / +** buttons or the **mouse wheel** to zoom (the wheel zooms toward the
   cursor), and drag the canvas to pan around.
6. Click **Edit** in the toolbar to enter edit mode. In edit mode, click any
   stitch group (Simple view) or individual stitch (Chart view) to open the
   editing popover — change the stitch type or add a note.
7. The **Select**, **Move**, **Magic Ring**, **Undo**, and **Redo** buttons are
   placeholders for upcoming functionality.

## Project Structure

```
src/
├── App.tsx                    # Owns the Pattern state; wires everything together
├── main.tsx                   # Entry point
├── components/
│   ├── Canvas/                # The pattern canvas
│   │   ├── Canvas.tsx         #   View switcher + zoom wrapper
│   │   ├── Canvas.css         #   Canvas layout, zoom, edit-mode styles
│   │   ├── SimpleVisualization.tsx  #   Text notation view (grouped stitches + popover)
│   │   ├── SimpleVisualization.css  #   Text view + popover styles
│   │   ├── ChartVisualization.tsx   #   SVG crochet chart view
│   │   └── ChartVisualization.css   #   Chart-specific styles
│   ├── Toolbar/               # Stitch tools, New Row / Add Stitch, Edit toggle
│   │   ├── Toolbar.tsx
│   │   └── Toolbar.css
│   ├── Header/                # File / Edit / View / Tools / Help menu bar
│   ├── FileExplorer/          # Sidebar panel
│   ├── Properties/            # Pattern metadata, fasten off
│   │   ├── Properties.tsx
│   │   └── Properties.css
│   ├── Menu/                  # Pattern home / creation screen
│   └── State/                 # State debug panel
├── hooks/
│   └── useZoom.ts             # Zoom + pan logic (ref-based)
├── Logic/                     # Pure CRUD / domain logic
│   ├── Pattern/PatternCrud.ts # create/add/update/delete Pattern
│   ├── Row/RowCrud.ts         # create/add/update/delete Row
│   └── Stitch/StitchCrud.ts   # create/add/update/delete Stitch
├── types/                     # Domain types
│   ├── Pattern.ts             # Pattern { id, name, startType, rows, ... }
│   ├── Row.ts                 # Row { id, label, stitches }
│   ├── Stitch.ts              # Stitch, StitchType, LoopType
│   ├── Techniques.ts          # Setup / Starter / Pattern / Finishing type guards
│   ├── HookSize.ts, Yarn.ts,
│   ├── YarnMaterial.ts, YarnWeight.ts
├── data/                      # Static reference data
│   ├── HookSizes.ts           # Metric/US/UK/Japan hook size table
│   ├── YarnWeights.ts         # Standard yarn weight categories
│   └── YarnMaterials.ts       # Fiber properties (warm, breathable, washable...)
├── geometry/                  # Geometry helpers
├── graph/                     # Graph data structures
├── services/                  # Service layer
├── utils/                     # General utilities
├── styles/                    # Shared styles
├── assets/                    # Static assets
└── WorkSpace/                 # Workspace layout
```

## Data Model

```
Pattern
├── id, name, hookSize
├── yarnWeightId, yarnMaterialIds
├── rows: Row[]          # the pattern instructions
└── Children: Pattern[]  # nested patterns (e.g. separate parts)

Row
├── id, label            # e.g. "Round 1"
└── stitches: Stitch[]

Stitch
├── id
├── type: StitchType     # ch | slst | sc | hdc | dc | tr | puff | bobble | popcorn
├── parentId             # which stitch this is worked into (null = foundation)
├── workedInto           # "front" | "back" | "both" (loop worked into)
└── note                 # user annotation, displayed as [note]
```

The overall pattern lifecycle follows: **Metadata → Setup (slip knot) → Start
(magic ring / chain) → Pattern (rounds) → Finishing (fasten off, weave ends,
join parts)**. See [`docs/flow.md`](docs/flow.md) for details.

## Documentation

Detailed write-ups live in [`docs/`](docs/):

| Document | Contents |
| -------- | -------- |
| [`docs/Explanation.md`](docs/Explanation.md) | Full implementation walkthrough — data model, CRUD logic, state management, components, edit mode, popover, SVG chart, and architecture |
| [`docs/flow.md`](docs/flow.md) | Application flow documentation |
| [`docs/ProjectDiagram.md`](docs/ProjectDiagram.md) | Project diagram / architecture overview |
| [`docs/Daily/`](docs/Daily/) | Daily development notes |

## Roadmap / Current Status

The app currently supports adding stitches and rows and viewing them in two
canvas modes. Planned and in-progress work:

- **Tools**: Select, Move, and Magic Ring tooling.
- **History**: Undo / Redo.
- **Editing**: ✅ stitch editing popover (type change + notes) with group support.
  Per-stitch properties (e.g. visualizing `workedInto` front/back loops) and
  deletion are planned.
- **Metadata**: wire hook size, yarn weight, and yarn material data into the
  UI (Properties panel).
- **Techniques**: setup (slip knot), starters (magic ring / chain start), and
  finishing (fasten off, join parts) support.
- **Persistence**: save/load patterns (File menu / File Explorer).
