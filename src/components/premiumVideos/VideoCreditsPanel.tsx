import { Coins, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { VIDEO_CREDIT_PACKS, useVideoCredits } from "@/hooks/useVideoCredits";

export default function VideoCreditsPanel() {
  const { balance, loading, buying, purchase } = useVideoCredits();

  return (
    <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/10 via-card/60 to-accent/5 backdrop-blur-xl">
      <CardHeader className="pb-2">
        <CardTitle className="flex flex-wrap items-center justify-between gap-2 text-base">
          <span className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-primary" /> Video Credits
          </span>
          <Badge variant="secondary" className="text-sm">
            {loading ? "…" : balance} credits
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">
          This section has its own wallet — video credits are used to unlock videos and to promote your own uploads.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {VIDEO_CREDIT_PACKS.map((p) => (
            <div
              key={p.credits}
              className="rounded-xl border border-border/60 bg-background/50 p-4 text-center"
            >
              <p className="text-xs uppercase tracking-wide text-muted-foreground">{p.label}</p>
              <p className="text-2xl font-black">{p.credits}</p>
              <p className="mb-3 text-xs text-muted-foreground">credits · €{p.priceEur}</p>
              <Button
                size="sm"
                className="w-full"
                onClick={() => purchase(p.credits)}
                disabled={buying !== null}
              >
                {buying === p.credits ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  `Buy for €${p.priceEur}`
                )}
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
