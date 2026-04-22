import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldAlert, Check, X, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type Attribution = {
  id: string;
  referrer_id: string;
  referred_user_id: string;
  code: string;
  fraud_score: number;
  status: string;
  fraud_reasons: any;
  created_at: string;
};

export default function AdminReferralFraud() {
  const [rows, setRows] = useState<Attribution[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("flagged");

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("referral_attributions" as any)
      .select("*")
      .in("status", ["flagged", "blocked", "approved"])
      .order("created_at", { ascending: false })
      .limit(200);
    if (error) toast.error(error.message);
    else setRows((data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: "approved" | "blocked") => {
    const { error } = await supabase
      .from("referral_attributions" as any)
      .update({ status })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(`Marked as ${status}`);
    load();
  };

  const filtered = rows.filter((r) => r.status === tab);

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Referral Fraud Review"
          subtitle="Review flagged referral attributions before €5 reward is auto-credited."
          icon={ShieldAlert}
          badge="Anti-Abuse"
          breadcrumbs={[{ label: "Referral Fraud" }]}
        />
        <AdminGlassCard className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList>
                <TabsTrigger value="flagged">Flagged ({rows.filter((r) => r.status === "flagged").length})</TabsTrigger>
                <TabsTrigger value="blocked">Blocked ({rows.filter((r) => r.status === "blocked").length})</TabsTrigger>
                <TabsTrigger value="approved">Approved ({rows.filter((r) => r.status === "approved").length})</TabsTrigger>
              </TabsList>
            </Tabs>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {filtered.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">No {tab} attributions.</p>
          ) : (
            <div className="space-y-3">
              {filtered.map((r) => (
                <div key={r.id} className="rounded-lg border bg-background/40 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Badge variant={r.fraud_score >= 70 ? "destructive" : r.fraud_score >= 40 ? "default" : "secondary"}>
                          Score {r.fraud_score}
                        </Badge>
                        <Badge variant="outline" className="font-mono">{r.code}</Badge>
                        <span className="text-muted-foreground text-xs">
                          {new Date(r.created_at).toLocaleString()}
                        </span>
                      </div>
                      <div className="font-mono text-xs">
                        Referrer: {r.referrer_id.slice(0, 8)}… → Referred: {r.referred_user_id.slice(0, 8)}…
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {(r.fraud_reasons || []).map((fr: any, i: number) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {fr.reason}{fr.details?.domain ? `: ${fr.details.domain}` : ""}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    {r.status !== "approved" && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="default" onClick={() => updateStatus(r.id, "approved")}>
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                      </div>
                    )}
                    {r.status !== "blocked" && (
                      <Button size="sm" variant="destructive" onClick={() => updateStatus(r.id, "blocked")}>
                        <X className="h-4 w-4 mr-1" /> Block
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
