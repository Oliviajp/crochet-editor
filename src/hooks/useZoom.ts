import { useEffect, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";

export const MIN_ZOOM = 0.25;
export const MAX_ZOOM = 4;
export const ZOOM_STEP = 1.25;

export type Pan = { x: number; y: number };

export type PanBounds = {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
};

export type DragState = {
  startX: number;
  startY: number;
  panX: number;
  panY: number;
  bounds: PanBounds;
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * How far the content may be panned in each direction.
 * remember that since it is 2 sides it should have be halved for the overflow
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

export function useZoom() {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState<Pan>({ x: 0, y: 0 });
  const [panning, setPanning] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragState | null>(null);

  // Latest values, readable from the (once-attached) wheel listener.
  const zoomRef = useRef(zoom);
  const panRef = useRef(pan);
  useEffect(() => {
    zoomRef.current = zoom;
    panRef.current = pan;
  }, [zoom, pan]);

  /**
   * Zoom by `factor`, keeping the content point under (clientX, clientY)
   * fixed on screen — i.e. zoom toward the cursor.
   */
  function zoomAt(factor: number, clientX: number, clientY: number) {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseX = clientX - (rect.left + rect.width / 2);
    const mouseY = clientY - (rect.top + rect.height / 2);

    const currentZoom = zoomRef.current;
    const nextZoom = clamp(currentZoom * factor, MIN_ZOOM, MAX_ZOOM);
    if (nextZoom === currentZoom) return;

    // Screen offset = pan + zoom * local offset. Solve for the new pan so
    // the point under the cursor keeps its screen position.
    const f = nextZoom / currentZoom;
    const currentPan = panRef.current;
    setZoom(nextZoom);
    setPan({
      x: mouseX * (1 - f) + f * currentPan.x,
      y: mouseY * (1 - f) + f * currentPan.y,
    });
  }

  function zoomBy(factor: number) {
    const canvas = canvasRef.current;
    if (!canvas) {
      setZoom((current) => clamp(current * factor, MIN_ZOOM, MAX_ZOOM));
      return;
    }
    const rect = canvas.getBoundingClientRect();
    zoomAt(factor, rect.left + rect.width / 2, rect.top + rect.height / 2);
  }

  function resetView() {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  }

  function reclampPan() {
  const bounds = getPanBounds(
    canvasRef.current,
    wrapRef.current
  );

  setPan((current) => {
    const next: Pan = {
      x: clamp(current.x, bounds.minX, bounds.maxX),
      y: clamp(current.y, bounds.minY, bounds.maxY),
    };

    return next.x === current.x && next.y === current.y
      ? current
      : next;
  });
}

  // Mouse wheel zoom. Attached natively (non-passive) because React's
  // onWheel is passive and cannot preventDefault.
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const onWheel = (event: WheelEvent) => {
      event.preventDefault();

      let delta = event.deltaY;
      if (event.deltaMode === 1) delta *= 33; // lines → pixels
      else if (event.deltaMode === 2) delta *= 100; // pages → pixels

      const factor = Math.pow(ZOOM_STEP, -delta / 100);
      zoomAt(factor, event.clientX, event.clientY);
    };

    wrap.addEventListener("wheel", onWheel, { passive: false });
    return () => wrap.removeEventListener("wheel", onWheel);
  }, []);

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

  return {
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
  } 
}
