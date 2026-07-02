import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle2, AlertTriangle, XCircle, Activity } from "lucide-react";
import { Card } from "@/components/ui/card";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Component {
  id: string;
  name: string;
  status: string;
  uptime_30d: number | null;
}

const STATUS_META: Record<string, { icon: typeof CheckCircle2; color: string; label: string }> = {
  operational: { icon: CheckCircle2, color: "text-emerald-500", label: "Operational" },
  degraded: { icon: AlertTriangle, color: "text-amber-500", label: "Degraded" },
  outage: { icon: XCircle, color: "text-destructive", label: "Outage" },
  maintenance: { icon: Activity, color: "text-blue-500", label: "Maintenance" },
};

export const SystemStatusWidget = () => {
  const [components, setComponents] = useState<Component[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("system_status_components")
        .select("id, name, status, uptime_30d")
        .order("display_order");
      setComponents(data ?? []);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("system-status")
      .on("postgres_changes", { event: "*", schema: "public", table: "system_status_components" }, load)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const allOk = components.every((c) => c.status === "operational");
  const overallMeta = allOk ? STATUS_META.operational : STATUS_META.degraded;
  const OverallIcon = overallMeta.icon;

  if (loading) return null;

  return (
    <Card className="p-5 mb-6 border-2">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`relative flex h-3 w-3 ${allOk ? "" : ""}`}>
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-60 ${allOk ? "bg-emerald-500" : "bg-amber-500"}`} />
            <span className={`relative inline-flex rounded-full h-3 w-3 ${allOk ? "bg-emerald-500" : "bg-amber-500"}`} />
          </div>
          <h3 className="font-bold text-base">
            {allOk ? "All systems operational" : "Some systems experiencing issues"}
          </h3>
        </div>
        <OverallIcon className={`h-5 w-5 ${overallMeta.color}`} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {components.map((c) => {
          const meta = STATUS_META[c.status] ?? STATUS_META.operational;
          const Icon = meta.icon;
          return (
            <div key={c.id} className="rounded-lg border bg-muted/30 p-3">
              <div className="flex items-center gap-1.5 mb-1">
                <Icon className={`h-3.5 w-3.5 ${meta.color}`} />
                <span className="text-[10px] uppercase tracking-wide font-bold text-muted-foreground">{meta.label}</span>
              </div>
              <p className="text-sm font-semibold leading-tight">{c.name}</p>
              {c.uptime_30d != null && (
                <p className="text-[10px] text-muted-foreground mt-0.5">{c.uptime_30d}% uptime · 30d</p>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
};
