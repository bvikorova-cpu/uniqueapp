import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart3, RefreshCw, TrendingUp, Users, FileText } from "lucide-react";
import { format, subDays } from "date-fns";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  groupId: string;
}

export function GroupInsightsPanel({ groupId }: Props) {
  const { data: insights = [], isLoading, refetch } = useQuery({
    queryKey: ["group-insights", groupId],
    queryFn: async () => {
      const since = format(subDays(new Date(), 30), "yyyy-MM-dd");
      const { data, error } = await supabase
        .from("group_insights_daily")
        .select("*")
        .eq("group_id", groupId)
        .gte("day", since)
        .order("day", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const totals = insights.reduce(
    (acc, r: any) => {
      acc.new_members += r.new_members ?? 0;
      acc.posts_count += r.posts_count ?? 0;
      acc.active_members = Math.max(acc.active_members, r.active_members ?? 0);
      return acc;
    },
    { new_members: 0, posts_count: 0, active_members: 0 }
  );

  const handleRefresh = async () => {
    const { error } = await supabase.rpc("aggregate_group_insights", {
      _day: format(new Date(), "yyyy-MM-dd"),
    });
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Insights refreshed");
    refetch();
  };

  return (
    <>
      <FloatingHowItWorks title={"Group Insights Panel - How it works"} steps={[{ title: 'Open', desc: 'Access the Group Insights Panel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Group Insights Panel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4 text-primary" /> Insights · last 30 days
        </h3>
        <Button size="sm" variant="outline" onClick={handleRefresh}>
          <RefreshCw className="h-3.5 w-3.5 mr-1" /> Refresh
        </Button>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Stat
          icon={<Users className="h-4 w-4" />}
          label="New members"
          value={totals.new_members}
        />
        <Stat
          icon={<FileText className="h-4 w-4" />}
          label="Posts"
          value={totals.posts_count}
        />
        <Stat
          icon={<TrendingUp className="h-4 w-4" />}
          label="Peak active/day"
          value={totals.active_members}
        />
      </div>

      <div className="space-y-1 max-h-64 overflow-auto">
        <div className="grid grid-cols-4 text-[10px] uppercase tracking-wider text-muted-foreground font-bold pb-1 border-b">
          <span>Day</span>
          <span className="text-right">New</span>
          <span className="text-right">Posts</span>
          <span className="text-right">Active</span>
        </div>
        {isLoading ? (
          <p className="text-xs text-muted-foreground text-center py-3">Loading…</p>
        ) : insights.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            No data yet — click Refresh to compute today.
          </p>
        ) : (
          insights.map((r: any) => (
            <div key={r.day} className="grid grid-cols-4 text-xs py-1">
              <span>{format(new Date(r.day), "MMM d")}</span>
              <span className="text-right">{r.new_members}</span>
              <span className="text-right">{r.posts_count}</span>
              <span className="text-right">{r.active_members}</span>
            </div>
          ))
        )}
      </div>
    </Card>
    </>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="bg-muted/40 rounded-lg p-3">
      <div className="flex items-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
        {icon}
        {label}
      </div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}
