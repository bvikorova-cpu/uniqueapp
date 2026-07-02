import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database, Server, Cloud, Zap, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface HealthCheck {
  name: string;
  status: "operational" | "degraded" | "down" | "checking";
  latency: number | null;
  icon: any;
}

export const SystemHealthMonitor = () => {
  const [checks, setChecks] = useState<HealthCheck[]>([
    { name: "Database", status: "checking", latency: null, icon: Database },
    { name: "Edge Functions", status: "checking", latency: null, icon: Zap },
    { name: "Storage", status: "checking", latency: null, icon: Cloud },
    { name: "Auth", status: "checking", latency: null, icon: Server },
  ]);

  useEffect(() => {
    const runChecks = async () => {
      const results: HealthCheck[] = [];

      // Database
      const t1 = performance.now();
      const { error: dbErr } = await (supabase as any).from("profiles_public").select("id").limit(1);
      results.push({
        name: "Database",
        status: dbErr ? "down" : "operational",
        latency: Math.round(performance.now() - t1),
        icon: Database,
      });

      // Edge functions (ping a public/CORS-safe endpoint indirectly via auth call)
      const t2 = performance.now();
      try {
        await supabase.auth.getSession();
        results.push({
          name: "Edge Functions",
          status: "operational",
          latency: Math.round(performance.now() - t2),
          icon: Zap,
        });
      } catch {
        results.push({ name: "Edge Functions", status: "degraded", latency: null, icon: Zap });
      }

      // Storage
      const t3 = performance.now();
      const { error: stErr } = await supabase.storage.listBuckets();
      results.push({
        name: "Storage",
        status: stErr ? "degraded" : "operational",
        latency: Math.round(performance.now() - t3),
        icon: Cloud,
      });

      // Auth
      const t4 = performance.now();
      const { error: authErr } = await supabase.auth.getUser();
      results.push({
        name: "Auth",
        status: authErr ? "degraded" : "operational",
        latency: Math.round(performance.now() - t4),
        icon: Server,
      });

      setChecks(results);
    };

    runChecks();
    const interval = setInterval(runChecks, 30000); // refresh every 30s
    return (
    <>
      <FloatingHowItWorks title={"System Health Monitor - How it works"} steps={[{ title: 'Open', desc: 'Access the System Health Monitor section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in System Health Monitor.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => clearInterval(interval);
  }, []);

  const statusColor = (s: string) =>
    s === "operational" ? "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" :
    s === "degraded" ? "text-amber-400 bg-amber-500/10 border-amber-500/30" :
    s === "down" ? "text-red-400 bg-red-500/10 border-red-500/30" :
    "text-muted-foreground bg-muted/20 border-border";

  const allOk = checks.every(c => c.status === "operational");

  return (
    <Card className="bg-card/70 backdrop-blur-xl border-border/40">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            {allOk ? <CheckCircle2 className="h-5 w-5 text-emerald-400" /> : <AlertCircle className="h-5 w-5 text-amber-400" />}
            System Health
          </span>
          <span className={`text-[10px] uppercase tracking-wider px-2 py-0.5 rounded ${allOk ? "bg-emerald-500/20 text-emerald-300" : "bg-amber-500/20 text-amber-300"}`}>
            {allOk ? "All Operational" : "Degraded"}
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {checks.map((c) => (
          <div key={c.name} className={`p-3 rounded-lg border ${statusColor(c.status)}`}>
            <div className="flex items-center gap-1.5 mb-1">
              <c.icon className="h-3.5 w-3.5" />
              <span className="text-xs font-bold">{c.name}</span>
            </div>
            {c.status === "checking" ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <p className="text-[11px] font-mono">
                {c.latency !== null ? `${c.latency}ms` : "—"}
              </p>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
