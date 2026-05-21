import { useEffect } from "react";
import { Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { loadMonetagZone, MONETAG_ZONES } from "@/lib/monetag";

/**
 * Native-looking sponsored card injected every 20th post in the Wall feed.
 * Triggers the Monetag In-Page Push zone (11037514) the first time it mounts.
 */
const MonetagInFeedAd = ({ slotIndex }: { slotIndex: number }) => {
  useEffect(() => {
    loadMonetagZone(MONETAG_ZONES.IN_PAGE_PUSH);
  }, []);

  return (
    <Card className="relative overflow-hidden border border-primary/20 bg-gradient-to-br from-card/90 to-card/70 backdrop-blur-xl">
      <CardContent className="p-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center shrink-0">
          <Sparkles className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground">Sponsored</p>
          <p className="text-xs text-muted-foreground truncate">
            Allow notifications to support the creators on Unique ✨
          </p>
        </div>
        <span className="text-[10px] uppercase tracking-wider text-muted-foreground/70">
          Ad #{slotIndex}
        </span>
      </CardContent>
    </Card>
  );
};

export default MonetagInFeedAd;
