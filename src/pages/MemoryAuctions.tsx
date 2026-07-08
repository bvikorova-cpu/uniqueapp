import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Gavel, Clock, Sparkles, Plus, Loader2 } from "lucide-react";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";

type Auction = {
  id: string;
  memory_id: string;
  starting_price: number;
  current_bid: number | null;
  highest_bidder_id: string | null;
  ends_at: string;
  status: string;
  memory: { title: string; description: string; category: string; user_id: string } | null;
};

export default function MemoryAuctions() {
  const { user } = useAuth();
  const [auctions, setAuctions] = useState<Auction[]>([]);
  const [loading, setLoading] = useState(true);
  const [bidAmount, setBidAmount] = useState<Record<string, string>>({});
  const [bidding, setBidding] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "story", starting_price: "10" });
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("memory_auctions")
      .select("id, memory_id, starting_price, current_bid, highest_bidder_id, ends_at, status, memory:memories(title, description, category, user_id)")
      .eq("status", "active")
      .order("ends_at", { ascending: true });
    if (error) toast.error(error.message);
    else setAuctions((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const placeBid = async (a: Auction) => {
    if (!user) { toast.error("Sign in to place a bid"); return; }
    const raw = bidAmount[a.id];
    const amt = Number(raw);
    if (!raw || isNaN(amt) || amt <= 0) { toast.error("Enter a valid bid amount"); return; }
    const min = Number(a.current_bid ?? a.starting_price) + 1;
    if (amt < min) { toast.error(`Minimum bid is €${min}`); return; }
    setBidding(a.id);
    const { data, error } = await supabase.rpc("place_memory_auction_bid" as any, { p_auction_id: a.id, p_amount: amt });
    setBidding(null);
    if (error) { toast.error(error.message); return; }
    toast.success(`Bid placed: €${amt}`);
    setBidAmount((b) => ({ ...b, [a.id]: "" }));
    load();
  };

  const createAuction = async () => {
    if (!user) { toast.error("Sign in to list a memory"); return; }
    const price = Number(form.starting_price);
    if (!form.title.trim() || !form.description.trim() || isNaN(price) || price < 1) {
      toast.error("Fill all fields (min €1)"); return;
    }
    setCreating(true);
    const { data: mem, error: mErr } = await supabase.from("memories").insert({
      user_id: user.id, title: form.title, description: form.description,
      content: {}, category: form.category, price,
    }).select("id").single();
    if (mErr) { toast.error(mErr.message); setCreating(false); return; }
    const endsAt = new Date(Date.now() + 24 * 3600 * 1000).toISOString();
    const { error: aErr } = await supabase.from("memory_auctions").insert({
      memory_id: mem.id, starting_price: price, current_bid: price, ends_at: endsAt, status: "active",
    });
    setCreating(false);
    if (aErr) { toast.error(aErr.message); return; }
    toast.success("Auction created — live for 24h");
    setCreateOpen(false);
    setForm({ title: "", description: "", category: "story", starting_price: "10" });
    load();
  };

  return (
    <>
      <FloatingHowItWorks title="How Memory Auctions works" steps={[
        { title: "Browse active auctions", desc: "Every listing is a real memory shared by a real person." },
        { title: "Place a bid", desc: "Highest bid wins when the 24h timer ends. Minimum increment is €1." },
        { title: "List your own memory", desc: "Write a title, description, set a starting price. Auction runs 24h." },
        { title: "Get notified", desc: "You get a notification when someone outbids or bids on your memory." },
      ]} />
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="container mx-auto px-4 py-12 max-w-6xl">
          <header className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm mb-4">
              <Gavel className="w-4 h-4" /> Memory Auctions
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-3">Auction the moments that shaped you</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Real people, real memories. Bid in EUR, live 24h auctions.
            </p>
            <Dialog open={createOpen} onOpenChange={setCreateOpen}>
              <DialogTrigger asChild>
                <Button size="lg"><Plus className="w-4 h-4 mr-2" /> List a memory</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Create a memory auction</DialogTitle></DialogHeader>
                <div className="space-y-3">
                  <Input placeholder="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
                  <Textarea placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                  <div className="flex gap-2">
                    <Input placeholder="Category (story, audio, photo...)" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
                    <Input type="number" min={1} placeholder="Starting price €" value={form.starting_price} onChange={(e) => setForm({ ...form, starting_price: e.target.value })} />
                  </div>
                  <Button className="w-full" onClick={createAuction} disabled={creating}>
                    {creating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating…</> : "Publish 24h auction"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </header>

          {loading ? (
            <div className="flex items-center justify-center py-20"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
          ) : auctions.length === 0 ? (
            <Card><CardContent className="py-16 text-center text-muted-foreground">
              <Sparkles className="w-8 h-8 mx-auto mb-2 text-primary" />
              No active auctions right now. Be the first to list a memory.
            </CardContent></Card>
          ) : (
            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {auctions.map((a) => {
                const current = Number(a.current_bid ?? a.starting_price);
                const min = current + 1;
                const isOwner = a.memory?.user_id === user?.id;
                return (
                  <Card key={a.id} className="flex flex-col">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg">{a.memory?.title ?? "Memory"}</CardTitle>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-muted uppercase">{a.memory?.category}</span>
                      </div>
                      <CardDescription className="line-clamp-3">{a.memory?.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Current bid</span>
                        <span className="font-bold text-primary">€{current.toFixed(2)}</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" /> Ends {formatDistanceToNow(new Date(a.ends_at), { addSuffix: true })}
                      </div>
                      {isOwner ? (
                        <p className="text-xs text-center text-muted-foreground italic">Your listing</p>
                      ) : (
                        <div className="flex gap-2">
                          <Input type="number" min={min} step={1} placeholder={`Min €${min}`}
                            value={bidAmount[a.id] ?? ""}
                            onChange={(e) => setBidAmount((b) => ({ ...b, [a.id]: e.target.value }))} />
                          <Button size="sm" onClick={() => placeBid(a)} disabled={bidding === a.id}>
                            {bidding === a.id ? <Loader2 className="w-4 h-4 animate-spin" /> : "Bid"}
                          </Button>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </section>
          )}
        </main>
      </div>
    </>
  );
}
