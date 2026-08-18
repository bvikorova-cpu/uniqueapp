import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { maskContactInfo } from "@/lib/contactMask";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus, Search, MapPin, Euro, ArrowLeft, Sparkles, Crown, Flame, ChevronRight, MessageCircle,
  Smartphone, Shirt, Home, Dumbbell, Palette, Car, Gem, Boxes, Lock, Loader2, Gavel, Clock,
  Settings2,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { PromotionBadge } from "@/components/skills/PromotionBadge";
import { AuctionPromoteDialog } from "@/components/auction/AuctionPromoteDialog";
import { AuctionChatDialog } from "@/components/auction/AuctionChatDialog";
import { useToast } from "@/hooks/use-toast";
import { useAuctionUnread } from "@/hooks/useSimpleUnread";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import auctionHeroAsset from "@/assets/auction-hero.mp4.asset.json";

const CATEGORY_FOLDERS = [
  { value: "electronics", label: "Electronics", icon: Smartphone, desc: "Phones, computers, audio" },
  { value: "collectibles", label: "Collectibles", icon: Gem, desc: "Coins, cards, rarities" },
  { value: "art", label: "Art & Design", icon: Palette, desc: "Paintings, prints, design" },
  { value: "fashion", label: "Fashion", icon: Shirt, desc: "Clothes, shoes, watches" },
  { value: "home", label: "Home & Garden", icon: Home, desc: "Furniture, tools, decor" },
  { value: "vehicles", label: "Vehicles", icon: Car, desc: "Cars, bikes, parts" },
  { value: "sports", label: "Sports", icon: Dumbbell, desc: "Gear, memorabilia" },
  { value: "other", label: "Other", icon: Boxes, desc: "Everything else" },
] as const;

type Item = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  condition: string | null;
  starting_price: number;
  current_price: number | null;
  buyout_price: number | null;
  location: string | null;
  image_url: string | null;
  image_urls: string[] | null;
  ends_at: string;
  created_at: string;
  featured_at: string | null;
  featured_until: string | null;
  premium_at: string | null;
  premium_until: string | null;
};

const isActive = (until?: string | null) => !!until && new Date(until).getTime() > Date.now();

const timeLeft = (endsAt: string) => {
  const diff = new Date(endsAt).getTime() - Date.now();
  if (diff <= 0) return "Ended";
  const h = Math.floor(diff / 3600000);
  const m = Math.floor((diff % 3600000) / 60000);
  if (h >= 24) return `${Math.floor(h / 24)}d ${h % 24}h left`;
  return `${h}h ${m}m left`;
};

export default function Auction() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { unread } = useAuctionUnread();
  const [params, setParams] = useSearchParams();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [debouncedQ, setDebouncedQ] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("ending_soon");
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [names, setNames] = useState<Record<string, { name: string; avatar: string | null }>>({});
  const [detail, setDetail] = useState<Item | null>(null);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [unlocking, setUnlocking] = useState(false);
  const [chatItem, setChatItem] = useState<Item | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidding, setBidding] = useState(false);
  const [reload, setReload] = useState(0);

  const category = params.get("category");
  const setCategory = (value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set("category", value);
    else next.delete("category");
    setParams(next, { replace: true });
  };

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const term = debouncedQ;
      let sellerMatches: string[] = [];
      if (term.length >= 2) {
        const { data: profs } = await (supabase as any)
          .from("public_profiles")
          .select("id")
          .or(`full_name.ilike.%${term}%,username.ilike.%${term}%`)
          .limit(50);
        sellerMatches = ((profs as any[]) || []).map((p) => p.id);
      }

      let query = (supabase as any)
        .from("auction_items")
        .select("id,user_id,title,description,category,condition,starting_price,current_price,buyout_price,location,image_url,image_urls,ends_at,created_at,featured_at,featured_until,premium_at,premium_until")
        .eq("is_active", true)
        .gt("ends_at", new Date().toISOString());
      if (category) query = query.eq("category", category);
      if (term.length >= 2) {
        const esc = term.replace(/[%,()]/g, " ");
        const ors = [
          `title.ilike.%${esc}%`,
          `description.ilike.%${esc}%`,
          `location.ilike.%${esc}%`,
          `category.ilike.%${esc}%`,
        ];
        if (sellerMatches.length) ors.push(`user_id.in.(${sellerMatches.join(",")})`);
        query = query.or(ors.join(","));
      }
      const { data } = await query
        .order("premium_until", { ascending: false, nullsFirst: false })
        .order("featured_until", { ascending: false, nullsFirst: false })
        .order("ends_at", { ascending: true })
        .limit(200);
      if (cancelled) return;
      const list = (data as Item[]) || [];
      setItems(list);

      const sellerIds = [...new Set(list.map((i) => i.user_id))];
      if (sellerIds.length) {
        const { data: profs } = await (supabase as any)
          .from("public_profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", sellerIds);
        const map: Record<string, { name: string; avatar: string | null }> = {};
        (profs || []).forEach((p: any) => {
          map[p.id] = { name: p.full_name || p.username || "Seller", avatar: p.avatar_url ?? null };
        });
        if (!cancelled) setNames(map);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [debouncedQ, category, reload]);

  useEffect(() => {
    if (!user) { setUnlocked(new Set()); return; }
    (async () => {
      const { data } = await (supabase as any)
        .from("auction_contact_unlocks")
        .select("auction_id")
        .eq("buyer_id", user.id);
      setUnlocked(new Set(((data as any[]) || []).map((r) => r.auction_id)));
    })();
  }, [user, reload]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    items.forEach((i) => { c[i.category] = (c[i.category] || 0) + 1; });
    return c;
  }, [items]);

  const filtered = useMemo(() => {
    let list = items;
    if (q.trim() && q.trim().length < 2) {
      const term = q.trim().toLowerCase();
      list = list.filter((i) => i.title.toLowerCase().includes(term));
    }
    if (location.trim()) {
      const term = location.toLowerCase();
      list = list.filter((i) => (i.location || "").toLowerCase().includes(term));
    }
    const price = (i: Item) => Number(i.current_price ?? i.starting_price);
    if (sort === "price_asc") list = [...list].sort((a, b) => price(a) - price(b));
    if (sort === "price_desc") list = [...list].sort((a, b) => price(b) - price(a));
    if (sort === "newest") list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    if (sort === "ending_soon") list = [...list].sort((a, b) => +new Date(a.ends_at) - +new Date(b.ends_at));
    return list;
  }, [items, q, location, sort]);

  const premiumList = useMemo(() => filtered.filter((i) => isActive(i.premium_until)), [filtered]);
  const standardList = useMemo(() => filtered.filter((i) => !isActive(i.premium_until)), [filtered]);
  const activeFolder = CATEGORY_FOLDERS.find((f) => f.value === category);

  const unlockContact = async (item: Item) => {
    if (!user) { navigate("/auth"); return; }
    if (item.user_id === user.id || unlocked.has(item.id)) { setChatItem(item); return; }
    setUnlocking(true);
    try {
      const { error } = await (supabase as any).rpc("unlock_auction_contact", { _auction_id: item.id });
      if (error) throw error;
      setUnlocked((prev) => new Set(prev).add(item.id));
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast({ title: "Contact unlocked", description: "2 credits used — you can now message the seller." });
      setChatItem(item);
    } catch (e: any) {
      const msg = String(e?.message || "");
      toast({
        title: "Could not unlock",
        description: msg.includes("INSUFFICIENT_CREDITS")
          ? "Not enough credits — the first message costs 2 credits."
          : msg || "Try again",
        variant: "destructive",
      });
    } finally {
      setUnlocking(false);
    }
  };

  const placeBid = async () => {
    if (!detail) return;
    if (!user) { navigate("/auth"); return; }
    const amount = Number(bidAmount);
    const currently = Number(detail.current_price ?? detail.starting_price);
    if (!Number.isFinite(amount) || amount <= 0) { toast({ title: "Enter a valid amount", variant: "destructive" }); return; }
    if (amount <= currently) { toast({ title: "Bid must be higher than the current bid", variant: "destructive" }); return; }
    setBidding(true);
    try {
      const { error } = await (supabase as any).rpc("place_auction_bid", { p_auction_id: detail.id, p_amount: amount });
      if (error) throw error;
      toast({ title: "Bid placed", description: `You are the highest bidder at €${amount.toFixed(2)}.` });
      setBidAmount("");
      setDetail({ ...detail, current_price: amount });
      setReload((r) => r + 1);
    } catch (e: any) {
      toast({ title: "Could not place bid", description: e?.message || "Try again", variant: "destructive" });
    } finally {
      setBidding(false);
    }
  };

  const renderCard = (i: Item) => {
    const premium = isActive(i.premium_until);
    const top = isActive(i.featured_until);
    const folder = CATEGORY_FOLDERS.find((f) => f.value === i.category);
    const Icon = folder?.icon ?? Boxes;
    const seller = names[i.user_id];
    const cover = i.image_url || i.image_urls?.[0];
    return (
      <div key={i.id} className="group/card relative">
        <button onClick={() => { setDetail(i); setBidAmount(""); }} className="block h-full w-full text-left">
          <Card
            className={`h-full overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_hsl(var(--primary)/0.55)] ${
              premium ? "border-accent/60 ring-1 ring-accent/30" : top ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
            }`}
          >
            <div className="flex gap-4 p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                {cover ? (
                  <img src={cover} alt={i.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center"><Icon className="h-8 w-8 text-muted-foreground" /></div>
                )}
                {premium && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-accent/80 to-transparent py-1 text-center text-[10px] font-black uppercase tracking-wider text-accent-foreground">
                    Premium
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 font-semibold leading-snug group-hover/card:text-primary">{maskContactInfo(i.title)}</h3>
                  <span className="flex shrink-0 items-center gap-0.5 text-base font-black text-primary">
                    <Euro className="h-4 w-4" />{Number(i.current_price ?? i.starting_price).toFixed(0)}
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{maskContactInfo(i.description || "")}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="capitalize">{folder?.label ?? i.category}</span>
                  {i.condition && <span>{i.condition}</span>}
                  {i.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {i.location}</span>}
                  <span className="flex items-center gap-1 font-medium text-primary"><Clock className="h-3.5 w-3.5" /> {timeLeft(i.ends_at)}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2 border-t border-border/70 px-4 py-2.5">
              <span className="flex items-center gap-2 text-xs text-muted-foreground">
                {seller?.avatar ? <img src={seller.avatar} alt={seller.name} className="h-5 w-5 rounded-full object-cover" /> : null}
                {seller?.name ?? "Seller"}
              </span>
              <div className="ml-auto">
                <PromotionBadge
                  featuredAt={i.featured_at}
                  featuredUntil={i.featured_until}
                  premiumAt={i.premium_at}
                  premiumUntil={i.premium_until}
                  size="xs"
                />
              </div>
            </div>
          </Card>
        </button>
        {user?.id === i.user_id && (
          <Button
            size="sm"
            variant="outline"
            className="absolute right-2 top-2 gap-1 bg-background/90 backdrop-blur"
            onClick={(e) => { e.preventDefault(); setPromoteId(i.id); }}
          >
            <Flame className="h-3.5 w-3.5" /> Promote
          </Button>
        )}
      </div>
    );
  };

  const detailUnlocked = !!detail && !!user && (detail.user_id === user.id || unlocked.has(detail.id));

  return (
    <>
      <SEO
        title="Auctions — bid free, publish for 2 credits"
        description="Browse live auctions for free and bid without fees. Publishing an auction costs 2 credits and the first message to a seller costs 2 credits. No commission."
        canonical="/auction"
      />
      <FloatingHowItWorks
        title="How Auctions work"
        steps={[
          { title: "Browse free", desc: "Pick a category or search live auctions — browsing and bidding are free." },
          { title: "Publish for 2 credits", desc: "Set a starting price, duration and photos. No commission on the sale." },
          { title: "Bid or message", desc: "Place bids instantly; the first message to a seller unlocks for 2 credits." },
          { title: "Close the deal directly", desc: "The winner and the seller agree payment and delivery off-platform." },
        ]}
      />

      <section className="relative overflow-hidden border-b border-border/40">
        <video autoPlay muted loop playsInline aria-hidden="true" className="absolute inset-0 h-full w-full object-cover" src={auctionHeroAsset.url} />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/20 to-transparent" />
        <div className="absolute -top-24 -right-24 h-96 w-96 animate-pulse rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -bottom-28 -left-20 h-80 w-80 animate-pulse rounded-full bg-accent/25 blur-3xl" />
        <div className="container relative mx-auto max-w-7xl px-4 py-16 text-center md:py-20">
          <Badge variant="outline" className="mb-5 border-white/40 bg-black/30 px-4 py-1.5 text-xs uppercase tracking-[0.2em] text-white backdrop-blur">
            <Sparkles className="mr-2 h-3.5 w-3.5" /> Auctions
          </Badge>
          <h1 className="bg-gradient-to-r from-white via-primary-foreground to-white/90 bg-clip-text text-4xl font-black leading-[1.05] text-transparent drop-shadow-lg md:text-6xl">
            Bid live. Win it your price.
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-base text-white/90 drop-shadow md:text-lg">
            Browsing and bidding are free. Publishing an auction costs 2 credits and the first message to a seller costs
            2 credits — then you settle directly, with zero commission.
          </p>
          <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button size="lg" className="gap-2 shadow-[0_10px_30px_-10px_hsl(var(--primary)/0.6)]" onClick={() => (user ? navigate("/auction/create") : navigate("/auth"))}>
              <Plus className="h-4 w-4" /> Start an auction · 2 credits
            </Button>
            <Button size="lg" variant="outline" className="gap-2 border-white/40 bg-black/30 text-white backdrop-blur hover:bg-white/10 hover:text-white" onClick={() => (user ? navigate("/auction/messages") : navigate("/auth"))}>
              <MessageCircle className="h-4 w-4" /> Messages
              {unread > 0 && (
                <span className="ml-1 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-destructive-foreground">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Button>
            {user && (
              <Button size="lg" variant="outline" className="gap-2 border-white/40 bg-black/30 text-white backdrop-blur hover:bg-white/10 hover:text-white" onClick={() => navigate("/auction/my")}>
                <Settings2 className="h-4 w-4" /> My auctions
              </Button>
            )}
          </div>
        </div>
      </section>

      <div className="bg-muted/30">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Browse auctions</h2>
              <p className="text-sm text-muted-foreground">Free to browse and bid — pick a category or search everything.</p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={() => (user ? navigate("/auction/messages") : navigate("/auth"))}>
                <MessageCircle className="h-4 w-4" /> Messages
                {unread > 0 && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-destructive px-1.5 text-[11px] font-bold text-destructive-foreground">
                    {unread > 9 ? "9+" : unread}
                  </span>
                )}
              </Button>
              <Button className="w-full gap-2 sm:w-auto" onClick={() => (user ? navigate("/auction/create") : navigate("/auth"))}>
                <Plus className="h-4 w-4" />
                <span className="sm:hidden">Auction · 2 cr</span>
                <span className="hidden sm:inline">Start an auction · 2 credits</span>
              </Button>
            </div>
          </header>

          {!category ? (
            <>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Categories</h3>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {CATEGORY_FOLDERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setCategory(f.value)}
                    className="group relative flex items-center gap-3 overflow-hidden rounded-xl border border-border bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:border-primary/50 hover:shadow-[0_14px_30px_-16px_hsl(var(--primary)/0.5)]"
                  >
                    <span className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-primary/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                    <span className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary/20 to-accent/20">
                      <f.icon className="h-5 w-5 text-primary" />
                    </span>
                    <span className="relative min-w-0 flex-1">
                      <span className="block font-medium">{f.label}</span>
                      <span className="block truncate text-xs text-muted-foreground">{f.desc}</span>
                      <span className="mt-0.5 block text-xs text-muted-foreground">
                        {loading ? "…" : `${counts[f.value] || 0} auction${(counts[f.value] || 0) === 1 ? "" : "s"}`}
                      </span>
                    </span>
                    <ChevronRight className="relative h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </button>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-center gap-2">
                <Button variant="ghost" size="sm" className="gap-2" onClick={() => setCategory(null)}>
                  <ArrowLeft className="h-4 w-4" /> All categories
                </Button>
                <h2 className="text-lg font-semibold">{activeFolder?.label ?? category}</h2>
              </div>

              <div className="mb-5 grid grid-cols-1 gap-3 rounded-xl border border-border bg-card p-3 md:grid-cols-3">
                <div className="relative md:col-span-2">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search auctions, sellers…" className="pl-9" />
                </div>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City / area" />
                <div className="flex flex-wrap items-center justify-between gap-2 md:col-span-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{filtered.length}</span> result{filtered.length === 1 ? "" : "s"}
                  </p>
                  <Select value={sort} onValueChange={setSort}>
                    <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ending_soon">Ending soonest</SelectItem>
                      <SelectItem value="newest">Newest</SelectItem>
                      <SelectItem value="price_asc">Bid: low to high</SelectItem>
                      <SelectItem value="price_desc">Bid: high to low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {loading ? (
                <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
                  {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-40 w-full rounded-xl" />)}
                </div>
              ) : filtered.length === 0 ? (
                <Card className="rounded-xl border-dashed">
                  <CardContent className="p-10 text-center">
                    <p className="text-muted-foreground">
                      No live auctions in this category. Be the first to{" "}
                      <Link to="/auction/create" className="font-medium text-primary underline">start one</Link>.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {premiumList.length > 0 && (
                    <section>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        <Crown className="h-4 w-4 text-accent" /> Premium auctions
                      </h3>
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{premiumList.map(renderCard)}</div>
                    </section>
                  )}
                  <section>
                    {premiumList.length > 0 && (
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Standard &amp; Top auctions</h3>
                    )}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{standardList.map(renderCard)}</div>
                  </section>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">{maskContactInfo(detail.title)}</DialogTitle>
                <DialogDescription>
                  {(CATEGORY_FOLDERS.find((f) => f.value === detail.category)?.label ?? detail.category)}
                  {detail.condition ? ` · ${detail.condition}` : ""}
                  {detail.location ? ` · ${detail.location}` : ""}
                </DialogDescription>
              </DialogHeader>

              {(detail.image_urls?.length ? detail.image_urls : detail.image_url ? [detail.image_url] : []).length > 0 && (
                <div className="flex gap-2 overflow-x-auto">
                  {(detail.image_urls?.length ? detail.image_urls : [detail.image_url as string]).map((u) => (
                    <img key={u} src={u} alt={detail.title} className="h-40 w-40 shrink-0 rounded-lg object-cover" loading="lazy" />
                  ))}
                </div>
              )}

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-muted-foreground">Current bid</p>
                  <span className="flex items-center gap-1 text-2xl font-black text-primary">
                    <Euro className="h-5 w-5" />{Number(detail.current_price ?? detail.starting_price).toFixed(0)}
                  </span>
                  <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" /> {timeLeft(detail.ends_at)}
                  </p>
                </div>
                <PromotionBadge
                  featuredAt={detail.featured_at}
                  featuredUntil={detail.featured_until}
                  premiumAt={detail.premium_at}
                  premiumUntil={detail.premium_until}
                />
              </div>

              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{maskContactInfo(detail.description || "")}</p>
              <p className="text-xs text-muted-foreground">
                Seller: {names[detail.user_id]?.name ?? "Seller"}
                {detail.buyout_price ? ` · Buy-now idea: €${Number(detail.buyout_price).toFixed(0)}` : ""}
              </p>

              {user?.id !== detail.user_id && (
                <div className="flex gap-2">
                  <Input
                    type="number"
                    inputMode="decimal"
                    value={bidAmount}
                    onChange={(e) => setBidAmount(e.target.value)}
                    placeholder={`More than €${Number(detail.current_price ?? detail.starting_price).toFixed(0)}`}
                  />
                  <Button className="gap-2" onClick={placeBid} disabled={bidding}>
                    {bidding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Gavel className="h-4 w-4" />} Bid
                  </Button>
                </div>
              )}

              <div className="flex flex-col gap-2 sm:flex-row">
                {user?.id === detail.user_id ? (
                  <>
                    <Button variant="outline" className="flex-1 gap-2" onClick={() => setPromoteId(detail.id)}>
                      <Flame className="h-4 w-4" /> Promote
                    </Button>
                    <Button variant="secondary" className="gap-2" onClick={() => navigate("/auction/my")}>
                      <Settings2 className="h-4 w-4" /> Manage
                    </Button>
                  </>
                ) : (
                  <>
                    <Button
                      className="flex-1 gap-2"
                      disabled={unlocking}
                      onClick={() => {
                        setBuyIntent(
                          `Hi, I would like to buy "${detail.title}"${detail.buyout_price ? ` for €${Number(detail.buyout_price).toFixed(0)}` : ""}. Can we agree on the details?`,
                        );
                        unlockContact(detail);
                      }}
                    >
                      {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />} Buy
                    </Button>
                    <Button className="flex-1 gap-2" variant="outline" disabled={unlocking} onClick={() => { setBuyIntent(""); unlockContact(detail); }}>
                      {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : detailUnlocked ? <MessageCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                      {detailUnlocked ? "Message seller" : "Message seller · 2 credits"}
                    </Button>
                  </>
                )}
              </div>
              {user?.id !== detail.user_id && (
                <p className="text-xs text-muted-foreground">
                  Bidding is free. Buying happens directly with the seller in chat — no platform payment, no commission.
                  {!detailUnlocked ? " Contact details stay hidden until you unlock the chat for 2 credits." : ""}
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <AuctionPromoteDialog
        itemId={promoteId}
        open={!!promoteId}
        onOpenChange={(v) => !v && setPromoteId(null)}
        onPromoted={() => setReload((r) => r + 1)}
      />

      {chatItem && (
        <AuctionChatDialog
          open={!!chatItem}
          onOpenChange={(o) => !o && setChatItem(null)}
          auctionId={chatItem.id}
          auctionTitle={chatItem.title}
          otherId={chatItem.user_id}
          otherName={names[chatItem.user_id]?.name}
        />
      )}
    </>
  );
}
