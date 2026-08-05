import { Card } from "@/components/ui/card";
import { Flame } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const DAY_LABELS = ["M", "T", "W", "T", "F", "S", "S"];

/** Monday-based start of the current week (local time). */
function startOfWeek(now: Date) {
  const d = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const offset = (d.getDay() + 6) % 7; // Mon = 0
  d.setDate(d.getDate() - offset);
  return d;
}

/** Real per-user chat streak based on days the user actually sent messages. */
export const AnonymousDateStreak = () => {
  const { data } = useQuery({
    queryKey: ["anon-date-streak"],
    staleTime: 30_000,
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { activeDays: DAY_LABELS.map(() => false), streak: 0 };

      const since = new Date();
      since.setDate(since.getDate() - 60);

      const { data: rows } = await supabase
        .from("anonymous_dating_messages")
        .select("created_at")
        .eq("sender_id", user.id)
        .gte("created_at", since.toISOString());

      const dayKeys = new Set(
        (rows ?? []).map((r: { created_at: string }) => {
          const d = new Date(r.created_at);
          return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        }),
      );

      const keyOf = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

      // This week's activity grid (Mon → Sun)
      const weekStart = startOfWeek(new Date());
      const activeDays = DAY_LABELS.map((_, i) => {
        const d = new Date(weekStart);
        d.setDate(weekStart.getDate() + i);
        return dayKeys.has(keyOf(d));
      });

      // Consecutive-day streak ending today (or yesterday if nothing yet today)
      let streak = 0;
      const cursor = new Date();
      if (!dayKeys.has(keyOf(cursor))) cursor.setDate(cursor.getDate() - 1);
      while (dayKeys.has(keyOf(cursor))) {
        streak += 1;
        cursor.setDate(cursor.getDate() - 1);
      }

      return { activeDays, streak };
    },
  });

  const activeDays = data?.activeDays ?? DAY_LABELS.map(() => false);
  const currentStreak = data?.streak ?? 0;

  return (
    <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <FloatingHowItWorks
        title={"Anonymous Date Streak"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <div className="flex items-center gap-2 mb-3">
        <Flame className="h-5 w-5 text-orange-500" />
        <h3 className="font-bold text-sm">Chat Streak</h3>
        <span className="ml-auto text-lg font-black text-primary">{currentStreak}</span>
      </div>
      <div className="grid grid-cols-7 gap-1.5">
        {DAY_LABELS.map((day, i) => (
          <div key={i} className="text-center">
            <span className="text-[10px] text-muted-foreground">{day}</span>
            <div className={`w-7 h-7 rounded-full flex items-center justify-center mt-1 text-xs font-medium transition-all mx-auto ${
              activeDays[i]
                ? "bg-pink-500/20 text-pink-500 border border-pink-500/30"
                : "bg-muted/30 text-muted-foreground"
            }`}>
              {activeDays[i] ? "✓" : "·"}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
