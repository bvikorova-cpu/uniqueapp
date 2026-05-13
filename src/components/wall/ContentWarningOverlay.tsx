import { useState } from "react";
import { AlertTriangle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export const ContentWarningOverlay = ({
  reason,
  children,
}: {
  reason?: string;
  children: React.ReactNode;
}) => {
  const [revealed, setRevealed] = useState(false);

  if (revealed) return <>{children}</>;

  return (
    <div className="relative overflow-hidden rounded-lg border border-amber-500/30 bg-background">
      <div className="absolute inset-0 backdrop-blur-2xl bg-background/60 z-10 flex flex-col items-center justify-center p-6 text-center gap-3">
        <AlertTriangle className="h-8 w-8 text-amber-500" />
        <p className="font-semibold text-sm">Sensitive content</p>
        {reason && <p className="text-xs text-muted-foreground max-w-xs">{reason}</p>}
        <Button size="sm" variant="outline" onClick={() => setRevealed(true)}>
          <Eye className="h-4 w-4 mr-1" /> Reveal
        </Button>
      </div>
      <div className="opacity-30 pointer-events-none select-none">{children}</div>
    </div>
  );
};
