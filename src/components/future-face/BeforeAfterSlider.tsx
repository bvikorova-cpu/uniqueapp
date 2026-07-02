import { useRef, useState, useEffect } from "react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  before: string;
  after: string;
  className?: string;
  alt?: string;
}

export default function BeforeAfterSlider({ before, after, className = "", alt = "Before / after" }: Props) {
  const [pct, setPct] = useState(50);
  const wrapRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  useEffect(() => {
    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!dragging.current || !wrapRef.current) return;
      const rect = wrapRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : (e as MouseEvent).clientX;
      const x = Math.max(0, Math.min(rect.width, clientX - rect.left));
      setPct((x / rect.width) * 100);
    };
    const onUp = () => { dragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("touchmove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("touchmove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchend", onUp);
    };
  }, []);

  return (
    <div
      ref={wrapRef}
      className={`relative w-full overflow-hidden rounded-xl select-none touch-none aspect-square bg-muted ${className}`}
    >
      <img src={after} alt={`${alt} – after`} className="absolute inset-0 w-full h-full object-cover" />
      <div className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <img src={before} alt={`${alt} – before`} className="absolute inset-0 h-full w-auto max-w-none object-cover" style={{ width: wrapRef.current?.offsetWidth || "100%" }} />
      </div>
      <div
        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_12px_rgba(0,0,0,0.6)] cursor-ew-resize"
        style={{ left: `calc(${pct}% - 2px)` }}
        onMouseDown={() => { dragging.current = true; }}
        onTouchStart={() => { dragging.current = true; }}
      >
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white border-2 border-cyan-500 grid place-items-center text-xs font-bold text-cyan-700">
          ⇄
        </div>
      </div>
      <span className="absolute top-2 left-2 text-[10px] uppercase font-bold bg-black/60 text-white px-2 py-0.5 rounded">Before</span>
      <span className="absolute top-2 right-2 text-[10px] uppercase font-bold bg-black/60 text-white px-2 py-0.5 rounded">After</span>
    </div>
  );
}
