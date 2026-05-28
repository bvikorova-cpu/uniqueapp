import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter,
  DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { ShieldAlert, CheckCircle2, XCircle, Clock, History } from "lucide-react";
import { toast } from "sonner";
import { AdminGuard } from "@/components/admin/AdminGuard";
import { AdminPageShell, AdminGlassCard } from "@/components/admin/AdminPageShell";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { formatDistanceToNow } from "date-fns";

type Brand = {
  id: string;
  name: string;
  logo: string;
  category: string;
  tier: string;
  description: string | null;
  website: string | null;
  user_id: string;
  subscription_status: string;
  moderation_status: "pending" | "approved" | "rejected";
  moderation_reason: string | null;
  moderated_at: string | null;
  created_at: string;
};

type AuditRow = {
  id: string;
  brand_id: string;
  admin_id: string;
  previous_status: string | null;
  new_status: string;
  reason: string | null;
  created_at: string;
  brand?: { name: string } | null;
};

const STATUS_BADGE: Record<string, { label: string; variant: any; icon: any }> = {
  pending: { label: "Pending", variant: "secondary", icon: Clock },
  approved: { label: "Approved", variant: "default", icon: CheckCircle2 },
  rejected: { label: "Rejected", variant: "destructive", icon: XCircle },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_BADGE[status] ?? STATUS_BADGE.pending;
  const Icon = s.icon;
  return (
    <Badge variant={s.variant} className="gap-1">
      <Icon className="h-3 w-3" /> {s.label}
    </Badge>
  );
}

function ModerationActions({ brand }: { brand: Brand }) {
  const qc = useQueryClient();
  const [reason, setReason] = useState(brand.moderation_reason ?? "");
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const decide = async (status: "approved" | "rejected") => {
    if (status === "rejected" && !reason.trim()) {
      toast.error("Please provide a rejection reason");
      return;
    }
    setBusy(true);
    const { data: u } = await supabase.auth.getUser();
    const { error } = await supabase
      .from("brand_sponsors")
      .update({
        moderation_status: status,
        moderation_reason: status === "rejected" ? reason.trim() : null,
        moderated_by: u.user?.id,
        moderated_at: new Date().toISOString(),
      })
      .eq("id", brand.id);
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Brand ${status}`);
    setOpen(false);
    qc.invalidateQueries({ queryKey: ["admin-brand-moderation"] });
    qc.invalidateQueries({ queryKey: ["admin-brand-audit"] });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" data-testid={`moderate-${brand.id}`}>
          Review
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Moderate brand: {brand.name}</DialogTitle>
          <DialogDescription>
            Category: {brand.category} · Tier: {brand.tier}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 text-sm">
          {brand.description && <p className="text-muted-foreground">{brand.description}</p>}
          {brand.website && (
            <a href={brand.website} target="_blank" rel="noreferrer"
               className="text-primary underline break-all">{brand.website}</a>
          )}
          <Textarea
            placeholder="Rejection reason (required when rejecting)"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            data-testid="moderation-reason"
          />
        </div>
        <DialogFooter className="gap-2">
          <Button variant="destructive" disabled={busy}
                  onClick={() => decide("rejected")} data-testid="reject-brand">
            Reject
          </Button>
          <Button disabled={busy}
                  onClick={() => decide("approved")} data-testid="approve-brand">
            Approve
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function QueueTable({ status }: { status: "pending" | "approved" | "rejected" }) {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-brand-moderation", status],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_sponsors")
        .select("*")
        .eq("moderation_status", status)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Brand[];
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!data.length) {
    return (
      <p className="text-sm text-muted-foreground" data-testid="empty-queue">
        No {status} brands.
      </p>
    );
  }

  return (
    <div className="space-y-3" data-testid={`queue-${status}`}>
      {data.map((b) => (
        <div key={b.id}
             className="flex items-center gap-4 rounded-lg border border-border/40 bg-card/40 p-4">
          <img src={b.logo} alt={b.name} className="h-12 w-12 rounded object-cover" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold">{b.name}</span>
              <StatusBadge status={b.moderation_status} />
              <span className="text-xs text-muted-foreground">{b.category} · {b.tier}</span>
            </div>
            {b.moderation_reason && (
              <p className="mt-1 text-xs text-destructive">Reason: {b.moderation_reason}</p>
            )}
          </div>
          <ModerationActions brand={b} />
        </div>
      ))}
    </div>
  );
}

function AuditLog() {
  const { data = [], isLoading } = useQuery({
    queryKey: ["admin-brand-audit"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("brand_moderation_audit")
        .select("*, brand:brand_sponsors(name)")
        .order("created_at", { ascending: false })
        .limit(200);
      if (error) throw error;
      return data as AuditRow[];
    },
  });

  if (isLoading) return <p className="text-sm text-muted-foreground">Loading…</p>;
  if (!data.length) {
    return <p className="text-sm text-muted-foreground" data-testid="empty-audit">No audit entries yet.</p>;
  }

  return (
    <div className="space-y-2" data-testid="audit-log">
      {data.map((a) => (
        <div key={a.id}
             className="flex flex-wrap items-center gap-2 rounded-md border border-border/40 bg-card/30 p-3 text-sm">
          <History className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{a.brand?.name ?? a.brand_id}</span>
          <span className="text-muted-foreground">
            {a.previous_status ?? "—"} →
          </span>
          <StatusBadge status={a.new_status} />
          {a.reason && <span className="text-xs text-destructive">· {a.reason}</span>}
          <span className="ml-auto text-xs text-muted-foreground">
            by {a.admin_id.slice(0, 8)}… · {formatDistanceToNow(new Date(a.created_at), { addSuffix: true })}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function AdminBrandModeration() {
  return (
    <AdminGuard>
      <AdminPageShell>
        <AdminPageHeader
          title="Brand Moderation"
          subtitle="Review brand sign-ups before they appear in Brand Battle Arena."
          icon={ShieldAlert}
          badge="Brands"
          breadcrumbs={[{ label: "Brand Moderation" }]}
        />
        <AdminGlassCard className="p-4 sm:p-6">
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid w-full grid-cols-4 max-w-xl">
              <TabsTrigger value="pending" data-testid="tab-pending">Pending</TabsTrigger>
              <TabsTrigger value="approved" data-testid="tab-approved">Approved</TabsTrigger>
              <TabsTrigger value="rejected" data-testid="tab-rejected">Rejected</TabsTrigger>
              <TabsTrigger value="audit" data-testid="tab-audit">Audit log</TabsTrigger>
            </TabsList>
            <TabsContent value="pending" className="mt-6"><QueueTable status="pending" /></TabsContent>
            <TabsContent value="approved" className="mt-6"><QueueTable status="approved" /></TabsContent>
            <TabsContent value="rejected" className="mt-6"><QueueTable status="rejected" /></TabsContent>
            <TabsContent value="audit" className="mt-6"><AuditLog /></TabsContent>
          </Tabs>
        </AdminGlassCard>
      </AdminPageShell>
    </AdminGuard>
  );
}
