import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AlertTriangle, ShieldAlert, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Anomaly {
  title: string;
  severity: "info" | "warn" | "danger";
  description: string;
  recommendation: string;
}

const SEV_STYLES: Record<string, string> = {
  info: "border-cyan-500/50 bg-cyan-500/10 text-cyan-900 dark:text-cyan-200",
  warn: "border-amber-500/50 bg-amber-500/10 text-amber-900 dark:text-amber-200",
  danger: "border-rose-500/60 bg-rose-500/15 text-rose-900 dark:text-rose-200",
};

const RISK_COLOR: Record<string, string> = {
  low: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/50 text-emerald-900 dark:text-emerald-200",
  medium: "from-amber-500/20 to-amber-500/5 border-amber-500/50 text-amber-900 dark:text-amber-200",
  high: "from-orange-500/20 to-orange-500/5 border-orange-500/50 text-orange-900 dark:text-orange-200",
  critical: "from-rose-500/30 to-rose-500/10 border-rose-500/60 text-rose-900 dark:text-rose-200",
};

export const AnomalyDetector = () => {
  const [loading, setLoading] = useState(false);
  const [risk, setRisk] = useState<string>("low");
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [lastRun, setLastRun] = useState<Date | null>(null);

  const run = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("admin-anomaly-detector", { body: {} });
      if (error) throw error;
      setRisk(data?.risk_level || "low");
      setAnomalies(data?.anomalies || []);
      setLastRun(new Date());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
  }, []);

  return (
    <>
      <FloatingHowItWorks title={"Anomaly Detector - How it works"} steps={[{ title: 'Open', desc: 'Access the Anomaly Detector section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Anomaly Detector.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="rounded-2xl border border-rose-500/20 bg-gradient-to-br from-rose-500/5 via-card/60 to-amber-500/5 backdrop-blur-xl p-5 shadow-xl">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-rose-500/15 border border-rose-500/30">
            <ShieldAlert className="h-5 w-5 text-rose-300" />
          </div>
          <div>
            <h3 className="font-semibold text-base flex items-center gap-2">
              AI Anomaly Detector
              <Sparkles className="h-3.5 w-3.5 text-rose-300" />
            </h3>
            <p className="text-xs text-muted-foreground">
              {lastRun ? `Last scan: ${lastRun.toLocaleTimeString()}` : "Scanning…"}
            </p>
          </div>
        </div>
        <Button size="sm" variant="outline" onClick={run} disabled={loading} className="bg-card/60 border-rose-500/30">
          <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Re-scan
        </Button>
      </div>

      <div
        className={`mb-4 rounded-xl border bg-gradient-to-r p-3 flex items-center justify-between ${RISK_COLOR[risk] || RISK_COLOR.low}`}
      >
        <div className="flex items-center gap-2">
          {risk === "low" ? <ShieldCheck className="h-5 w-5" /> : <AlertTriangle className="h-5 w-5" />}
          <span className="font-bold uppercase text-sm tracking-wide">Risk: {risk}</span>
        </div>
        <Badge variant="outline" className="bg-background/40">
          {anomalies.length} signal{anomalies.length !== 1 ? "s" : ""}
        </Badge>
      </div>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {anomalies.length === 0 && !loading && (
          <div className="text-center py-6 text-sm text-muted-foreground">
            ✅ No anomalies detected in the last 24h
          </div>
        )}
        {anomalies.map((a, i) => (
          <div key={i} className={`rounded-lg border p-3 ${SEV_STYLES[a.severity] || SEV_STYLES.info}`}>
            <div className="font-semibold text-sm mb-1">{a.title}</div>
            <div className="text-xs opacity-90 mb-2">{a.description}</div>
            <div className="text-xs italic opacity-80">→ {a.recommendation}</div>
          </div>
        ))}
      </div>
    </div>
    </>
  );
};
