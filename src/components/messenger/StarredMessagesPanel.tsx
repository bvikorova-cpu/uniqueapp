import { useStarredMessages } from "@/hooks/useStarredMessages";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, X } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

export function StarredMessagesPanel() {
  const { data, isLoading, unstar } = useStarredMessages();

  return (
    <Card className="bg-card/50 backdrop-blur border-border/50">
      <FloatingHowItWorks
        title={"Starred Messages Panel"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Star className="h-4 w-4 text-primary" />
          Starred Messages
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <p className="text-sm text-muted-foreground">Loading…</p>
        ) : !data || data.length === 0 ? (
          <p className="text-sm text-muted-foreground">No starred messages yet.</p>
        ) : (
          <ScrollArea className="h-[420px] pr-2">
            <ul className="space-y-2">
              {data.map((s: any) => (
                <li key={s.id} className="rounded-lg border border-border/40 bg-background/40 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm break-words">{s.messages?.content ?? "(message removed)"}</p>
                      {s.note && <p className="mt-1 text-xs italic text-muted-foreground">Note: {s.note}</p>}
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {new Date(s.created_at).toLocaleString()}
                      </p>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => unstar(s.id)} className="h-7 w-7">
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}
