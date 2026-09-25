import { forwardRef, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

const Page = forwardRef<HTMLDivElement, { src: string; index: number }>(({ src, index }, ref) => (
  <div ref={ref} className="bg-background">
    <div className="flex h-full w-full items-center justify-center bg-background p-1.5">
      <img
        src={src}
        alt={`Page ${index + 1}`}
        loading={index < 4 ? "eager" : "lazy"}
        draggable={false}
        className="h-full w-full select-none object-contain"
      />
    </div>
  </div>
));
Page.displayName = "KlpEbookPage";

/** Realistic page-turning reader for the Learning Encyclopedia. */
export function KlpEbookReader({ pages }: { pages: string[] }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const bookRef = useRef<any>(null);
  const [page, setPage] = useState(0);
  const [size, setSize] = useState({ w: 400, h: 566 });
  const [zoom, setZoom] = useState(1);
  const pinchStart = useRef<{ distance: number; zoom: number } | null>(null);

  const clampZoom = (value: number) => Math.min(3, Math.max(1, value));
  const touchDistance = (touches: { item(index: number): { clientX: number; clientY: number } | null }) => {
    const first = touches.item(0);
    const second = touches.item(1);
    if (!first || !second) return 0;
    return Math.hypot(second.clientX - first.clientX, second.clientY - first.clientY);
  };

  useEffect(() => {
    const calc = () => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const single = vw < 768;
      const maxW = single ? vw - 48 : (vw - 120) / 2;
      const maxH = vh - 190;
      const w = Math.max(200, Math.min(maxW, maxH * (210 / 297), 520));
      setSize({ w: Math.round(w), h: Math.round(w * (297 / 210)) });
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="flex w-full justify-center overflow-auto overscroll-contain touch-pan-x touch-pan-y"
        onTouchStart={(event) => {
          if (event.touches.length === 2) pinchStart.current = { distance: touchDistance(event.touches), zoom };
        }}
        onTouchMove={(event) => {
          if (event.touches.length !== 2 || !pinchStart.current) return;
          const distance = touchDistance(event.touches);
          if (!distance || !pinchStart.current.distance) return;
          event.preventDefault();
          setZoom(clampZoom(pinchStart.current.zoom * (distance / pinchStart.current.distance)));
        }}
        onTouchEnd={() => { pinchStart.current = null; }}
      >
        <div style={{ transform: `scale(${zoom})`, transformOrigin: "top center", marginBottom: `${(zoom - 1) * size.h}px` }}>
        {/* eslint-disable-next-line @typescript-eslint/ban-ts-comment */}
        {/* @ts-ignore library typings require every prop */}
        <HTMLFlipBook
          key={`${size.w}-${pages[0]}`}
          ref={bookRef}
          width={size.w}
          height={size.h}
          size="fixed"
          showCover
          usePortrait
          mobileScrollSupport
          maxShadowOpacity={0.5}
          drawShadow
          flippingTime={700}
          onFlip={(e: { data: number }) => setPage(e.data)}
          className="shadow-2xl"
        >
          {pages.map((src, i) => (
            <Page key={`${src}-${i}`} src={src} index={i} />
          ))}
        </HTMLFlipBook>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" aria-label="Previous page" onClick={() => bookRef.current?.pageFlip()?.flipPrev()}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="min-w-[90px] text-center text-sm text-muted-foreground">
          {page + 1} / {pages.length}
        </span>
        <Button variant="outline" size="icon" aria-label="Next page" onClick={() => bookRef.current?.pageFlip()?.flipNext()}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" aria-label="Zoom out" disabled={zoom <= 1} onClick={() => setZoom((value) => clampZoom(value - 0.25))}>
          <Minus className="h-4 w-4" />
        </Button>
        <span className="min-w-[48px] text-center text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span>
        <Button variant="outline" size="icon" aria-label="Zoom in" disabled={zoom >= 3} onClick={() => setZoom((value) => clampZoom(value + 0.25))}>
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

export default KlpEbookReader;
