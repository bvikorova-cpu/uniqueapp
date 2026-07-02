import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserCog, AlertTriangle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Session {
  id: string;
  admin_id: string;
  target_user_id: string;
  reason: string;
  started_at: string;
  ended_at: string | null;
}

export const ImpersonationPanel = () => {
  const [target, setTarget] = useState("");
  const [reason, setReason] = useState("");
  const [busy, setBusy] = useState(false);
  const [sessions, setSessions] = useState<Session[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("admin_impersonation_sessions")
      .select("*")
      .order("started_at", { ascending: false })
      .limit(20);
    setSessions((data as Session[]) || []);
  };

  useEffect(() => { load(); }, []);

  const start = async () => {
    if (!target.trim() || reason.trim().length < 10) {
      toast.error("User ID/email + reason (≥10 chars) required");
      return;
    }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) { setBusy(false); return; }

    // Resolve email → user_id
    let targetUserId = target.trim();
    if (target.includes("@")) {
      const { data: prof } = await supabase
        .from("profiles")
        .select("id")
        .eq("email", target.trim().toLowerCase())
        .maybeSingle();
      if (!prof) { toast.error("User not found by email"); setBusy(false); return; }
      targetUserId = prof.id;
    }

    const { error } = await supabase.from("admin_impersonation_sessions").insert({
      admin_id: u.user.id,
      target_user_id: targetUserId,
      reason: reason.trim(),
    });
    // Also write to admin_audit_log
    await supabase.from("admin_audit_log").insert({
      admin_id: u.user.id,
      action: "impersonation_started",
      target_type: "user",
      target_id: targetUserId,
      details: { reason: reason.trim() },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    setTarget("");
    setReason("");
    toast.success("Impersonation logged. Use 'View as user' link in user details.");
    load();
  };

  const end = async (id: string) => {
    await supabase
      .from("admin_impersonation_sessions")
      .update({ ended_at: new Date().toISOString() })
      .eq("id", id);
    load();
  };

  return (
    <>
      <FloatingHowItWorks title={"Impersonation Panel - How it works"} steps={[{ title: 'Open', desc: 'Access the Impersonation Panel section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Impersonation Panel.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="border-orange-500/30 bg-card/80 backdrop-blur">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <UserCog className="w-4 h-4 text-orange-400" />
          Impersonation (View as user)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-start gap-2 text-xs p-2 bg-orange-500/10 rounded border border-orange-500/30">
          <AlertTriangle className="w-3.5 h-3.5 text-orange-400 shrink-0 mt-0.5" />
          <span className="text-orange-200">
            All impersonation sessions are permanently logged for compliance. Use only with documented reason.
          </span>
        </div>
        <Input
          placeholder="Target user ID or email"
          value={target}
          onChange={(e) => setTarget(e.target.value)}
        />
        <Textarea
          placeholder="Reason (min 10 chars) — e.g., 'Refund support ticket #1234'"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          maxLength={500}
          className="min-h-16"
        />
        <Button onClick={start} disabled={busy} size="sm" className="w-full" variant="destructive">
          {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "Start session"}
        </Button>

        <div>
          <p className="text-xs font-medium mb-2">Recent sessions</p>
          {sessions.length === 0 ? (
            <p className="text-xs text-muted-foreground">No sessions yet.</p>
          ) : (
            <ul className="space-y-1 max-h-60 overflow-y-auto">
              {sessions.map((s) => (
                <li key={s.id} className="flex items-center gap-2 text-xs p-2 bg-muted/30 rounded">
                  <div className="flex-1 min-w-0">
                    <div className="font-mono truncate">{s.target_user_id.slice(0, 12)}…</div>
                    <div className="text-muted-foreground truncate">{s.reason}</div>
                    <div className="text-muted-foreground">{new Date(s.started_at).toLocaleString()}</div>
                  </div>
                  {s.ended_at ? (
                    <Badge variant="outline" className="text-[10px]">Ended</Badge>
                  ) : (
                    <Button size="sm" variant="ghost" onClick={() => end(s.id)} className="h-6 text-[10px]">
                      End
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </CardContent>
    </Card>
    </>
  );
};
