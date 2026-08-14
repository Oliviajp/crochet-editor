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
- **Two canvas views** with a live switcher:
  - **Simple** — human-readable crochet notation. Repeating groups are
    compressed, e.g. `SC, CH, SC, SC, CH, SC` renders as `(SC, CH, SC) x2`.
  - **Chart** — an SVG crochet chart with the classic symbol per stitch type
    (chain = oval, slip stitch = dot, single crochet = ×, double crochet = T
    with a slash, etc.), row labels, native hover tooltips, and rows centered
    relative to the widest row.
- **Zoom controls** — zoom in/out (25%–400%) and reset, applied to the canvas.
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
3. Click **Add Stitch** to append that stitch to the current round.
4. Click **New Row** to start the next round (auto-labeled `Round N`).
5. Switch between **Simple** and **Chart** views in the canvas toolbar, and use
   the **− / +** buttons to zoom.
6. The **Select**, **Move**, **Magic Ring**, **Undo**, and **Redo** buttons are
   placeholders for upcoming functionality.

## Project Structure

```
src/
├── App.tsx                    # Owns the Pattern state; wires everything together
├── components/
│   ├── Canvas/                # The pattern canvas
│   │   ├── Canvas.tsx         #   View switcher + zoom wrapper
│   │   ├── SimpleVisualization.tsx  #   Text notation view (compresses repeats)
│   │   └── ChartVisualization.tsx   #   SVG crochet chart view
│   ├── Toolbar/               # Stitch tools, New Row / Add Stitch, history buttons
│   ├── Header/                # File / Edit / View / Tools / Help menu bar
│   ├── FileExplorer/          # Sidebar panel (placeholder)
│   ├── Properties/            # Properties panel (placeholder)
│   └── State/                 # State panel (placeholder)
├── Logic/                     # Pure CRUD / domain logic
│   ├── Pattern/PatternCrud.ts # create/add/update/delete Pattern
│   ├── Row/RowCrud.ts         # create/add/update/delete Row
│   └── Stitch/StitchCrud.ts   # create/add/update/delete Stitch
├── types/                     # Domain types
│   ├── Pattern.ts             # Pattern { id, name, hookSize, yarnWeightId,
│   │                          #          yarnMaterialIds, rows, Children }
│   ├── Row.ts                 # Row { id, label, stitches }
│   ├── Stitch.ts              # Stitch, StitchType, LoopType
│   ├── Techniques.ts          # Setup / Starter / Pattern / Finishing techniques
│   ├── HookSize.ts, Yarn.ts,
│   ├── YarnMaterial.ts, YarnWeight.ts
└── data/                      # Static reference data
    ├── HookSizes.ts           # Metric/US/UK/Japan hook size table
    ├── YarnWeights.ts         # Standard yarn weight categories
    └── YarnMaterials.ts       # Fiber properties (warm, breathable, washable...)
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
└── workedInto           # "front" | "back" | "both" (loop worked into)
```

The overall pattern lifecycle follows the structure sketched in
[`docs/Arquite.md`](docs/Arquite.md): **Metadata → Setup (slip knot) → Start
(magic ring / chain) → Pattern (rounds) → Finishing (fasten off, weave ends,
join parts)**.

## Documentation

Detailed write-ups live in [`docs/`](docs/):

| Document | Contents |
| -------- | -------- |
| [`docs/Arquite.md`](docs/Arquite.md) | High-level structure of a crochet project |
| [`docs/Canvas.md`](docs/Canvas.md) | How the Canvas component renders the chart, layout constants, and how to extend it |
| [`docs/SimpleVisualizationExplanation.md`](docs/SimpleVisualizationExplanation.md) | Word-by-word explanation of the Simple (text) view and its repeat-compression logic |
| [`docs/Daily/`](docs/Daily/) | Daily development notes |

## Roadmap / Current Status

The app currently supports adding stitches and rows and viewing them in two
canvas modes. Planned and in-progress work:

- **Tools**: Select, Move, and Magic Ring tooling.
- **History**: Undo / Redo.
- **Editing**: stitch selection, deletion, and per-stitch properties
  (e.g. visualizing `workedInto` front/back loops).
- **Metadata**: wire hook size, yarn weight, and yarn material data into the
  UI (Properties panel).
- **Techniques**: setup (slip knot), starters (magic ring / chain start), and
  finishing (fasten off, join parts) support.
- **Persistence**: save/load patterns (File menu / File Explorer).
