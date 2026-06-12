import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeCheck, ShieldAlert, ExternalLink, Trash2, Plus, Flag, Check, X, Pause } from "lucide-react";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

const AdminMusicianVerifications = () => {
  const [pending, setPending] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [reserved, setReserved] = useState<any[]>([]);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [newReserved, setNewReserved] = useState({ display: "", reason: "" });
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [p, r, res] = await Promise.all([
      supabase.from("musician_profiles").select("*").eq("verification_status", "pending").order("verification_requested_at", { ascending: false }),
      supabase.from("concert_reports").select("*, live_concert_streams(title, musician_id, status, musician_profiles(stage_name, user_id, verified))").eq("status", "pending").order("created_at", { ascending: false }),
      supabase.from("reserved_artist_names").select("*").order("display_name"),
    ]);
    setPending(p.data || []);
    setReports(r.data || []);
    setReserved(res.data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const reviewMusician = async (id: string, approve: boolean) => {
    const { data: { session } } = await supabase.auth.getSession();
    const { error } = await supabase.from("musician_profiles").update({
      verified: approve,
      verification_status: approve ? "verified" : "rejected",
      verification_reviewed_at: new Date().toISOString(),
      verification_reviewed_by: session?.user.id,
      verification_notes: notes[id] || null,
    }).eq("id", id);
    if (error) return toast.error(error.message);
    toast.success(approve ? "Musician verified ✓" : "Verification rejected");
    load();
  };

  const reviewReport = async (reportId: string, action: "dismissed" | "suspended_musician") => {
    const { data: { session } } = await supabase.auth.getSession();
    const report = reports.find((r) => r.id === reportId);
    if (action === "suspended_musician" && report) {
      const musicianId = report.live_concert_streams?.musician_id;
      if (musicianId) {
        await supabase.from("musician_profiles").update({
          suspended: true,
          suspended_reason: `Suspended after report: ${report.category}`,
        }).eq("id", musicianId);
      }
      // also end the stream
      await supabase.from("live_concert_streams").update({ status: "ended" }).eq("id", report.concert_id);
    }
    const { error } = await supabase.from("concert_reports").update({
      status: "reviewed",
      action_taken: action,
      reviewed_at: new Date().toISOString(),
      reviewed_by: session?.user.id,
    }).eq("id", reportId);
    if (error) return toast.error(error.message);
    toast.success("Report processed");
    load();
  };

  const addReserved = async () => {
    if (!newReserved.display.trim()) return;
    const { error } = await supabase.from("reserved_artist_names").insert({
      name_normalized: newReserved.display.trim().toLowerCase(),
      display_name: newReserved.display.trim(),
      reason: newReserved.reason.trim() || null,
    });
    if (error) return toast.error(error.message);
    toast.success("Added");
    setNewReserved({ display: "", reason: "" });
    load();
  };

  const deleteReserved = async (id: string) => {
    const { error } = await supabase.from("reserved_artist_names").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-28 md:pb-12">
      <div className="container mx-auto px-4 space-y-4">
        <div>
          <h1 className="text-3xl font-black flex items-center gap-2"><BadgeCheck className="h-7 w-7 text-sky-400" />Musician Verifications & Reports</h1>
          <p className="text-muted-foreground">Anti-impersonation control center</p>
        </div>

        <Tabs defaultValue="verifications">
          <TabsList>
            <TabsTrigger value="verifications">Pending verifications ({pending.length})</TabsTrigger>
            <TabsTrigger value="reports">Reports ({reports.length})</TabsTrigger>
            <TabsTrigger value="reserved">Reserved names ({reserved.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="verifications" className="space-y-3">
            {loading ? <p className="text-muted-foreground">Loading...</p> : pending.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-muted-foreground">No pending requests</CardContent></Card>
            ) : pending.map((m) => (
              <Card key={m.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">{m.stage_name}<Badge variant="outline">{m.genre}</Badge></CardTitle>
                  <CardDescription>Legal name: <strong>{m.legal_name}</strong></CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="text-sm space-y-1">
                    <p><strong>Bio:</strong> {m.bio || <em className="text-muted-foreground">none</em>}</p>
                    {m.social_proof_url && (
                      <p><strong>Social proof:</strong> <a href={m.social_proof_url} target="_blank" rel="noopener noreferrer" className="text-primary underline inline-flex items-center gap-1">{m.social_proof_url} <ExternalLink className="h-3 w-3" /></a></p>
                    )}
                    <p className="text-xs text-muted-foreground">Requested {m.verification_requested_at && formatDistanceToNow(new Date(m.verification_requested_at), { addSuffix: true })}</p>
                  </div>
                  <Textarea placeholder="Admin notes (shown to musician if rejected)" value={notes[m.id] || ""} onChange={(e) => setNotes({ ...notes, [m.id]: e.target.value })} rows={2} />
                  <div className="flex gap-2">
                    <Button onClick={() => reviewMusician(m.id, true)} className="gap-1"><Check className="h-4 w-4" />Approve & Verify</Button>
                    <Button onClick={() => reviewMusician(m.id, false)} variant="destructive" className="gap-1"><X className="h-4 w-4" />Reject</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reports" className="space-y-3">
            {reports.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-muted-foreground">No pending reports</CardContent></Card>
            ) : reports.map((r) => (
              <Card key={r.id}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base"><Flag className="h-4 w-4 text-destructive" />{r.live_concert_streams?.title || "Unknown concert"}</CardTitle>
                  <CardDescription>
                    Artist: <strong>{r.live_concert_streams?.musician_profiles?.stage_name}</strong>
                    {r.live_concert_streams?.musician_profiles?.verified && <BadgeCheck className="h-3 w-3 inline ml-1 text-sky-400" />}
                    {" · "}Status: {r.live_concert_streams?.status}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant="destructive">{r.category}</Badge>
                  <p className="text-sm">{r.details}</p>
                  <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="destructive" onClick={() => reviewReport(r.id, "suspended_musician")} className="gap-1"><Pause className="h-4 w-4" />Suspend musician & end stream</Button>
                    <Button size="sm" variant="outline" onClick={() => reviewReport(r.id, "dismissed")}>Dismiss</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          <TabsContent value="reserved" className="space-y-3">
            <Card>
              <CardHeader><CardTitle className="text-base">Add reserved name</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <div className="grid md:grid-cols-2 gap-2">
                  <div>
                    <Label>Artist name</Label>
                    <Input value={newReserved.display} onChange={(e) => setNewReserved({ ...newReserved, display: e.target.value })} placeholder="e.g. Dua Lipa" />
                  </div>
                  <div>
                    <Label>Reason</Label>
                    <Input value={newReserved.reason} onChange={(e) => setNewReserved({ ...newReserved, reason: e.target.value })} placeholder="World-famous artist" />
                  </div>
                </div>
                <Button onClick={addReserved} className="gap-1"><Plus className="h-4 w-4" />Add</Button>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 space-y-1">
                {reserved.map((r) => (
                  <div key={r.id} className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
                    <div>
                      <p className="font-medium">{r.display_name}</p>
                      <p className="text-xs text-muted-foreground">{r.reason}</p>
                    </div>
                    <Button size="sm" variant="ghost" onClick={() => deleteReserved(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminMusicianVerifications;
