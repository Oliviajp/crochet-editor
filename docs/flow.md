# Project Flow Explanation

## The Big Picture: React's One-Way Data Flow

React enforces a **unidirectional data flow** — data goes **down** (via props), events go **up** (via callback functions). This project follows that pattern strictly.

```
main.tsx → App.tsx → [Header, FileExplorer, Canvas, Toolbar, Properties, State]
                        ↑              ↑                        ↑
                     (props down)   (pattern down)          (callback props up)
```

---

## 1. Entry Point: `main.tsx` → `App.tsx`

`main.tsx` simply renders `<App />`:

```tsx
// main.tsx
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`App` is the **single source of truth**. It owns the core state — `pattern`, `selectedTool`, and `loopOption`. Every child component either receives data from `App` or sends data back to `App` through callback props.

---

## 2. Example: Adding a Stitch (App → Toolbar → App → Canvas)

This is the most important data flow in the app. Here's the full cycle:

### Step A — App creates the callback and passes it down

```tsx
// App.tsx
function handleAddStitch(count: number = 1) {
  const stitches = Array.from(
    { length: count },
    () => createStitch(selectedTool, null, loopOption)
  );
  // ...updates pattern.rows...
  setPattern({ ...pattern, rows });
}

<Toolbar
  selectedTool={selectedTool}
  setSelectedTool={setSelectedTool}
  loopOption={loopOption}
  setLoopOption={setLoopOption}
  handleAddStitch={handleAddStitch}   // ← callback passed down
  handleAddRow={handleAddRow}
/>
```

### Step B — Toolbar calls the callback when the user clicks

```tsx
// Toolbar.tsx
function addStitches() {
  handleAddStitch(stitchCount());   // calls App's function
}

<button onClick={addStitches}>Add Stitch</button>
```

### Step C — App re-renders with new state, Canvas receives it

```tsx
// App.tsx
<Canvas pattern={pattern} />   // ← new pattern flows down
```

### Step D — Canvas renders the updated visualization

```tsx
// Canvas.tsx
{view === "simple" ? (
  <SimpleVisualization pattern={pattern} />   // ← pattern used here
) : (
  <ChartVisualization pattern={pattern} />
)}
```

**The full loop:**
```
User clicks "Add Stitch"
  → Toolbar calls handleAddStitch(count)
    → App creates stitches, updates pattern.rows, calls setPattern()
      → App re-renders
        → Canvas receives new `pattern` prop
          → SimpleVisualization / ChartVisualization re-renders with new data
```

---

## 3. Example: Selecting a Stitch Tool (App ↔ Toolbar)

This is a simpler bidirectional flow — state lives in App, but the Toolbar controls it:

```tsx
// App.tsx — state + setter passed down
const [selectedTool, setSelectedTool] = useState<StitchType>("sc");

<Toolbar
  selectedTool={selectedTool}        // current value goes down
  setSelectedTool={setSelectedTool}  // setter goes down
  ...
/>
```

```tsx
// Toolbar.tsx — reads value, calls setter on click
<button
  className={selectedTool === tool.type ? "active" : undefined}
  onClick={() => setSelectedTool(tool.type)}  // ← calls App's setter
>
  {tool.label}
</button>
```

**The loop:**
```
User clicks "DC" button
  → Toolbar calls setSelectedTool("dc")
    → App re-renders with selectedTool = "dc"
      → Toolbar re-renders, "DC" button gets "active" class
```

Notice: `Toolbar` doesn't own the `selectedTool` state — it just reads and requests changes. **App decides.**

---

## 4. How `useZoom` Shares State with Canvas

`useZoom` is a **custom hook** that encapsulates all zoom/pan logic. It doesn't use context, Redux, or any external store — it returns values and functions that the calling component destructures and wires into its own JSX.

### The Hook: `useZoom()`

```tsx
// hooks/useZoom.ts
export function useZoom() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  // ...zoomAt, zoomBy, resetView, reclampPan, startPan, movePan, endPan...

  return {
    zoom, pan, panning,
    canvasRef, wrapRef,
    zoomBy, resetView, reclampPan,
    startPan, movePan, endPan,
  };
}
```

Key points about the hook:
- **`zoom` and `pan`** are regular React state — changing them triggers a re-render.
- **`canvasRef` and `wrapRef`** are refs passed to DOM elements so the hook can measure dimensions and attach event listeners.
- **`dragRef`** is a ref (not state) because dragging mid-frame doesn't need re-renders — it just reads/writes the latest coordinates.

### How Canvas Consumes It

```tsx
// Canvas.tsx
const {
  zoom, pan, panning,
  canvasRef, wrapRef,
  zoomBy, resetView, reclampPan,
  startPan, movePan, endPan,
} = useZoom();
```

Then it wires everything:

**Zoom buttons → call hook functions:**
```tsx
<button onClick={() => zoomBy(1 / ZOOM_STEP)}>−</button>
<span>{Math.round(zoom * 100)}%</span>          {/* reads zoom state */}
<button onClick={() => zoomBy(ZOOM_STEP)}>+</button>
<button onClick={resetView}>Reset</button>
```

**Panning → refs + pointer events on the wrap div:**
```tsx
<div
  ref={canvasRef}               {/* hook measures this for bounds */}
  className="canvas"
>
  <div
    ref={wrapRef}               {/* hook attaches wheel listener to this */}
    style={{
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      transition: panning ? "none" : undefined,
    }}
    onPointerDown={startPan}    {/* hook handles drag start */}
    onPointerMove={movePan}     {/* hook handles drag move */}
    onPointerUp={endPan}        {/* hook handles drag end */}
  >
    <SimpleVisualization pattern={pattern} />
  </div>
</div>
```

### The Zoom Toward Cursor Math

The most interesting part of `useZoom` is `zoomAt` — it zooms **toward the cursor** so the point under the mouse stays fixed:

```tsx
function zoomAt(factor: number, clientX: number, clientY: number) {
  const canvas = canvasRef.current;
  const rect = canvas.getBoundingClientRect();

  // Where is the mouse relative to canvas center?
  const mouseX = clientX - (rect.left + rect.width / 2);
  const mouseY = clientY - (rect.top + rect.height / 2);

  const nextZoom = clamp(currentZoom * factor, MIN_ZOOM, MAX_ZOOM);
  const f = nextZoom / currentZoom;

  // Adjust pan so the content under the cursor stays in place
  setPan({
    x: mouseX * (1 - f) + f * currentPan.x,
    y: mouseY * (1 - f) + f * currentPan.y,
  });
  setZoom(nextZoom);
}
```

The screen position of any point = `pan + zoom * localOffset`. By solving for the new `pan` that keeps the same screen position, the content under the cursor doesn't jump.

### Why Not Context or a Store?

This is a deliberate architectural choice:

| Approach | Pros | Cons |
|----------|------|------|
| **Custom hook** (current) | Zero boilerplate, composable, local to the component that needs it | Only works for one component at a time |
| React Context | Shared across many components | Unnecessary complexity for a single-component concern |
| Redux/Zustand | Persistent, undoable | Overkill for local UI state |

Since zoom/pan is **only used by Canvas**, a custom hook is the cleanest fit. If other components needed zoom state later, the hook could be lifted into a context provider.

---

## 5. Data Model: The Immutable Update Pattern

All CRUD operations follow the same pattern — they **never mutate** existing objects, they return new ones:

```tsx
// StitchCrud.ts
export function addStitches(stitches: Stitch[], stitchesToAdd: Stitch[]): Stitch[] {
  return [...stitches, ...stitchesToAdd];   // new array
}

// RowCrud.ts
export function updateRow(rows: Row[], updated: Row): Row[] {
  return rows.map((r) => r.id === updated.id ? updated : r);  // new array
}

// PatternCrud.ts
export function updatePattern(patterns: Pattern[], updated: Pattern): Pattern[] {
  return patterns.map((p) => p.id === updated.id ? updated : p);  // new array
}
```

This immutability is what makes React re-render correctly — when `setPattern({...pattern, rows})` is called, React sees a new object reference and knows to re-render `Canvas` and its children.

---

## 6. Component Communication Summary

| Component | Receives from App | Sends to App | Notes |
|-----------|-------------------|--------------|-------|
| **Header** | nothing | nothing | Pure display |
| **FileExplorer** | nothing | nothing | Placeholder |
| **Toolbar** | `selectedTool`, `setSelectedTool`, `loopOption`, `setLoopOption`, `handleAddStitch`, `handleAddRow` | Click events via callbacks | Full two-way control |
| **Canvas** | `pattern` | nothing (consumes pattern only) | Gets zoom from `useZoom` hook |
| **Properties** | nothing | nothing | Placeholder |
| **State** | nothing | nothing | Placeholder |

The pattern is simple: **App owns state, children receive values + callbacks, children call callbacks, App re-renders everyone.**
