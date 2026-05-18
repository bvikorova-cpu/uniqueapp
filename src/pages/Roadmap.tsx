import { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowUp, CheckCircle2, Rocket, Wrench } from "lucide-react";
import { toast } from "sonner";

interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: "shipped" | "in_progress" | "planned";
  shippedAt?: string;
}

const ITEMS: RoadmapItem[] = [
  { id: "credits-checkout", title: "Universal credit checkout router", description: "Single Stripe endpoint for all hubs.", status: "shipped", shippedAt: "2026-05-10" },
  { id: "victory-cards", title: "Shareable victory cards", description: "Generate 1080×1080 social cards from wins.", status: "shipped", shippedAt: "2026-05-15" },
  { id: "streak-multiplier", title: "Daily streak multiplier", description: "Bonus credits at 7/30/100 days.", status: "shipped", shippedAt: "2026-05-15" },
  { id: "comeback-bonus", title: "Comeback bonus", description: "Auto +5 credits when returning after 7 days.", status: "shipped", shippedAt: "2026-05-18" },
  { id: "creator-analytics", title: "Creator analytics", description: "Mini dashboard with views/likes/comments.", status: "in_progress" },
  { id: "mobile-bottom-nav", title: "Mobile bottom tab bar", description: "Persistent 5-tab navigation on mobile.", status: "shipped", shippedAt: "2026-05-18" },
  { id: "direct-messages", title: "Direct messages between users", description: "1:1 DM threads with read receipts.", status: "planned" },
  { id: "scheduled-posts", title: "Scheduled posts", description: "Queue posts for future publishing.", status: "planned" },
  { id: "pwa-offline", title: "Full PWA offline shell", description: "Install + offline cached pages.", status: "planned" },
  { id: "blue-verification", title: "Public verification badge", description: "Verified creators get blue checkmark.", status: "planned" },
];

const STATUS_META = {
  shipped: { label: "Shipped", icon: CheckCircle2, color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30" },
  in_progress: { label: "In progress", icon: Wrench, color: "bg-amber-500/15 text-amber-400 border-amber-500/30" },
  planned: { label: "Planned", icon: Rocket, color: "bg-primary/15 text-primary border-primary/30" },
};

const VOTES_KEY = "unique_roadmap_votes";

export default function Roadmap() {
  const [votes, setVotes] = useState<Record<string, number>>({});
  const [voted, setVoted] = useState<Set<string>>(new Set());

  useEffect(() => {
    try {
      const v = JSON.parse(localStorage.getItem(VOTES_KEY) || "{}");
      setVotes(v.counts || {});
      setVoted(new Set(v.voted || []));
    } catch { /* noop */ }
  }, []);

  const vote = (id: string) => {
    if (voted.has(id)) {
      toast.info("You've already voted for this");
      return;
    }
    const nextCounts = { ...votes, [id]: (votes[id] ?? 0) + 1 };
    const nextVoted = new Set(voted); nextVoted.add(id);
    setVotes(nextCounts); setVoted(nextVoted);
    localStorage.setItem(VOTES_KEY, JSON.stringify({ counts: nextCounts, voted: [...nextVoted] }));
    toast.success("Vote recorded — thanks for shaping the roadmap!");
  };

  const grouped = (status: RoadmapItem["status"]) => ITEMS.filter((i) => i.status === status);

  return (
    <>
      <Helmet>
        <title>Roadmap & Changelog · Unique</title>
        <meta name="description" content="See what's shipped, in progress and planned. Vote on the features you want next." />
        <link rel="canonical" href="/roadmap" />
      </Helmet>
      <main className="container max-w-4xl py-10 md:py-16">
        <header className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Public Roadmap
          </h1>
          <p className="mt-3 text-muted-foreground max-w-xl mx-auto">
            Transparency by design — what we shipped, what we're building, and what's coming. Vote to influence priority.
          </p>
        </header>

        {(["in_progress", "planned", "shipped"] as const).map((status) => {
          const meta = STATUS_META[status];
          const items = grouped(status);
          if (!items.length) return null;
          return (
            <section key={status} className="mb-10">
              <h2 className="flex items-center gap-2 text-lg font-semibold mb-3">
                <meta.icon className="h-5 w-5" /> {meta.label}
                <Badge variant="outline" className="ml-1">{items.length}</Badge>
              </h2>
              <div className="space-y-3">
                {items.map((item) => (
                  <Card key={item.id} className="bg-card/60 backdrop-blur-xl border-border/50 hover:border-primary/40 transition-colors">
                    <CardHeader className="pb-2 flex-row items-start gap-3 space-y-0">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-base flex items-center gap-2 flex-wrap">
                          {item.title}
                          <Badge variant="outline" className={meta.color}>{meta.label}</Badge>
                          {item.shippedAt && (
                            <span className="text-[11px] font-normal text-muted-foreground">{item.shippedAt}</span>
                          )}
                        </CardTitle>
                      </div>
                      {status !== "shipped" && (
                        <Button
                          size="sm"
                          variant={voted.has(item.id) ? "secondary" : "outline"}
                          onClick={() => vote(item.id)}
                          className="shrink-0"
                        >
                          <ArrowUp className="h-4 w-4 mr-1" />
                          {votes[item.id] ?? 0}
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0 text-sm text-muted-foreground">
                      {item.description}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </>
  );
}
