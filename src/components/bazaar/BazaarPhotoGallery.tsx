import { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  images: string[];
  alt: string;
  className?: string;
}

const FALLBACK = "https://images.unsplash.com/photo-1581235720704-06d3acfcb36f?w=800&h=600&fit=crop";

export const BazaarPhotoGallery = ({ images, alt, className }: Props) => {
  const [idx, setIdx] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const list = images.length > 0 ? images : [FALLBACK];
  const safeIdx = Math.min(idx, list.length - 1);

  const next = () => setIdx((i) => (i + 1) % list.length);
  const prev = () => setIdx((i) => (i - 1 + list.length) % list.length);

  const onTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStart == null) return;
    const dx = e.changedTouches[0].clientX - touchStart;
    if (dx > 40) prev();
    else if (dx < -40) next();
    setTouchStart(null);
  };

  return (
    <>
      <FloatingHowItWorks title="How Bazaar Photo Gallery works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div className={cn("space-y-2", className)}>
      <div
        className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden bg-muted"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <img src={list[safeIdx]} alt={alt} className="w-full h-full object-cover" />
        {list.length > 1 && (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
              onClick={prev}
              aria-label="Previous photo"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-background/80 hover:bg-background"
              onClick={next}
              aria-label="Next photo"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-background/70 px-2 py-0.5 rounded-full text-xs">
              {safeIdx + 1} / {list.length}
            </div>
          </>
        )}
      </div>
      {list.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {list.map((src, i) => (
            <button
              key={src + i}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                "shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition",
                i === safeIdx ? "border-primary" : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <img src={src} alt={`${alt} ${i + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
    </>
    );
};

export default BazaarPhotoGallery;
