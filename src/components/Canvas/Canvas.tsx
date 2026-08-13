import "./Canvas.css";

import { useState } from "react";

import type { Pattern } from "../../types/Pattern";
import ChartVisualization from "./ChartVisualization";
import SimpleVisualization from "./SimpleVisualization";

type VisualizationType = "simple" | "chart";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.25;

type CanvasProps = {
  pattern: Pattern;
};

export default function Canvas({ pattern }: CanvasProps) {
  const [view, setView] = useState<VisualizationType>("simple");
  const [zoom, setZoom] = useState(1);

  function zoomBy(factor: number) {
    setZoom((current) =>
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current * factor))
    );
  }

  return (
    <div className="canvas">
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
          <button onClick={() => setZoom(1)} title="Reset zoom">
            Reset
          </button>
        </div>
      </div>

      <div
        className="canvas-zoom-wrap"
        style={{ transform: `scale(${zoom})` }}
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
