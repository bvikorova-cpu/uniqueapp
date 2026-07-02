import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { BadgeCheck, XCircle, Flag, Loader2, ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";
import { SEO } from "@/components/SEO";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Verification {
  id: string;
  user_id: string;
  status: "pending" | "verified" | "rejected";
  admin_note: string | null;
  created_at: string;
}

interface Report {
  id: string;
  item_id: string;
  reporter_id: string;
  reason: string;
  details: string | null;
  status: "open" | "reviewing" | "resolved" | "dismissed";
  resolution_note: string | null;
  created_at: string;
  bazaar_items?: { title: string; user_id: string; is_active: boolean } | null;
}

const AdminBazaarTrust = () => {
  const { toast } = useToast();
  const [verifications, setVerifications] = useState<Verification[]>([]);
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState<Record<string, string>>({});

  const load = async () => {
    setLoading(true);
    const [v, r] = await Promise.all([
      supabase.from("bazaar_seller_verifications" as any).select("*").order("created_at", { ascending: false }),
      supabase.from("bazaar_item_reports" as any).select("*, bazaar_items(title, user_id, is_active)").order("created_at", { ascending: false }),
    ]);
    setVerifications((v.data as any) || []);
    setReports((r.data as any) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const updateVerification = async (id: string, status: "verified" | "rejected") => {
    setBusyId(id);
    const { error } = await supabase
      .from("bazaar_seller_verifications" as any)
      .update({
        status,
        admin_note: noteDraft[id] || null,
        verified_at: status === "verified" ? new Date().toISOString() : null,
      })
      .eq("id", id);
    setBusyId(null);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Updated", description: `Marked as ${status}` });
    load();
  };

  const updateReport = async (id: string, status: Report["status"]) => {
    setBusyId(id);
    const { error } = await supabase
      .from("bazaar_item_reports" as any)
      .update({ status, resolution_note: noteDraft[id] || null })
      .eq("id", id);
    setBusyId(null);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Updated", description: `Report ${status}` });
    load();
  };

  const removeListing = async (itemId: string, reportId: string) => {
    setBusyId(reportId);
    const { error } = await supabase.from("bazaar_items").update({ is_active: false }).eq("id", itemId);
    setBusyId(null);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Listing hidden", description: "Set is_active = false" });
    load();
  };

  const pendingV = verifications.filter((v) => v.status === "pending");
  const openR = reports.filter((r) => r.status === "open" || r.status === "reviewing");

  return (
    <>
      <FloatingHowItWorks title="How Admin Bazaar Trust works" steps={[
          { title: 'Browse listings', desc: 'Explore items, services or offers.' },
          { title: 'Open a detail', desc: 'Review price, seller and terms.' },
          { title: 'Buy / order / bid', desc: 'Complete secure Stripe checkout in EUR. Fees follow platform splits.' },
          { title: 'Track & review', desc: 'Manage orders, leave reviews, get notifications.' },
        ]} />
      <>
      <SEO title="Admin · Bazaar Trust & Safety" description="Review KYC verifications and listing reports." canonical="/admin/bazaar-trust" />
      <div className="min-h-screen bg-background pt-16 sm:pt-20 pb-12">
        <div className="container mx-auto px-3 sm:px-4 max-w-6xl space-y-6">
          <div>
            <h1 className="text-2xl font-black">Bazaar Trust & Safety</h1>
            <p className="text-sm text-muted-foreground">Review seller verifications and listing reports.</p>
          </div>

          <Tabs defaultValue="verifications">
            <TabsList>
              <TabsTrigger value="verifications">
                Verifications {pendingV.length > 0 && <Badge variant="secondary" className="ml-2">{pendingV.length}</Badge>}
              </TabsTrigger>
              <TabsTrigger value="reports">
                Reports {openR.length > 0 && <Badge variant="destructive" className="ml-2">{openR.length}</Badge>}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="verifications" className="space-y-3 mt-4">
              {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
              {!loading && verifications.length === 0 && <p className="text-sm text-muted-foreground">No verification requests.</p>}
              {verifications.map((v) => (
                <Card key={v.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between">
                      <span className="font-mono text-xs">{v.user_id}</span>
                      <Badge variant={v.status === "verified" ? "default" : v.status === "rejected" ? "destructive" : "secondary"}>
                        {v.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-xs text-muted-foreground">Submitted {new Date(v.created_at).toLocaleString()}</p>
                    {v.admin_note && <p className="text-xs">Note: {v.admin_note}</p>}
                    {v.status === "pending" && (
                      <>
                        <Input
                          placeholder="Optional admin note (e.g. reason for rejection)"
                          value={noteDraft[v.id] ?? ""}
                          onChange={(e) => setNoteDraft({ ...noteDraft, [v.id]: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => updateVerification(v.id, "verified")} disabled={busyId === v.id}>
                            {busyId === v.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4 mr-2" />}
                            Verify
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => updateVerification(v.id, "rejected")} disabled={busyId === v.id}>
                            <XCircle className="h-4 w-4 mr-2" /> Reject
                          </Button>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>

            <TabsContent value="reports" className="space-y-3 mt-4">
              {loading && <p className="text-sm text-muted-foreground">Loading…</p>}
              {!loading && reports.length === 0 && <p className="text-sm text-muted-foreground">No reports.</p>}
              {reports.map((r) => (
                <Card key={r.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center justify-between gap-2">
                      <span className="flex items-center gap-2 truncate">
                        <Flag className="h-4 w-4 text-destructive shrink-0" />
                        <span className="truncate">{r.bazaar_items?.title ?? "(deleted listing)"}</span>
                      </span>
                      <Badge variant={r.status === "open" ? "destructive" : r.status === "resolved" ? "default" : "secondary"}>
                        {r.status}
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <Badge variant="outline">{r.reason}</Badge>
                      <span>by {r.reporter_id.slice(0, 8)}…</span>
                      <span>· {new Date(r.created_at).toLocaleString()}</span>
                      {r.bazaar_items && (
                        <Link to={`/bazaar`} className="inline-flex items-center gap-1 text-primary hover:underline">
                          View bazaar <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                    {r.details && <p className="text-xs whitespace-pre-wrap">{r.details}</p>}
                    {r.resolution_note && <p className="text-xs text-muted-foreground">Resolution: {r.resolution_note}</p>}

                    <div className="flex flex-wrap gap-2 items-center">
                      <Input
                        placeholder="Resolution note"
                        value={noteDraft[r.id] ?? ""}
                        onChange={(e) => setNoteDraft({ ...noteDraft, [r.id]: e.target.value })}
                        className="flex-1 min-w-[200px]"
                      />
                      <Select value={r.status} onValueChange={(v) => updateReport(r.id, v as Report["status"])}>
                        <SelectTrigger className="w-[140px]"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="open">Open</SelectItem>
                          <SelectItem value="reviewing">Reviewing</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="dismissed">Dismissed</SelectItem>
                        </SelectContent>
                      </Select>
                      {r.bazaar_items?.is_active && (
                        <Button size="sm" variant="destructive" onClick={() => removeListing(r.item_id, r.id)} disabled={busyId === r.id}>
                          Hide listing
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
    </>
    );
};

export default AdminBazaarTrust;
