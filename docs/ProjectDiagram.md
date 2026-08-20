# Project Diagram

## Component Tree & Data Flow

```mermaid
graph TD
    subgraph Entry
        main["main.tsx / createRoot App"]
    end

    subgraph App["App.tsx - Single Source of Truth"]
        state_pattern["useState -> pattern"]
        state_tool["useState -> selectedTool"]
        state_loop["useState -> loopOption"]
        handler_addStitch["handleAddStitch"]
        handler_addRow["handleAddRow"]
    end

    subgraph Children["Child Components"]
        Header
        FileExplorer
        Canvas
        Toolbar
        Properties
        State
    end

    subgraph CanvasInner["Canvas internals"]
        useZoom_hook["useZoom hook - zoom, pan, panning"]
        SimpleVis["SimpleVisualization"]
        ChartVis["ChartVisualization"]
    end

    subgraph ToolbarInner["Toolbar internals"]
        count_input["count input"]
    end

    main --> App
    App --> Header
    App --> FileExplorer
    App --> Canvas
    App --> Toolbar
    App --> Properties
    App --> State

    state_pattern -- "pattern prop" --> Canvas
    state_tool -- "selectedTool prop" --> Toolbar
    state_loop -- "loopOption prop" --> Toolbar
    handler_addStitch -- "handleAddStitch callback" --> Toolbar
    handler_addRow -- "handleAddRow callback" --> Toolbar

    Canvas --> useZoom_hook
    Canvas --> SimpleVis
    Canvas --> ChartVis

    Toolbar --> count_input
```

---

## Data Flow: Adding a Stitch

```mermaid
sequenceDiagram
    participant U as User
    participant TB as Toolbar
    participant AP as App.tsx
    participant CR as StitchCrud
    participant CA as Canvas
    participant SV as SimpleVisualization

    U->>TB: Clicks Add Stitch button
    TB->>TB: stitchCount parses input
    TB->>AP: handleAddStitch count
    AP->>CR: createStitch type, null, loop
    CR-->>AP: Stitch object
    AP->>AP: addStitches lastRow.stitches, stitches
    AP->>AP: updateRow pattern.rows, updatedRow
    AP->>AP: setPattern pattern, rows
    AP->>CA: re-renders with new pattern prop
    CA->>SV: passes updated pattern
    SV->>SV: formatStitches compresses output
    SV-->>U: Round 1: SC, CH, SC x2
```

---

## Data Flow: Selecting a Stitch Tool

```mermaid
sequenceDiagram
    participant U as User
    participant TB as Toolbar
    participant AP as App.tsx

    U->>TB: Clicks DC button
    TB->>AP: setSelectedTool dc
    AP->>AP: state updates, re-render
    AP-->>TB: receives selectedTool = dc
    TB->>TB: DC button gets active class
```

---

## useZoom: State & DOM Wiring

```mermaid
graph LR
    subgraph useZoom["useZoom hook"]
        zoom_state["zoom state"]
        pan_state["pan state"]
        panning_state["panning state"]
        canvasRef["canvasRef -> div.canvas"]
        wrapRef["wrapRef -> div.canvas-zoom-wrap"]
        dragRef["dragRef ref not state"]
    end

    subgraph CanvasDOM["Canvas DOM"]
        div_canvas["div.canvas"]
        div_wrap["div.canvas-zoom-wrap"]
        div_content["SimpleVis or ChartVis"]
    end

    subgraph Events["Event Handlers"]
        wheel["wheel -> zoomAt"]
        pointerDown["pointerDown -> startPan"]
        pointerMove["pointerMove -> movePan"]
        pointerUp["pointerUp -> endPan"]
    end

    canvasRef -.->|"ref canvasRef"| div_canvas
    wrapRef -.->|"ref wrapRef"| div_wrap
    div_wrap --> div_content

    wheel -.->|"addEventListener wheel"| div_wrap
    pointerDown -.->|"onPointerDown"| div_wrap
    pointerMove -.->|"onPointerMove"| div_wrap
    pointerUp -.->|"onPointerUp"| div_wrap

    zoom_state -->|"transform scale zoom"| div_wrap
    pan_state -->|"transform translate pan"| div_wrap
    panning_state -->|"className toggles panning"| div_wrap
```

---

## Zoom Toward Cursor: The Math

```mermaid
graph TD
    A["User scrolls wheel at clientX, clientY"] --> B["zoomAt factor, clientX, clientY"]
    B --> C["Calculate mouse offset from canvas center"]
    C --> D["Compute new zoom: nextZoom = clamp currentZoom * factor"]
    D --> E["Compute ratio: f = nextZoom / currentZoom"]
    E --> F["Solve for pan that keeps cursor position fixed"]
    F --> G["setZoom nextZoom + setPan newPan"]
    G --> H["React re-renders div.wrap with new transform"]
```

---

## Immutable Update Pattern

```mermaid
graph LR
    subgraph CRUD["CRUD Operations"]
        createStitch["createStitch returns new object"]
        addStitches["addStitches returns new array"]
        updateRow["updateRow returns new array via map"]
        createRow["createRow returns new object"]
        addRow["addRow returns new array via spread"]
    end

    subgraph App2["App.tsx"]
        setPattern["setPattern pattern, rows"]
    end

    subgraph React["React Render Cycle"]
        diff["React detects new reference"]
        render["Re-renders Canvas + children"]
    end

    createStitch --> addStitches --> updateRow --> setPattern
    createRow --> addRow --> setPattern
    setPattern --> diff --> render
```

---

## View Switcher: Simple vs Chart

```mermaid
graph TD
    A["App passes pattern to Canvas"] --> B{"view state? simple or chart"}
    B -- simple --> C["SimpleVisualization formatStitches compresses rows"]
    B -- chart --> D["ChartVisualization SVG rendering with stitchGlyph"]
    C --> E["Renders p elements with row labels"]
    D --> F["Renders svg with positioned glyph groups"]

    G["User clicks Simple button"] -->|setView simple| B
    H["User clicks Chart button"] -->|setView chart| B
```

---

## Full Component Architecture

```mermaid
graph TD
    subgraph Layout
        H["Header: File, Edit, View, Tools, Help"]
        M["main.main"]
        P["Properties placeholder"]
        S["State placeholder"]
    end

    subgraph MainArea["main.main area"]
        FE["FileExplorer placeholder"]
        CA["Canvas"]
        TO["Toolbar"]
    end

    subgraph CanvasBlock["Canvas"]
        CT["canvas-toolbar: Simple, Chart buttons + zoom controls"]
        CZ["canvas-zoom-wrap: transform translate + scale"]
        VIS["SimpleVisualization or ChartVisualization"]
    end

    subgraph ToolbarBlock["Toolbar"]
        ST["Stitch Tools: CH, SLST, SC, HDC, DC, TR"]
        LO["Loop Options: Both, FLO, BLO"]
        ED["Edit: New Row + Add Stitch"]
        HI["History: Undo, Redo coming soon"]
    end

    Layout
    H --> M
    M --> FE
    M --> CA
    M --> TO
    M --> P
    M --> S
    CA --> CT
    CA --> CZ
    CZ --> VIS
    TO --> ST
    TO --> LO
    TO --> ED
    TO --> HI
```
