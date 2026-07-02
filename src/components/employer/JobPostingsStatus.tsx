import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Receipt, Clock, CheckCircle2, XCircle, AlertCircle, CalendarClock, RefreshCcw } from "lucide-react";
import { format, formatDistanceToNow, isPast, differenceInDays } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { RenewJobDialog } from "./RenewJobDialog";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PostingRow {
  id: string;
  title: string;
  company_name: string;
  paid_status: string;
  is_active: boolean | null;
  created_at: string | null;
  expires_at: string | null;
  duration_days: number;
}

const PRICE_BY_DAYS: Record<number, number> = { 7: 19, 14: 29, 30: 49 };

function PaymentBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; cls: string; Icon: typeof CheckCircle2 }> = {
    paid: { label: "Paid", cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20", Icon: CheckCircle2 },
    active: { label: "Paid", cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/20", Icon: CheckCircle2 },
    pending: { label: "Pending", cls: "bg-amber-500/15 text-amber-600 border-amber-500/20", Icon: Clock },
    failed: { label: "Failed", cls: "bg-destructive/15 text-destructive border-destructive/20", Icon: XCircle },
    expired: { label: "Expired", cls: "bg-muted text-muted-foreground border-border", Icon: AlertCircle },
  };
  const cfg = map[status] ?? map.pending;
  const { Icon } = cfg;
  return (
    <>
      <FloatingHowItWorks title={"Job Postings Status - How it works"} steps={[{ title: 'Open', desc: 'Access the Job Postings Status section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Job Postings Status.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Badge className={`${cfg.cls} gap-1`}>
      <Icon className="h-3 w-3" /> {cfg.label}
    </Badge>
    </>
  );
}

function ExpiryCell({ expires_at }: { expires_at: string | null }) {
  if (!expires_at) return <span className="text-muted-foreground text-sm">—</span>;
  const date = new Date(expires_at);
  const expired = isPast(date);
  return (
    <div className="flex flex-col items-end">
      <span className={`text-sm font-medium ${expired ? "text-destructive" : ""}`}>
        {format(date, "MMM d, yyyy")}
      </span>
      <span className="text-xs text-muted-foreground">
        {expired ? "Expired" : `in ${formatDistanceToNow(date)}`}
      </span>
    </div>
  );
}

export function JobPostingsStatus() {
  const [rows, setRows] = useState<PostingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [renewTarget, setRenewTarget] = useState<{ id: string; title: string } | null>(null);

  useEffect(() => {
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }
      const { data, error } = await supabase
        .from("job_listings")
        .select("id,title,company_name,paid_status,is_active,created_at,expires_at,duration_days")
        .eq("employer_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setRows(data as PostingRow[]);
      setLoading(false);
    })();
  }, []);

  const total = rows.length;
  const active = rows.filter(r => (r.paid_status === "paid" || r.paid_status === "active") && r.expires_at && !isPast(new Date(r.expires_at))).length;
  const pending = rows.filter(r => r.paid_status === "pending").length;
  const failed = rows.filter(r => r.paid_status === "failed").length;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Total", value: total, Icon: Receipt, color: "text-primary" },
          { label: "Active", value: active, Icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Pending", value: pending, Icon: Clock, color: "text-amber-500" },
          { label: "Failed", value: failed, Icon: XCircle, color: "text-destructive" },
        ].map(({ label, value, Icon, color }) => (
          <Card key={label} className="border-border/40 bg-card/80 backdrop-blur-sm">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="text-2xl font-bold">{value}</p>
              </div>
              <Icon className={`h-5 w-5 ${color}`} />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="border-border/40 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarClock className="h-5 w-5 text-primary" />
            Job Posting Packages
          </CardTitle>
          <CardDescription>
            Payment status and expiration for each job listing you posted.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-border/30">
                  <TableHead>Position</TableHead>
                  <TableHead>Package</TableHead>
                  <TableHead>Payment</TableHead>
                  <TableHead>Listing</TableHead>
                  <TableHead className="text-right">Posted</TableHead>
                  <TableHead className="text-right">Expires</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  const price = PRICE_BY_DAYS[r.duration_days];
                  const isExpired = r.expires_at ? isPast(new Date(r.expires_at)) : false;
                  const daysLeft = r.expires_at ? differenceInDays(new Date(r.expires_at), new Date()) : null;
                  const expiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 3;
                  const effectiveStatus = isExpired && (r.paid_status === "paid" || r.paid_status === "active")
                    ? "expired" : r.paid_status;
                  const canRenew = r.paid_status === "active" || r.paid_status === "paid" || r.paid_status === "failed" || r.paid_status === "pending";
                  return (
                    <TableRow key={r.id} className="border-border/20 hover:bg-primary/5 transition-colors">
                      <TableCell>
                        <div className="font-semibold">{r.title}</div>
                        <div className="text-xs text-muted-foreground">{r.company_name}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{r.duration_days} days</div>
                        {price !== undefined && (
                          <div className="text-xs text-muted-foreground">€{price}</div>
                        )}
                      </TableCell>
                      <TableCell><PaymentBadge status={effectiveStatus} /></TableCell>
                      <TableCell>
                        <Badge className={r.is_active && !isExpired
                          ? "bg-emerald-500/15 text-emerald-600 border-emerald-500/20"
                          : "bg-muted text-muted-foreground"}>
                          {r.is_active && !isExpired ? "Live" : "Hidden"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {r.created_at ? format(new Date(r.created_at), "MMM d, yyyy") : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <ExpiryCell expires_at={r.expires_at} />
                      </TableCell>
                      <TableCell className="text-right">
                        {canRenew && (
                          <Button
                            size="sm"
                            variant={isExpired || expiringSoon || r.paid_status === "failed" ? "default" : "outline"}
                            className={r.paid_status === "failed" ? "bg-destructive hover:bg-destructive/90" : undefined}
                            onClick={() => setRenewTarget({ id: r.id, title: r.title })}
                          >
                            <RefreshCcw className="h-3.5 w-3.5 mr-1.5" />
                            {r.paid_status === "failed"
                              ? "Retry Payment"
                              : r.paid_status === "pending"
                                ? "Complete Payment"
                                : isExpired
                                  ? "Renew"
                                  : expiringSoon
                                    ? "Extend"
                                    : "Renew"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
                {rows.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-12">
                      <Receipt className="h-10 w-10 text-muted-foreground/40 mx-auto mb-3" />
                      <p className="text-muted-foreground">No job postings yet.</p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {renewTarget && (
        <RenewJobDialog
          jobId={renewTarget.id}
          jobTitle={renewTarget.title}
          open={!!renewTarget}
          onOpenChange={(open) => !open && setRenewTarget(null)}
        />
      )}
    </div>
  );
}
