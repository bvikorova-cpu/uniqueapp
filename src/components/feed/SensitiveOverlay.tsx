import { useState, ReactNode } from "react";
import { Eye, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SensitiveOverlayProps {
  isSensitive?: boolean;
  reason?: string | null;
  children: ReactNode;
}

/**
 * Wraps media in a blur overlay if `isSensitive`.
 * User clicks "Show" to reveal. Choice is per-render (not persisted) — minimal scope.
 */
export const SensitiveOverlay = ({ isSensitive, reason, children }: SensitiveOverlayProps) => {
  const [revealed, setRevealed] = useState(false);
  if (!isSensitive || revealed) return <>{children}</>;
  return (
    <div className="relative">
      <div className="blur-2xl pointer-events-none select-none scale-105">{children}</div>
      <div className="absolute inset-0 bg-background/40 flex flex-col items-center justify-center gap-3 p-6 text-center">
        <AlertTriangle className="h-8 w-8 text-amber-400" />
        <div>
          <p className="font-semibold">Sensitive content</p>
          {reason && <p className="text-sm text-muted-foreground mt-1">{reason}</p>}
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={(e) => {
            e.stopPropagation();
            setRevealed(true);
          }}
        >
          <Eye className="h-4 w-4 mr-2" /> Show anyway
        </Button>
      </div>
    </div>
  );
};
