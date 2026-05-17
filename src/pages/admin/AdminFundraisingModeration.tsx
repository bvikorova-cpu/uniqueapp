import { useEffect, useState } from "react";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Shield, Check, X, Flag, Ban, ExternalLink, Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { format } from "date-fns";

const CAMPAIGN_TYPES = [
  { type: "medical", table: "medical_campaigns", label: "🏥 Medical", route: "medical" },
  { type: "dream", table: "dream_campaigns", label: "✨ Dream", route: "dream" },
  { type: "hero", table: "hero_campaigns", label: "🦸 Hero", route: "hero" },
  { type: "crisis", table: "crisis_campaigns", label: "🚨 Crisis", route: "crisis" },
  { type: "pet", table: "pet_rescue_campaigns", label: "🐾 Pet", route: "pet" },
  { type: "student", table: "student_campaigns", label: "🎓 Student", route: "student" },
  { type: "talent", table: "talent_campaigns", label: "🎭 Talent", route: "talent" },
];

interface CampaignRow {
  id: string;
  title: string;
  description: string | null;
  target_amount: number;
  current_amount: number;
  approval_status: string;
  approval_notes: string | null;
  user_id: string;
  created_at: string;
  approved_at: string | null;
  __type: string;
  __route: string;
}

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/20 text-yellow-700 border-yellow-500/50",
  approved: "bg-green-500/20 text-green-700 border-green-500/50",
  rejected: "bg-red-500/20 text-red-700 border-red-500/50",
  banned: "bg-red-900/30 text-red-900 border-red-900/50",
  flagged: "bg-orange-500/20 text-orange-700 border-orange-500/50",
};

const AdminFundraisingModeration = () => {
  const [campaigns, setCampaigns] = useState<CampaignRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("pending");
  const [acting, setActing] = useState(false);

  const load = async () => {
    setLoading(true);
    const all: CampaignRow[] = [];
    for (const t of CAMPAIGN_TYPES) {
      const { data, error } = await (supabase as any)
        .from(t.table)
        .select("id, title, description, target_amount, current_amount, approval_status, approval_notes, user_id, created_at, approved_at")
        .order("created_at", { ascending: false })
        .limit(100);
      if (error) {
        console.error(t.table, error);
        continue;
      }
      (data as any[])?.forEach(r => all.push({ ...r, __type: t.type, __route: t.route }));
    }
    all.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setCampaigns(all);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const moderate = async (campaign: CampaignRow, action: string, notes?: string) => {
    setActing(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const { data, error } = await supabase.functions.invoke("admin-moderate-campaign", {
        body: { campaignType: campaign.__type, campaignId: campaign.id, action, notes: notes ?? null },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      if (error || data?.error) throw new Error(error?.message || data?.error);
      toast.success(`Campaign ${action}d`);
      load();
    } catch (e: any) {
      toast.error(e.message || "Action failed");
    } finally {
      setActing(false);
    }
  };

  const filtered = statusFilter === "all" ? campaigns : campaigns.filter(c => c.approval_status === statusFilter);
  const counts = campaigns.reduce<Record<string, number>>((acc, c) => {
    acc[c.approval_status] = (acc[c.approval_status] || 0) + 1;
    return acc;
  }, {});

  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Fundraising Moderation"
          subtitle="Review, approve, ban and flag campaigns across all 7 verticals"
          icon={Shield}
        />

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
          {["pending", "approved", "flagged", "rejected", "banned"].map(s => (
            <AdminGlassCard key={s} className="p-4">
              <Badge className={statusColors[s]} variant="outline">{s}</Badge>
              <p className="text-2xl font-bold mt-2">{counts[s] || 0}</p>
            </AdminGlassCard>
          ))}
        </div>

        <Tabs value={statusFilter} onValueChange={setStatusFilter}>
          <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
            <TabsList>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="flagged">Flagged</TabsTrigger>
              <TabsTrigger value="approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected">Rejected</TabsTrigger>
              <TabsTrigger value="banned">Banned</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <Button variant="outline" size="sm" onClick={load} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} /> Refresh
            </Button>
          </div>

          <TabsContent value={statusFilter} className="space-y-3">
            {loading ? (
              <div className="text-center py-12"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>
            ) : filtered.length === 0 ? (
              <AdminGlassCard className="p-12 text-center text-muted-foreground">
                <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>No campaigns in this state</p>
              </AdminGlassCard>
            ) : (
              filtered.map(c => (
                <CampaignModerationCard key={`${c.__type}-${c.id}`} campaign={c} acting={acting} onAct={moderate} />
              ))
            )}
          </TabsContent>
        </Tabs>
      </AdminPageShell>
    </AdminGuard>
  );
};

const CampaignModerationCard = ({ campaign, acting, onAct }: { campaign: CampaignRow; acting: boolean; onAct: (c: CampaignRow, action: string, notes?: string) => void }) => {
  const [notes, setNotes] = useState("");
  const [dialogAction, setDialogAction] = useState<string | null>(null);
  const typeMeta = CAMPAIGN_TYPES.find(t => t.type === campaign.__type)!;
  const progress = campaign.target_amount > 0 ? (campaign.current_amount / campaign.target_amount) * 100 : 0;

  return (
    <AdminGlassCard className="p-4">
      <div className="flex items-start justify-between gap-3 flex-wrap mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <Badge variant="outline">{typeMeta.label}</Badge>
            <Badge className={statusColors[campaign.approval_status]} variant="outline">{campaign.approval_status}</Badge>
            <span className="text-xs text-muted-foreground">{format(new Date(campaign.created_at), "PP")}</span>
          </div>
          <h3 className="font-semibold text-lg">{campaign.title}</h3>
          {campaign.description && <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>}
        </div>
        <Button variant="outline" size="sm" asChild>
          <a href={`/fundraising/${campaign.__route}/${campaign.id}`} target="_blank" rel="noopener noreferrer">
            <ExternalLink className="h-4 w-4 mr-1" /> Open
          </a>
        </Button>
      </div>

      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
        <span>Target: <strong className="text-foreground">€{campaign.target_amount.toFixed(0)}</strong></span>
        <span>Raised: <strong className="text-foreground">€{campaign.current_amount.toFixed(0)}</strong> ({progress.toFixed(0)}%)</span>
      </div>

      {campaign.approval_notes && (
        <div className="bg-muted/50 rounded p-2 text-sm mb-3">
          <strong>Admin note:</strong> {campaign.approval_notes}
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {campaign.approval_status !== "approved" && (
          <Button size="sm" variant="default" disabled={acting} onClick={() => onAct(campaign, "approve")}>
            <Check className="h-4 w-4 mr-1" /> Approve
          </Button>
        )}

        {campaign.approval_status === "flagged" && (
          <Button size="sm" variant="outline" disabled={acting} onClick={() => onAct(campaign, "unflag")}>
            Clear flag
          </Button>
        )}

        {["pending", "approved", "flagged"].includes(campaign.approval_status) && (
          <Dialog open={dialogAction === "flag"} onOpenChange={(o) => setDialogAction(o ? "flag" : null)}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline"><Flag className="h-4 w-4 mr-1" /> Flag</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Flag campaign</DialogTitle></DialogHeader>
              <Textarea placeholder="Reason for flagging..." value={notes} onChange={e => setNotes(e.target.value)} />
              <DialogFooter>
                <Button onClick={() => { onAct(campaign, "flag", notes); setDialogAction(null); setNotes(""); }} disabled={acting}>
                  Flag campaign
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {campaign.approval_status !== "rejected" && campaign.approval_status !== "banned" && (
          <Dialog open={dialogAction === "reject"} onOpenChange={(o) => setDialogAction(o ? "reject" : null)}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline"><X className="h-4 w-4 mr-1" /> Reject</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Reject campaign</DialogTitle></DialogHeader>
              <Textarea placeholder="Reason for rejection (visible to owner)..." value={notes} onChange={e => setNotes(e.target.value)} />
              <DialogFooter>
                <Button variant="destructive" onClick={() => { onAct(campaign, "reject", notes); setDialogAction(null); setNotes(""); }} disabled={acting}>
                  Reject campaign
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}

        {campaign.approval_status !== "banned" && (
          <Dialog open={dialogAction === "ban"} onOpenChange={(o) => setDialogAction(o ? "ban" : null)}>
            <DialogTrigger asChild>
              <Button size="sm" variant="destructive"><Ban className="h-4 w-4 mr-1" /> Ban</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-destructive" /> Ban campaign</DialogTitle></DialogHeader>
              <p className="text-sm text-muted-foreground">This permanently removes the campaign from public view and stops donations.</p>
              <Textarea placeholder="Reason for ban (internal)..." value={notes} onChange={e => setNotes(e.target.value)} />
              <DialogFooter>
                <Button variant="destructive" onClick={() => { onAct(campaign, "ban", notes); setDialogAction(null); setNotes(""); }} disabled={acting}>
                  Permanently ban
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </AdminGlassCard>
  );
};

export default AdminFundraisingModeration;
