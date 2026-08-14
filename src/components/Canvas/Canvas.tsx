import "./Canvas.css";

import { useLayoutEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

import type { Pattern } from "../../types/Pattern";
import ChartVisualization from "./ChartVisualization";
import SimpleVisualization from "./SimpleVisualization";

type VisualizationType = "simple" | "chart";

const MIN_ZOOM = 0.25;
const MAX_ZOOM = 4;
const ZOOM_STEP = 1.25;

type Pan = { x: number; y: number };

type PanBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

type DragState = {
  startX: number;
  startY: number;
  panX: number;
  panY: number;
  bounds: PanBounds;
};

type CanvasProps = {
  pattern: Pattern;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * How far the content may be panned in each direction.
 *
 * The content may only be moved far enough that it stays reachable:
 * when it is smaller than the canvas it stays centered (range 0), and
 * when it overflows the canvas you can scroll around it up to the
 * overflow amount on each side.
 */
function getPanBounds(
  canvas: HTMLElement | null,
  wrap: HTMLElement | null
): PanBounds {
  if (!canvas || !wrap) {
    return { minX: 0, maxX: 0, minY: 0, maxY: 0 };
  }

  const canvasRect = canvas.getBoundingClientRect();
  const content = wrap.firstElementChild;
  const contentRect = content ? content.getBoundingClientRect() : canvasRect;

  const overflowX = Math.max(0, (contentRect.width - canvasRect.width) / 2);
  const overflowY = Math.max(0, (contentRect.height - canvasRect.height) / 2);

  return {
    minX: -overflowX,
    maxX: overflowX,
    minY: -overflowY,
    maxY: overflowY,
  };
}

export default function Canvas({ pattern }: CanvasProps) {
  const [view, setView] = useState<VisualizationType>("simple");
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  // Re-clamp the pan whenever the content size changes (zoom or view).
  useLayoutEffect(() => {
    const bounds = getPanBounds(canvasRef.current, wrapRef.current);
    setPan((current) => {
      const next: Pan = {
        x: clamp(current.x, bounds.minX, bounds.maxX),
        y: clamp(current.y, bounds.minY, bounds.maxY),
      };
      return next.x === current.x && next.y === current.y ? current : next;
    });
  }, [zoom, view]);

  function zoomBy(factor: number) {
    setZoom((current) =>
      Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, current * factor))
    );
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function startPan(event: ReactPointerEvent<HTMLDivElement>) {
    if (event.button !== 0) return;
    const wrap = wrapRef.current;
    if (!wrap) return;

    dragRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      panX: pan.x,
      panY: pan.y,
      bounds: getPanBounds(canvasRef.current, wrap),
    };

    setPanning(true);
    wrap.setPointerCapture(event.pointerId);
    event.preventDefault();
  }

  function movePan(event: ReactPointerEvent<HTMLDivElement>) {
    const drag = dragRef.current;
    if (!drag) return;

    setPan({
      x: clamp(
        drag.panX + (event.clientX - drag.startX),
        drag.bounds.minX,
        drag.bounds.maxX
      ),
      y: clamp(
        drag.panY + (event.clientY - drag.startY),
        drag.bounds.minY,
        drag.bounds.maxY
      ),
    });
  }

  function endPan() {
    dragRef.current = null;
    setPanning(false);
  }

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
