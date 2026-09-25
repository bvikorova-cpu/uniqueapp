import { forwardRef, useEffect, useRef, useState } from "react";
import HTMLFlipBook from "react-pageflip";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
      <div className="flex w-full justify-center">
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
      </div>
    </div>
  );
}

export default KlpEbookReader;
