import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Ticket, ShieldCheck, AlertTriangle, Star, Clock, Copy, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Order {
  id: string;
  amount: number;
  status: string;
  escrow_status?: string | null;
  auto_release_at?: string | null;
  buyer_confirmed_at?: string | null;
  buyer_disputed_at?: string | null;
  created_at: string;
  coupon_listings?: {
    title: string;
    store_name: string;
    discount_code: string | null;
  } | null;
}

const timeLeft = (iso?: string | null) => {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return "released soon";
  const d = Math.floor(ms / 86400000);
  const h = Math.floor((ms % 86400000) / 3600000);
  return d > 0 ? `${d}d ${h}h left` : `${h}h left`;
};

export function BuyerOrderCard({ order, onChanged }: { order: Order; onChanged: () => void }) {
  const { toast } = useToast();
  const [busy, setBusy] = useState(false);
  const [reviewOpen, setReviewOpen] = useState(false);
  const [disputeOpen, setDisputeOpen] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [reason, setReason] = useState("");
  const [copied, setCopied] = useState(false);

  const escrow = order.escrow_status || "pending";
  const code = order.coupon_listings?.discount_code;

  const call = async (action: string, extra: Record<string, unknown> = {}) => {
    setBusy(true);
    try {
      const { data, error } = await supabase.functions.invoke("coupon-buyer-action", {
        body: { action, orderId: order.id, ...extra },
      });
      if (error || !data?.ok) throw new Error(data?.error || error?.message || "Failed");
      toast({ title: "Done", description: `Action: ${action}` });
      onChanged();
    } catch (e: any) {
      toast({ title: "Error", description: e.message, variant: "destructive" });
    } finally {
      setBusy(false);
    }
  };

  const copyCode = () => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <FloatingHowItWorks title={"Buyer Order Card - How it works"} steps={[{ title: 'Open', desc: 'Access the Buyer Order Card section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Buyer Order Card.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50">
      <div className="flex items-start gap-4">
        <div className="w-14 h-14 bg-gradient-to-br from-primary/20 to-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
          <Ticket className="w-7 h-7 text-primary/60" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold truncate">{order.coupon_listings?.title}</h3>
          <p className="text-xs text-muted-foreground">{order.coupon_listings?.store_name}</p>

          <div className="flex flex-wrap items-center gap-2 mt-2">
            <Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge>
            {order.status === "completed" && (
              <Badge variant="outline" className="gap-1 border-emerald-500/40 text-emerald-600">
                <ShieldCheck className="w-3 h-3" />
                {escrow === "released" ? "Guarantee released" : escrow === "disputed" ? "Disputed" : "7-day Buyer Guarantee"}
              </Badge>
            )}
            {escrow === "held" && order.auto_release_at && (
              <span className="text-[11px] text-muted-foreground inline-flex items-center gap-1">
                <Clock className="w-3 h-3" />{timeLeft(order.auto_release_at)}
              </span>
            )}
          </div>

          {code && order.status === "completed" && (
            <div className="mt-2 flex items-center gap-2 rounded-md bg-muted/40 border border-dashed px-2 py-1.5">
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Code</span>
              <code className="font-mono text-sm font-bold flex-1 truncate">{code}</code>
              <Button size="sm" variant="ghost" className="h-7 px-2" onClick={copyCode}>
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              </Button>
            </div>
          )}
        </div>
        <div className="text-right">
          <p className="text-lg font-black">€{Number(order.amount).toFixed(2)}</p>
        </div>
      </div>

      {order.status === "completed" && escrow === "held" && (
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-border/40">
          <Button size="sm" disabled={busy} onClick={() => call("confirm")} className="gap-1">
            <ShieldCheck className="w-3.5 h-3.5" />Confirm code works
          </Button>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => setDisputeOpen(true)} className="gap-1">
            <AlertTriangle className="w-3.5 h-3.5" />Report problem
          </Button>
        </div>
      )}

      {order.status === "completed" && (escrow === "released" || order.buyer_confirmed_at) && (
        <div className="mt-3 pt-3 border-t border-border/40">
          <Button size="sm" variant="outline" onClick={() => setReviewOpen(true)} className="gap-1">
            <Star className="w-3.5 h-3.5" />Rate seller
          </Button>
        </div>
      )}

      {/* Review dialog */}
      <Dialog open={reviewOpen} onOpenChange={setReviewOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Rate this seller</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button key={n} onClick={() => setRating(n)} className="p-1">
                  <Star className={`w-7 h-7 ${n <= rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
            <Textarea placeholder="Optional comment..." value={comment} onChange={(e) => setComment(e.target.value)} rows={3} maxLength={500} />
            <Button disabled={busy} onClick={async () => { await call("review", { rating, comment }); setReviewOpen(false); }} className="w-full">
              Submit review
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dispute dialog */}
      <Dialog open={disputeOpen} onOpenChange={setDisputeOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Report a problem</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">Describe what's wrong (code expired, already used, store didn't accept, etc.). Funds stay held until reviewed.</p>
            <Textarea placeholder="Describe the issue..." value={reason} onChange={(e) => setReason(e.target.value)} rows={4} maxLength={1000} />
            <Button disabled={busy || reason.trim().length < 10} variant="destructive" onClick={async () => { await call("dispute", { reason }); setDisputeOpen(false); }} className="w-full">
              Submit dispute
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
    </>
  );
}
