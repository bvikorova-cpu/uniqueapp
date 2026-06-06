import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Shield, ShieldCheck, ShieldX, EyeOff } from "lucide-react";
import { Navigate } from "react-router-dom";

interface Report {
  id: string;
  reporter_id: string;
  reported_id: string;
  reason: string;
  details: string | null;
  status: string;
  created_at: string;
  moderator_notes: string | null;
}

interface VerifReq {
  id: string;
  user_id: string;
  display_name: string | null;
  verification_selfie_url: string | null;
  verification_status: string;
  verification_submitted_at: string | null;
  profile_photo_url: string | null; additional_photos: string[] | null;
}

export default function AdminDatingModeration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [reports, setReports] = useState<Report[]>([]);
  const [verifs, setVerifs] = useState<VerifReq[]>([]);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user) return;
    (async () => {
      // Server-side check via SECURITY DEFINER function — RLS-safe and cannot be spoofed client-side
      const { data, error } = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
      setIsAdmin(!error && data === true);
    })();
  }, [user]);

  const load = async () => {
    const [{ data: r }, { data: v }] = await Promise.all([
      supabase
        .from("dating_reports")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("dating_profiles")
        .select("id,user_id,display_name,verification_selfie_url,verification_status,verification_submitted_at,profile_photo_url,additional_photos")
        .eq("verification_status", "pending")
        .order("verification_submitted_at", { ascending: true })
        .limit(50),
    ]);
    setReports((r as any) || []);
    setVerifs((v as any) || []);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const resolveReport = async (id: string, action: "dismissed" | "actioned") => {
    setBusyId(id);
    const { error } = await supabase
      .from("dating_reports")
      .update({
        status: action,
        resolved_at: new Date().toISOString(),
        moderator_notes: notes[id] || null,
      })
      .eq("id", id);
    setBusyId(null);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: `Report ${action}` });
    load();
  };

  const decideVerif = async (profileId: string, decision: "verified" | "rejected") => {
    setBusyId(profileId);
    const { error } = await supabase
      .from("dating_profiles")
      .update({ verification_status: decision })
      .eq("id", profileId);
    setBusyId(null);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: `Profile ${decision}` });
    load();
  };

  const unbanUser = async (userId: string) => {
    setBusyId(userId);
    const { error } = await supabase
      .from("dating_profiles")
      .update({ is_shadow_banned: false, shadow_banned_at: null })
      .eq("user_id", userId);
    setBusyId(null);
    if (error) return toast({ title: "Failed", description: error.message, variant: "destructive" });
    toast({ title: "Unbanned" });
  };

  if (isAdmin === null) {
    return <div className="container py-20 flex justify-center"><Loader2 className="h-6 w-6 animate-spin" /></div>;
  }
  if (!isAdmin) return <Navigate to="/" replace />;

  return (
    <div className="container py-8 max-w-5xl">
      <div className="flex items-center gap-3 mb-6">
        <Shield className="h-7 w-7 text-primary" />
        <h1 className="text-2xl font-bold">Dating Moderation</h1>
      </div>

      <Tabs defaultValue="reports">
        <TabsList>
          <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
          <TabsTrigger value="verifications">Verifications ({verifs.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="reports" className="space-y-3 mt-4">
          {reports.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">No pending reports 🎉</Card>
          )}
          {reports.map((r) => (
            <Card key={r.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">{r.reason}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(r.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Reporter <code>{r.reporter_id.slice(0, 8)}</code> → Reported <code>{r.reported_id.slice(0, 8)}</code>
                  </div>
                  {r.details && <p className="text-sm bg-muted/40 rounded p-2">{r.details}</p>}
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => unbanUser(r.reported_id)}
                  disabled={busyId === r.reported_id}
                  className="gap-1"
                  title="Lift shadow ban if applied"
                >
                  <EyeOff className="h-3.5 w-3.5" /> Unban
                </Button>
              </div>
              <Textarea
                placeholder="Moderator notes (optional)"
                value={notes[r.id] || ""}
                onChange={(e) => setNotes((n) => ({ ...n, [r.id]: e.target.value }))}
                className="min-h-16 text-sm"
              />
              <div className="flex justify-end gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={busyId === r.id}
                  onClick={() => resolveReport(r.id, "dismissed")}
                >
                  Dismiss
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  disabled={busyId === r.id}
                  onClick={() => resolveReport(r.id, "actioned")}
                >
                  {busyId === r.id && <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />}
                  Action
                </Button>
              </div>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="verifications" className="space-y-3 mt-4">
          {verifs.length === 0 && (
            <Card className="p-8 text-center text-muted-foreground">No pending verifications.</Card>
          )}
          {verifs.map((v) => (
            <Card key={v.id} className="p-4">
              <div className="flex items-start gap-4">
                <div className="flex gap-2">
                  {v.verification_selfie_url && (
                    <a href={v.verification_selfie_url} target="_blank" rel="noreferrer">
                      <img src={v.verification_selfie_url} alt="Selfie" className="h-32 w-32 object-cover rounded-lg border-2 border-primary" />
                    </a>
                  )}
                  {v.profile_photo_url && (
                    <a href={v.profile_photo_url} target="_blank" rel="noreferrer">
                      <img src={v.profile_photo_url} alt="Profile" className="h-32 w-32 object-cover rounded-lg border" />
                    </a>
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <div className="font-semibold">{v.display_name || "—"}</div>
                  <div className="text-xs text-muted-foreground">
                    Submitted {v.verification_submitted_at ? new Date(v.verification_submitted_at).toLocaleString() : "—"}
                  </div>
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="default"
                      onClick={() => decideVerif(v.id, "verified")}
                      disabled={busyId === v.id}
                      className="gap-1"
                    >
                      <ShieldCheck className="h-4 w-4" /> Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => decideVerif(v.id, "rejected")}
                      disabled={busyId === v.id}
                      className="gap-1"
                    >
                      <ShieldX className="h-4 w-4" /> Reject
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}
