import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { AuctionPromoteDialog } from "@/components/auction/AuctionPromoteDialog";
import { ArrowLeft, Crown, Flame, Gavel, Pencil, Plus, Rocket, Trash2 } from "lucide-react";

interface Row {
  id: string;
  title: string;
  description: string | null;
  starting_price: number;
  current_price: number | null;
  buyout_price: number | null;
  location: string | null;
  category: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  is_active: boolean | null;
  ends_at: string;
  featured_until: string | null;
  premium_until: string | null;
  created_at: string;
}

const future = (d?: string | null) => !!d && new Date(d) > new Date();

export default function AuctionMy() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Row | null>(null);
  const [deleting, setDeleting] = useState<Row | null>(null);
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data } = await (supabase as any)
      .from("auction_items")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    setRows(((data as Row[]) || []));
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    const { error } = await (supabase as any)
      .from("auction_items")
      .update({
        title: editing.title,
        description: editing.description,
        buyout_price: editing.buyout_price,
        location: editing.location,
      })
      .eq("id", editing.id)
      .eq("user_id", user!.id);
    setSaving(false);
    if (error) { toast({ title: "Could not save", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Auction updated" });
    setEditing(null);
    load();
  };

  const toggleActive = async (row: Row) => {
    const { error } = await (supabase as any)
      .from("auction_items")
      .update({ is_active: !row.is_active })
      .eq("id", row.id)
      .eq("user_id", user!.id);
    if (error) { toast({ title: "Could not update", description: error.message, variant: "destructive" }); return; }
    toast({ title: row.is_active ? "Auction paused" : "Auction reopened" });
    load();
  };

  const remove = async () => {
    if (!deleting) return;
    const { error } = await (supabase as any)
      .from("auction_items")
      .delete()
      .eq("id", deleting.id)
      .eq("user_id", user!.id);
    if (error) { toast({ title: "Could not delete", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Auction deleted" });
    setDeleting(null);
    load();
  };

  if (!user) {
    return (
      <main className="container max-w-2xl py-20 text-center">
        <p className="text-muted-foreground">Please sign in to manage your auctions.</p>
        <Button className="mt-4" onClick={() => navigate("/auth")}>Sign in</Button>
      </main>
    );
  }

  return (
    <>
      <SEO title="My auctions — edit, pause, promote" description="Manage your own auctions: edit details, pause or reopen bidding, promote with TOP or PREMIUM, or delete." canonical="/auction/my" />
      <main className="container mx-auto max-w-4xl px-4 pb-16 pt-20">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate("/auction")}>
          <ArrowLeft className="h-4 w-4" /> Back to Auctions
        </Button>

        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight">My auctions</h1>
            <p className="text-sm text-muted-foreground">Only your own auctions are shown here.</p>
          </div>
          <Button className="gap-2" onClick={() => navigate("/auction/create")}>
            <Plus className="h-4 w-4" /> New auction
          </Button>
        </div>

        <div className="space-y-3">
          {loading ? (
            [0, 1, 2].map((i) => <Skeleton key={i} className="h-28 w-full rounded-xl" />)
          ) : rows.length === 0 ? (
            <Card><CardContent className="py-16 text-center text-muted-foreground">You have no auctions yet.</CardContent></Card>
          ) : (
            rows.map((r) => {
              const cover = r.image_url || r.image_urls?.[0];
              const ended = new Date(r.ends_at) <= new Date();
              return (
                <Card key={r.id} className="overflow-hidden border-primary/15">
                  <CardContent className="flex flex-col gap-4 p-4 sm:flex-row">
                    {cover ? (
                      <img src={cover} alt={r.title} loading="lazy" className="h-24 w-full rounded-xl object-cover sm:w-32" />
                    ) : (
                      <div className="flex h-24 w-full items-center justify-center rounded-xl bg-muted sm:w-32">
                        <Gavel className="h-6 w-6 text-muted-foreground" />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="truncate font-semibold">{r.title}</h2>
                        {future(r.premium_until) && <Badge className="gap-1"><Crown className="h-3 w-3" /> PREMIUM</Badge>}
                        {future(r.featured_until) && <Badge variant="secondary" className="gap-1"><Flame className="h-3 w-3" /> TOP</Badge>}
                        <Badge variant={r.is_active && !ended ? "outline" : "destructive"}>
                          {ended ? "Ended" : r.is_active ? "Live" : "Paused"}
                        </Badge>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Current bid €{Number(r.current_price ?? r.starting_price).toFixed(2)}
                        {r.location ? ` · ${r.location}` : ""}
                      </p>
                      <p className="text-xs text-muted-foreground">Ends {new Date(r.ends_at).toLocaleString()}</p>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Button size="sm" variant="outline" className="gap-1" onClick={() => setEditing(r)}>
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => toggleActive(r)}>
                          {r.is_active ? "Pause" : "Reopen"}
                        </Button>
                        <Button size="sm" variant="secondary" className="gap-1" onClick={() => setPromoteId(r.id)}>
                          <Rocket className="h-3.5 w-3.5" /> Promote
                        </Button>
                        <Button size="sm" variant="ghost" className="gap-1 text-destructive" onClick={() => setDeleting(r)}>
                          <Trash2 className="h-3.5 w-3.5" /> Delete
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </main>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit auction</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <Input value={editing.title} onChange={(e) => setEditing({ ...editing, title: e.target.value })} placeholder="Title" />
              <Textarea rows={5} value={editing.description ?? ""} onChange={(e) => setEditing({ ...editing, description: e.target.value })} placeholder="Description" />
              <Input
                type="number"
                value={editing.buyout_price ?? ""}
                onChange={(e) => setEditing({ ...editing, buyout_price: e.target.value ? Number(e.target.value) : null })}
                placeholder="Buy-now price (€)"
              />
              <Input value={editing.location ?? ""} onChange={(e) => setEditing({ ...editing, location: e.target.value })} placeholder="City / area" />
              <p className="text-xs text-muted-foreground">Starting price and duration are locked once bidding is open.</p>
              <Button className="w-full" onClick={saveEdit} disabled={saving}>{saving ? "Saving…" : "Save changes"}</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this auction?</AlertDialogTitle>
            <AlertDialogDescription>This permanently removes the auction and its bids. Credits already spent are not refunded.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={remove}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AuctionPromoteDialog itemId={promoteId} open={!!promoteId} onOpenChange={(o) => !o && setPromoteId(null)} onPromoted={load} />
    </>
  );
}
