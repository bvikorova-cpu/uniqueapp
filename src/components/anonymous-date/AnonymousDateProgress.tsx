import { Card } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Real per-user Anonymous Date progress (matches, messages sent, AI credits used). */
export const AnonymousDateProgress = () => {
  const { data } = useQuery({
    queryKey: ["anon-date-progress"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { matches: 0, messages: 0, credits: 0 };

      const [matchesRes, messagesRes, usageRes] = await Promise.all([
        supabase
          .from("anonymous_dating_matches")
          .select("id", { count: "exact", head: true })
          .or(`user1_id.eq.${user.id},user2_id.eq.${user.id}`),
        supabase
          .from("anonymous_dating_messages")
          .select("id", { count: "exact", head: true })
          .eq("sender_id", user.id),
        supabase
          .from("anonymous_date_ai_usage")
          .select("credits_used")
          .eq("user_id", user.id),
      ]);

      const credits = (usageRes.data ?? []).reduce(
        (sum, row: { credits_used: number | null }) => sum + (row.credits_used ?? 0),
        0,
      );

      return {
        matches: matchesRes.count ?? 0,
        messages: messagesRes.count ?? 0,
        credits,
      };
    },
  });

  const matches = data?.matches ?? 0;
  const messages = data?.messages ?? 0;
  const credits = data?.credits ?? 0;

  const metrics = [
    { label: "Matches Found", current: matches, max: Math.max(15, matches), color: "bg-pink-500" },
    { label: "Messages Sent", current: messages, max: Math.max(100, messages), color: "bg-accent" },
    { label: "Credits Used", current: credits, max: Math.max(100, credits), color: "bg-chart-3" },
  ];

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <FloatingHowItWorks
        title={"Anonymous Date Progress"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center gap-2 mb-3">
        <TrendingUp className="h-5 w-5 text-pink-500" />
        <h3 className="font-bold text-sm">Your Progress</h3>
      </div>
      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex justify-between text-xs mb-1 gap-2">
              <span className="text-muted-foreground truncate">{m.label}</span>
              <span className="font-medium shrink-0">{m.current}/{m.max}</span>
            </div>
            <div className="h-1.5 bg-muted/30 rounded-full overflow-hidden">
              <div
                className={`h-full ${m.color} rounded-full transition-all duration-1000`}
                style={{ width: `${Math.min(100, (m.current / m.max) * 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
