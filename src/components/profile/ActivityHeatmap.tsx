import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Activity, Flame } from "lucide-react";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ActivityHeatmapProps {
  userId: string;
}

const DAYS = 84; // 12 weeks
const WEEKS = 12;

export const ActivityHeatmap = ({ userId }: ActivityHeatmapProps) => {
  const { data: activity } = useQuery({
    queryKey: ["activity-heatmap", userId],
    queryFn: async () => {
      const since = new Date();
      since.setDate(since.getDate() - DAYS);

      const { data } = await supabase
        .from("activity_logs")
        .select("created_at")
        .eq("user_id", userId)
        .gte("created_at", since.toISOString());

      const counts: Record<string, number> = {};
      data?.forEach((row: { created_at: string }) => {
        const day = row.created_at.split("T")[0];
        counts[day] = (counts[day] || 0) + 1;
      });
      return counts;
    },
    enabled: !!userId,
  });

  const today = new Date();
  const cells: { date: string; count: number }[] = [];
  for (let i = DAYS - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().split("T")[0];
    cells.push({ date: key, count: activity?.[key] || 0 });
  }

  const intensity = (count: number) => {
    if (count === 0) return "bg-muted/30 border-border/30";
    if (count < 2)   return "bg-amber-500/30 border-amber-400/40";
    if (count < 5)   return "bg-amber-500/55 border-amber-400/60";
    if (count < 10)  return "bg-amber-500/80 border-amber-400/80";
    return "bg-gradient-to-br from-amber-400 to-orange-500 border-amber-300 shadow-[0_0_10px_rgba(251,191,36,0.6)]";
  };

  const totalActions = cells.reduce((s, c) => s + c.count, 0);
  const activeDays = cells.filter((c) => c.count > 0).length;

  // Build column-major grid (each column = 1 week of 7 days)
  const columns: typeof cells[] = [];
  for (let w = 0; w < WEEKS; w++) {
    columns.push(cells.slice(w * 7, w * 7 + 7));
  }

  return (
    <>
      <FloatingHowItWorks title={"Activity Heatmap - How it works"} steps={[{ title: 'Open', desc: 'Access the Activity Heatmap section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Activity Heatmap.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="glass-post-card p-5 sm:p-7 mb-6 border border-amber-400/15 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-amber-400" />
          <h2 className="text-lg sm:text-xl font-black bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
            Activity Heatmap
          </h2>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="text-muted-foreground">
            <span className="font-bold text-foreground">{totalActions}</span> actions
          </span>
          <span className="inline-flex items-center gap-1 text-amber-300 font-bold">
            <Flame className="h-3 w-3" />
            {activeDays} days
          </span>
        </div>
      </div>

      <div className="overflow-x-auto pb-2">
        <div className="flex gap-1 min-w-fit">
          {columns.map((col, ci) => (
            <div key={ci} className="flex flex-col gap-1">
              {col.map((cell, ri) => (
                <motion.div
                  key={cell.date}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (ci * 7 + ri) * 0.003 }}
                  className={`w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-sm border ${intensity(cell.count)} hover:scale-125 transition-transform cursor-default`}
                  title={`${cell.date}: ${cell.count} action${cell.count === 1 ? "" : "s"}`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-end gap-1.5 mt-3 text-[10px] text-muted-foreground">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-muted/30 border border-border/30" />
        <div className="w-3 h-3 rounded-sm bg-amber-500/30 border border-amber-400/40" />
        <div className="w-3 h-3 rounded-sm bg-amber-500/55 border border-amber-400/60" />
        <div className="w-3 h-3 rounded-sm bg-amber-500/80 border border-amber-400/80" />
        <div className="w-3 h-3 rounded-sm bg-gradient-to-br from-amber-400 to-orange-500 border border-amber-300" />
        <span>More</span>
      </div>
    </div>
    </>
  );
};
