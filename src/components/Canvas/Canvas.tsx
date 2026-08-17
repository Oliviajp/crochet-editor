import "./Canvas.css";

import { useLayoutEffect, useState } from "react";

import type { Pattern } from "../../types/Pattern";
import ChartVisualization from "./ChartVisualization";
import SimpleVisualization from "./SimpleVisualization";
import { useZoom, ZOOM_STEP } from "../../hooks/useZoom";

type VisualizationType = "simple" | "chart";

type CanvasProps = {
  pattern: Pattern;
};

/**
 * How far the content may be panned in each direction.
 */
export default function Canvas({ pattern }: CanvasProps) {
  const [view, setView] = useState<VisualizationType>("simple");
  const {
    zoom,
    pan,
    panning,
    canvasRef,
    wrapRef,
    zoomBy,
    resetView,
    reclampPan,
    startPan,
    movePan,
    endPan,
  } = useZoom();

  useLayoutEffect(() => {
    reclampPan();
  }, [zoom, view]);

  return (
    <div ref={canvasRef} className="canvas">
      <div className="canvas-toolbar">
        <div className="canvas-view-switcher">
          <button
            className={view === "simple" ? "active" : undefined}
            onClick={() => setView("simple")}
          >
            Simple
          </button>
          <button
            className={view === "chart" ? "active" : undefined}
            onClick={() => setView("chart")}
          >
            Chart
          </button>
        </div>

        <div className="canvas-zoom">
          <button
            onClick={() => zoomBy(1 / ZOOM_STEP)}
            title="Zoom out"
            aria-label="Zoom out"
          >
            −
          </button>
          <span className="canvas-zoom-value">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={() => zoomBy(ZOOM_STEP)}
            title="Zoom in"
            aria-label="Zoom in"
          >
            +
          </button>
          <button onClick={resetView} title="Reset zoom and pan">
            Reset
          </button>
        </div>
      </div>

      <div
        ref={wrapRef}
        className={panning ? "canvas-zoom-wrap panning" : "canvas-zoom-wrap"}
        style={{
          transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
          transition: panning ? "none" : undefined,
        }}
        onPointerDown={startPan}
        onPointerMove={movePan}
        onPointerUp={endPan}
        onPointerCancel={endPan}
      >
        {view === "simple" ? (
          <SimpleVisualization pattern={pattern} />
        ) : (
          <ChartVisualization pattern={pattern} />
        )}
      </div>
    </div>
  );
}
