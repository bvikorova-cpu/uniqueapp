import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Activity, AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { Helmet } from "react-helmet-async";

interface Incident {
  id: string;
  title: string;
  description: string | null;
  severity: string;
  components: string[];
  status: string;
  started_at: string;
  resolved_at: string | null;
}

const COMPONENTS = [
  { id: "api", label: "API & Edge Functions" },
  { id: "auth", label: "Authentication" },
  { id: "db", label: "Database" },
  { id: "storage", label: "Storage / Uploads" },
  { id: "stripe", label: "Stripe Payments" },
  { id: "ai", label: "AI Tools (Gateway)" },
  { id: "realtime", label: "Realtime / Chat" },
];

const SEVERITY_STYLE: Record<string, string> = {
  minor: "bg-blue-500/15 text-blue-600 border-blue-500/30",
  major: "bg-amber-500/15 text-amber-600 border-amber-500/30",
  critical: "bg-red-500/15 text-red-600 border-red-500/30",
};

/** Public status page — no auth required. */
const StatusPage = () => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await supabase
          .from("status_incidents")
          .select("*")
          .order("started_at", { ascending: false })
          .limit(30);
        setIncidents((data as Incident[]) || []);
      } catch (e) {
        console.error("[status] failed to load incidents", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);


  const active = incidents.filter((i) => !i.resolved_at);
  const allOk = active.length === 0;
  const affected = new Set(active.flatMap((i) => i.components));

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>System Status — Unique</title>
        <meta name="description" content="Live status of Unique services: API, payments, AI, realtime and more." />
        <link rel="canonical" href="https://uniqueapp.fun/status" />
      </Helmet>

      <div className="container max-w-3xl mx-auto px-4 py-10 pt-24">
        <h1 className="text-3xl font-black mb-2 flex items-center gap-2">
          <Activity className="h-7 w-7 text-primary" /> System Status
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Real-time visibility into every Unique platform component.
        </p>

        <Card
          className={`border-2 mb-6 ${
            allOk ? "border-emerald-500/40 bg-emerald-500/5" : "border-amber-500/40 bg-amber-500/5"
          }`}
        >
          <CardContent className="flex items-center gap-3 py-5">
            {allOk ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            )}
            <div>
              <p className="font-black text-lg">
                {allOk ? "All systems operational" : `${active.length} active incident${active.length === 1 ? "" : "s"}`}
              </p>
              <p className="text-xs text-muted-foreground">
                Last updated {new Date().toLocaleTimeString()}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Components</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {COMPONENTS.map((c) => {
              const down = affected.has(c.id);
              return (
                <div key={c.id} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0">
                  <span className="text-sm">{c.label}</span>
                  <Badge variant={down ? "destructive" : "secondary"} className="text-[10px]">
                    {down ? "Degraded" : "Operational"}
                  </Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Incident history</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
            ) : incidents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No incidents reported yet. 🎉</p>
            ) : (
              <div className="space-y-3">
                {incidents.map((i) => (
                  <div key={i.id} className="border border-border/40 rounded-lg p-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-bold text-sm">{i.title}</h3>
                      <Badge className={`text-[10px] border ${SEVERITY_STYLE[i.severity] || ""}`} variant="outline">
                        {i.severity}
                      </Badge>
                    </div>
                    {i.description && <p className="text-xs text-muted-foreground">{i.description}</p>}
                    <div className="flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>
                        Started {new Date(i.started_at).toLocaleString()}
                        {i.resolved_at && ` · Resolved ${new Date(i.resolved_at).toLocaleString()}`}
                      </span>
                      <Badge variant={i.resolved_at ? "secondary" : "default"} className="text-[9px]">
                        {i.resolved_at ? "Resolved" : i.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-xs text-muted-foreground mt-8">
          Subscribe to updates via our <a className="text-primary hover:underline" href="/contact">contact channels</a>.
        </p>
      </div>
    </div>
  );
};

export default StatusPage;
