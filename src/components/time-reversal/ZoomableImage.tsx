import { useCallback, useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Minus, Plus, RotateCcw } from "lucide-react";

const MIN_ZOOM = 1;
const MAX_ZOOM = 6;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

interface Props { src: string; alt?: string; }

export function ZoomableImage({ src, alt = "Enlarged image" }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const stateRef = useRef({ zoom, offset });
  stateRef.current = { zoom, offset };

  const pointers = useRef<Map<number, { x: number; y: number }>>(new Map());
  const pinch = useRef<{ dist: number; zoom: number; cx: number; cy: number } | null>(null);
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);

  useEffect(() => { setZoom(1); setOffset({ x: 0, y: 0 }); }, [src]);

  const zoomAt = useCallback((next: number, px: number, py: number) => {
    const { zoom: z, offset: o } = stateRef.current;
    const target = clamp(next, MIN_ZOOM, MAX_ZOOM);
    if (target === z) return;
    const k = target / z;
    setZoom(target);
    if (target === MIN_ZOOM) { setOffset({ x: 0, y: 0 }); return; }
    setOffset({ x: px - (px - o.x) * k, y: py - (py - o.y) * k });
  }, []);

  const wheelRef = useRef<(e: WheelEvent) => void>(() => {});
  wheelRef.current = (e: WheelEvent) => {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dy = e.deltaY * (e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1);
    zoomAt(stateRef.current.zoom * Math.exp(-dy * 0.0018), e.clientX - rect.left, e.clientY - rect.top);
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => { e.preventDefault(); wheelRef.current(e); };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const onPointerDown = (e: React.PointerEvent) => {
    (e.target as Element).setPointerCapture?.(e.pointerId);
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const rect = containerRef.current!.getBoundingClientRect();
      pinch.current = {
        dist: Math.hypot(a.x - b.x, a.y - b.y),
        zoom: stateRef.current.zoom,
        cx: (a.x + b.x) / 2 - rect.left,
        cy: (a.y + b.y) / 2 - rect.top,
      };
      drag.current = null;
    } else if (pointers.current.size === 1 && stateRef.current.zoom > 1) {
      const o = stateRef.current.offset;
      drag.current = { x: e.clientX, y: e.clientY, ox: o.x, oy: o.y };
    }
  };

  const onPointerMove = (e: React.PointerEvent) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch.current && pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (pinch.current.dist > 0) {
        zoomAt(pinch.current.zoom * (dist / pinch.current.dist), pinch.current.cx, pinch.current.cy);
      }
      return;
    }
    if (drag.current) {
      setOffset({ x: drag.current.ox + (e.clientX - drag.current.x), y: drag.current.oy + (e.clientY - drag.current.y) });
    }
  };

  const onPointerUp = (e: React.PointerEvent) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) drag.current = null;
  };

  const buttonZoom = (factor: number) => {
    const rect = containerRef.current?.getBoundingClientRect();
    zoomAt(stateRef.current.zoom * factor, (rect?.width ?? 0) / 2, (rect?.height ?? 0) / 2);
  };

  return (
    <div className="relative h-full w-full overflow-hidden">
      <div
        ref={containerRef}
        className="h-full w-full overflow-hidden"
        style={{ touchAction: "none", cursor: zoom > 1 ? "grab" : "zoom-in" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={(e) => {
          const rect = containerRef.current!.getBoundingClientRect();
          if (zoom > 1) { setZoom(1); setOffset({ x: 0, y: 0 }); }
          else zoomAt(2.5, e.clientX - rect.left, e.clientY - rect.top);
        }}
      >
        <img
          src={src}
          alt={alt}
          draggable={false}
          className="h-full w-full select-none object-contain"
          style={{
            transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
            transformOrigin: "0 0",
          }}
        />
      </div>
      <div className="absolute bottom-2 right-2 flex items-center gap-1 rounded-lg bg-background/90 p-1 shadow-sm">
        <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Zoom out" onClick={() => buttonZoom(1 / 1.4)}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-10 text-center text-xs font-bold tabular-nums">{Math.round(zoom * 100)}%</span>
        <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Zoom in" onClick={() => buttonZoom(1.4)}>
          <Plus className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="h-8 w-8" aria-label="Reset zoom" onClick={() => { setZoom(1); setOffset({ x: 0, y: 0 }); }}>
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default ZoomableImage;
