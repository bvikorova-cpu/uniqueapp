import { Sparkles, MessageSquare, Share2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useStreamHighlights, type StreamHighlight } from "@/hooks/useStreamHighlights";
import { toast } from "sonner";

interface Props {
  streamId: string;
  streamTitle?: string;
}

function shareHighlight(h: StreamHighlight, streamTitle?: string) {
  const label =
    h.kind === "top_tip"
      ? `💎 Top tip €${((h.payload?.amount_cents ?? 0) / 100).toFixed(2)}${h.payload?.message ? ` — "${h.payload.message}"` : ""}`
      : `🔥 ${h.title}${h.payload?.sample_messages?.length ? ` — "${h.payload.sample_messages[0]}"` : ""}`;
  const url = `${window.location.origin}/live/${h.stream_id}?h=${h.id}`;
  const text = `${streamTitle ? streamTitle + " — " : ""}${label}`;
  if (navigator.share) {
    navigator.share({ title: streamTitle ?? "Stream highlight", text, url }).catch(() => {});
  } else {
    navigator.clipboard.writeText(`${text}\n${url}`);
    toast.success("Highlight copied to clipboard");
  }
}

export function StreamHighlights({ streamId, streamTitle }: Props) {
  const { data: highlights = [], isLoading } = useStreamHighlights(streamId);

  if (isLoading) return null;
  if (!highlights.length) return null;

  const tips = highlights.filter((h) => h.kind === "top_tip");
  const moments = highlights.filter((h) => h.kind === "chat_moment");

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-bold text-lg">Stream Highlights</h3>
        <Badge variant="secondary" className="ml-auto">Auto-generated</Badge>
      </div>

      {tips.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Biggest tips</p>
          {tips.map((h) => (
            <div
              key={h.id}
              className="flex items-start gap-3 p-3 rounded-lg border-l-4 bg-gradient-to-r from-amber-500/10 to-transparent"
              style={{ borderColor: h.payload?.color ?? "hsl(var(--primary))" }}
            >
              <div className="flex-1">
                <div className="font-bold text-sm">
                  €{((h.payload?.amount_cents ?? 0) / 100).toFixed(2)}
                </div>
                {h.payload?.message && (
                  <p className="text-sm text-muted-foreground mt-1">"{h.payload.message}"</p>
                )}
              </div>
              <Button size="sm" variant="ghost" onClick={() => shareHighlight(h, streamTitle)}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {moments.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-wide text-muted-foreground font-semibold">Chat peaks</p>
          {moments.map((h) => (
            <div key={h.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/40">
              <MessageSquare className="h-4 w-4 mt-0.5 text-primary" />
              <div className="flex-1">
                <div className="text-sm font-semibold">{h.title}</div>
                {h.payload?.sample_messages?.slice(0, 2).map((m: string, i: number) => (
                  <p key={i} className="text-xs text-muted-foreground truncate">"{m}"</p>
                ))}
              </div>
              <Button size="sm" variant="ghost" onClick={() => shareHighlight(h, streamTitle)}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
