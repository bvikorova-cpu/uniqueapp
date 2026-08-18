import { useCallback, useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { maskContactInfo } from "@/lib/contactMask";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, MapPin, Euro, Calendar, Loader2, Send, Check, Inbox } from "lucide-react";
import { SKILL_REGIONS, regionLabel } from "./skillRegions";

type Request = {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  region: string | null;
  location: string | null;
  budget_eur: number | null;
  deadline: string | null;
  is_open: boolean;
  bids_count: number;
  created_at: string;
};

type Bid = {
  id: string;
  request_id: string;
  provider_id: string;
  message: string;
  price_eur: number | null;
  status: string;
  created_at: string;
};

const CATEGORIES = [
  "construction", "repairs", "cleaning", "gardening", "technology", "teaching", "creative", "other",
] as const;

export function SkillRequestsBoard({ category }: { category?: string | null }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [requests, setRequests] = useState<Request[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [myBids, setMyBids] = useState<Record<string, Bid>>({});
  const [loading, setLoading] = useState(true);
  const [regionFilter, setRegionFilter] = useState("all");

  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({
    title: "", description: "", category: category || "other",
    region: "city", location: "", budget: "", deadline: "",
  });
  const [saving, setSaving] = useState(false);

  const [bidFor, setBidFor] = useState<Request | null>(null);
  const [bidForm, setBidForm] = useState({ message: "", price: "" });
  const [bidding, setBidding] = useState(false);

  const [inboxFor, setInboxFor] = useState<Request | null>(null);
  const [inboxBids, setInboxBids] = useState<Bid[]>([]);
  const [inboxLoading, setInboxLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    let query = (supabase as any)
      .from("skill_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200);
    if (category) query = query.eq("category", category);
    const { data } = await query;
    const list = (data as Request[]) || [];
    setRequests(list);

    const ids = [...new Set(list.map((r) => r.user_id))];
    if (ids.length) {
      const { data: profs } = await supabase.from("public_profiles").select("id, full_name, username").in("id", ids);
      const map: Record<string, string> = {};
      (profs || []).forEach((p: any) => { map[p.id] = p.full_name || p.username || "User"; });
      setNames(map);
    }

    if (user) {
      const { data: bids } = await (supabase as any)
        .from("skill_request_bids").select("*").eq("provider_id", user.id);
      const bmap: Record<string, Bid> = {};
      ((bids as Bid[]) || []).forEach((b) => { bmap[b.request_id] = b; });
      setMyBids(bmap);
    }
    setLoading(false);
  }, [category, user]);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(
    () => (regionFilter === "all" ? requests : requests.filter((r) => r.region === regionFilter)),
    [requests, regionFilter],
  );

  const submitRequest = async () => {
    if (form.title.trim().length < 5 || form.description.trim().length < 15) {
      toast({ title: "Add more detail", description: "Title min 5 and description min 15 characters.", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await (supabase as any).rpc("publish_skill_request", {
        _title: form.title.trim(),
        _description: form.description.trim(),
        _category: form.category,
        _region: form.region,
        _location: form.location.trim() || null,
        _budget_eur: form.budget ? Number(form.budget) : null,
        _deadline: form.deadline || null,
      });
      if (error) throw error;
      toast({ title: "Request published", description: "2 credits used. Providers can now send you offers." });
      setCreateOpen(false);
      setForm({ title: "", description: "", category: category || "other", region: "city", location: "", budget: "", deadline: "" });
      load();
    } catch (err: any) {
      const msg = String(err?.message || "");
      toast({
        title: "Could not publish",
        description: msg.includes("INSUFFICIENT_CREDITS")
          ? "You need 2 credits to publish a request."
          : msg.includes("DAILY_LIMIT") ? "Max 10 requests per day." : msg || "Try again",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const submitBid = async () => {
    if (!bidFor) return;
    if (bidForm.message.trim().length < 10) {
      toast({ title: "Write a short offer", description: "At least 10 characters.", variant: "destructive" });
      return;
    }
    setBidding(true);
    try {
      const { error } = await (supabase as any).rpc("submit_skill_bid", {
        _request_id: bidFor.id,
        _message: bidForm.message.trim(),
        _price_eur: bidForm.price ? Number(bidForm.price) : null,
      });
      if (error) throw error;
      toast({ title: "Offer sent", description: "1 credit used. The customer got a notification." });
      setBidFor(null);
      setBidForm({ message: "", price: "" });
      load();
    } catch (err: any) {
      const msg = String(err?.message || "");
      toast({
        title: "Could not send offer",
        description: msg.includes("INSUFFICIENT_CREDITS")
          ? "You need 1 credit to send an offer."
          : msg.includes("ALREADY_BID")
            ? "You already sent an offer for this request."
            : msg.includes("REQUEST_CLOSED")
              ? "This request is already closed."
              : msg || "Try again",
        variant: "destructive",
      });
    } finally {
      setBidding(false);
    }
  };

  const openInbox = async (r: Request) => {
    setInboxFor(r);
    setInboxLoading(true);
    const { data } = await (supabase as any)
      .from("skill_request_bids").select("*").eq("request_id", r.id).order("created_at", { ascending: false });
    const list = (data as Bid[]) || [];
    setInboxBids(list);
    const ids = [...new Set(list.map((b) => b.provider_id))].filter((id) => !names[id]);
    if (ids.length) {
      const { data: profs } = await supabase.from("public_profiles").select("id, full_name, username").in("id", ids);
      setNames((prev) => {
        const next = { ...prev };
        (profs || []).forEach((p: any) => { next[p.id] = p.full_name || p.username || "User"; });
        return next;
      });
    }
    setInboxLoading(false);
  };

  const acceptBid = async (bid: Bid) => {
    try {
      const { error } = await (supabase as any).rpc("accept_skill_bid", { _bid_id: bid.id });
      if (error) throw error;
      toast({ title: "Offer accepted", description: "The provider was notified." });
      setInboxFor(null);
      load();
    } catch (err: any) {
      toast({ title: "Could not accept", description: err?.message ?? "Try again", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1">
            <h3 className="font-semibold">Customer requests</h3>
            <p className="text-sm text-muted-foreground">
              Posting a request is free. Providers pay 1 credit to send an offer.
            </p>
          </div>
          <Select value={regionFilter} onValueChange={setRegionFilter}>
            <SelectTrigger className="w-full md:w-56"><SelectValue placeholder="Region" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All regions</SelectItem>
              {SKILL_REGIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2" disabled={!user}>
                <Plus className="h-4 w-4" /> Post a request · free
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>What do you need done?</DialogTitle>
                <DialogDescription>Publishing a request costs 2 credits. Providers will send you price offers you can accept.</DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                <Input placeholder="e.g. Paint a 60 m² flat"
                  value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                <Textarea rows={4} placeholder="Describe the job, size, timing and any details…"
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                <div className="grid grid-cols-2 gap-3">
                  <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                    <SelectTrigger><SelectValue placeholder="Category" /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.map((c) => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Select value={form.region} onValueChange={(v) => setForm({ ...form, region: v })}>
                    <SelectTrigger><SelectValue placeholder="Region" /></SelectTrigger>
                    <SelectContent>
                      {SKILL_REGIONS.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <Input placeholder="City / area" value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })} />
                  <Input type="number" min="0" placeholder="Budget (€)" value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: e.target.value })} />
                  <Input type="date" value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })} className="col-span-2" />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={submitRequest} disabled={saving} className="gap-2">
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />} Publish request (2 credits)
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card><CardContent className="p-12 text-center text-muted-foreground">
          No open requests here yet — post the first one.
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((r) => {
            const mine = user?.id === r.user_id;
            const myBid = myBids[r.id];
            return (
              <Card key={r.id} className="h-full">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">{maskContactInfo(r.title)}</CardTitle>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant="secondary" className="capitalize">{r.category}</Badge>
                      {!r.is_open && <Badge variant="outline">Closed</Badge>}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">by {names[r.user_id] || "User"}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-3">{maskContactInfo(r.description)}</p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                    {regionLabel(r.region) && <span>{regionLabel(r.region)}</span>}
                    {r.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{r.location}</span>}
                    {r.budget_eur != null && <span className="flex items-center gap-1"><Euro className="h-3.5 w-3.5" />{r.budget_eur}</span>}
                    {r.deadline && <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{new Date(r.deadline).toLocaleDateString()}</span>}
                    <span>{r.bids_count} offer{r.bids_count === 1 ? "" : "s"}</span>
                  </div>
                  {mine ? (
                    <Button variant="outline" size="sm" className="gap-2" onClick={() => openInbox(r)}>
                      <Inbox className="h-4 w-4" /> View offers ({r.bids_count})
                    </Button>
                  ) : myBid ? (
                    <Badge variant={myBid.status === "accepted" ? "default" : "secondary"}>
                      Your offer: {myBid.status}
                    </Badge>
                  ) : (
                    <Button size="sm" className="gap-2" disabled={!user || !r.is_open}
                      onClick={() => setBidFor(r)}>
                      <Send className="h-4 w-4" /> Send offer · 1 credit
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!bidFor} onOpenChange={(v) => !v && setBidFor(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Send your offer</DialogTitle>
            <DialogDescription>Sending an offer costs 1 credit. The customer decides who wins the job.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <Textarea rows={4} placeholder="How you would do it, when you are available…"
              value={bidForm.message} onChange={(e) => setBidForm({ ...bidForm, message: e.target.value })} />
            <Input type="number" min="0" placeholder="Your price (€)"
              value={bidForm.price} onChange={(e) => setBidForm({ ...bidForm, price: e.target.value })} />
          </div>
          <DialogFooter>
            <Button onClick={submitBid} disabled={bidding} className="gap-2">
              {bidding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send · 1 credit
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!inboxFor} onOpenChange={(v) => !v && setInboxFor(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Offers for “{inboxFor?.title}”</DialogTitle>
            <DialogDescription>Accept one offer — the others are closed automatically.</DialogDescription>
          </DialogHeader>
          {inboxLoading ? (
            <Skeleton className="h-24 w-full" />
          ) : inboxBids.length === 0 ? (
            <p className="text-sm text-muted-foreground">No offers yet.</p>
          ) : (
            <div className="space-y-3">
              {inboxBids.map((b) => (
                <Card key={b.id}>
                  <CardContent className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">{names[b.provider_id] || "Provider"}</span>
                      {b.price_eur != null && (
                        <span className="flex items-center gap-1 font-semibold text-primary">
                          <Euro className="h-3.5 w-3.5" />{b.price_eur}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{b.message}</p>
                    {b.status === "pending" ? (
                      <Button size="sm" className="gap-2" onClick={() => acceptBid(b)}>
                        <Check className="h-4 w-4" /> Accept offer
                      </Button>
                    ) : (
                      <Badge variant={b.status === "accepted" ? "default" : "outline"} className="capitalize">{b.status}</Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
