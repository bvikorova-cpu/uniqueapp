import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { maskContactInfo } from "@/lib/contactMask";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Plus, Search, MapPin, Euro, ArrowLeft, Crown, Flame, ChevronRight, MessageCircle, Lock, Loader2,
  Trash2, Store, Gift, Sparkles, Zap, Star, Package, Ticket, Tag, Clock,
} from "lucide-react";
import { SEO } from "@/components/SEO";
import { useToast } from "@/hooks/use-toast";
import { PromotionBadge } from "@/components/skills/PromotionBadge";
import { CouponHero } from "@/components/coupon/CouponHero";
import { CouponPromoteDialog } from "@/components/coupon/CouponPromoteDialog";
import { CouponChatDialog } from "@/components/coupon/CouponChatDialog";

const CATEGORY_FOLDERS = [
  { value: "food", label: "Food & Dining", icon: Store, desc: "Restaurants, delivery, cafés" },
  { value: "shopping", label: "Shopping", icon: Gift, desc: "Fashion, gift cards, retail" },
  { value: "entertainment", label: "Entertainment", icon: Sparkles, desc: "Cinema, events, streaming" },
  { value: "travel", label: "Travel", icon: Zap, desc: "Flights, hotels, transport" },
  { value: "beauty", label: "Beauty & Spa", icon: Star, desc: "Salons, cosmetics, wellness" },
  { value: "tech", label: "Tech & Electronics", icon: Package, desc: "Gadgets, software, gaming" },
  { value: "general", label: "General", icon: Ticket, desc: "Everything else" },
] as const;

const COUPON_TYPES: Record<string, string> = {
  discount_code: "Discount code",
  gift_card: "Gift card",
  voucher: "Voucher",
  cashback: "Cashback",
  bogo: "Buy one get one",
};

type Coupon = {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  store_name: string;
  original_value: number;
  selling_price: number;
  expiry_date: string | null;
  category: string;
  coupon_type: string;
  image_url: string | null;
  terms_conditions: string | null;
  is_sold: boolean;
  created_at: string;
  location: string | null;
  featured_at: string | null;
  featured_until: string | null;
  premium_at: string | null;
  premium_until: string | null;
};

const isActive = (until?: string | null) => !!until && new Date(until).getTime() > Date.now();
const discountPct = (c: Coupon) =>
  c.original_value > 0 ? Math.round(((c.original_value - c.selling_price) / c.original_value) * 100) : 0;

export default function CouponMarketplace() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [sort, setSort] = useState("newest");
  const [hideExpired, setHideExpired] = useState(true);
  const [names, setNames] = useState<Record<string, { name: string; avatar: string | null }>>({});
  const [detail, setDetail] = useState<Coupon | null>(null);
  const [unlocked, setUnlocked] = useState<Set<string>>(new Set());
  const [unlocking, setUnlocking] = useState(false);
  const [chatCoupon, setChatCoupon] = useState<Coupon | null>(null);
  const [promoteId, setPromoteId] = useState<string | null>(null);
  const [reload, setReload] = useState(0);

  const category = params.get("category");
  const setCategory = (value: string | null) => {
    const next = new URLSearchParams(params);
    if (value) next.set("category", value);
    else next.delete("category");
    setParams(next, { replace: true });
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any).rpc("get_public_coupon_listings");
      if (cancelled) return;
      const list = (((data as any[]) || []) as Coupon[]).filter((c) => !c.is_sold);
      setCoupons(list);

      const sellerIds = [...new Set(list.map((c) => c.user_id))];
      if (sellerIds.length) {
        const { data: profs } = await (supabase as any)
          .from("public_profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", sellerIds);
        const map: Record<string, { name: string; avatar: string | null }> = {};
        ((profs as any[]) || []).forEach((p) => {
          map[p.id] = { name: p.full_name || p.username || "Seller", avatar: p.avatar_url ?? null };
        });
        if (!cancelled) setNames(map);
      }
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [reload]);

  useEffect(() => {
    if (!user) { setUnlocked(new Set()); return; }
    (async () => {
      const { data } = await (supabase as any)
        .from("coupon_contact_unlocks")
        .select("coupon_id")
        .eq("buyer_id", user.id);
      setUnlocked(new Set(((data as any[]) || []).map((r) => r.coupon_id)));
    })();
  }, [user, reload]);

  const counts = useMemo(() => {
    const c: Record<string, number> = {};
    coupons.forEach((i) => { c[i.category] = (c[i.category] || 0) + 1; });
    return c;
  }, [coupons]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const now = Date.now();
    let list = coupons.filter((c) => {
      if (category && c.category !== category) return false;
      if (hideExpired && c.expiry_date && new Date(c.expiry_date).getTime() < now) return false;
      if (location.trim() && !(c.location || "").toLowerCase().includes(location.trim().toLowerCase())) return false;
      if (!term) return true;
      const seller = names[c.user_id]?.name?.toLowerCase() || "";
      return (
        c.title.toLowerCase().includes(term) ||
        (c.description || "").toLowerCase().includes(term) ||
        c.store_name.toLowerCase().includes(term) ||
        c.category.toLowerCase().includes(term) ||
        seller.includes(term)
      );
    });

    if (sort === "price_asc") list = [...list].sort((a, b) => Number(a.selling_price) - Number(b.selling_price));
    else if (sort === "price_desc") list = [...list].sort((a, b) => Number(b.selling_price) - Number(a.selling_price));
    else if (sort === "discount_desc") list = [...list].sort((a, b) => discountPct(b) - discountPct(a));
    else if (sort === "expiry_asc")
      list = [...list].sort((a, b) => {
        const ax = a.expiry_date ? new Date(a.expiry_date).getTime() : Infinity;
        const bx = b.expiry_date ? new Date(b.expiry_date).getTime() : Infinity;
        return ax - bx;
      });
    else list = [...list].sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

    // promoted listings always float to the top of their group
    return [...list].sort((a, b) => Number(isActive(b.featured_until)) - Number(isActive(a.featured_until)));
  }, [coupons, category, q, location, sort, hideExpired, names]);

  const premiumList = useMemo(() => filtered.filter((c) => isActive(c.premium_until)), [filtered]);
  const standardList = useMemo(() => filtered.filter((c) => !isActive(c.premium_until)), [filtered]);
  const activeFolder = CATEGORY_FOLDERS.find((f) => f.value === category);

  const unlockContact = async (coupon: Coupon) => {
    if (!user) { navigate("/auth"); return; }
    if (coupon.user_id === user.id || unlocked.has(coupon.id)) { setChatCoupon(coupon); return; }
    setUnlocking(true);
    try {
      const { error } = await (supabase as any).rpc("unlock_coupon_contact", { _coupon_id: coupon.id });
      if (error) throw error;
      setUnlocked((prev) => new Set(prev).add(coupon.id));
      window.dispatchEvent(new Event("ai-credits-updated"));
      toast({ title: "Contact unlocked", description: "2 credits used — you can now message the seller." });
      setChatCoupon(coupon);
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

  const deleteCoupon = async (coupon: Coupon) => {
    const { error } = await (supabase as any).from("coupon_listings").delete().eq("id", coupon.id);
    if (error) { toast({ title: "Delete failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Listing deleted" });
    setDetail(null);
    setReload((r) => r + 1);
  };

  const renderCard = (c: Coupon) => {
    const premium = isActive(c.premium_until);
    const top = isActive(c.featured_until);
    const folder = CATEGORY_FOLDERS.find((f) => f.value === c.category);
    const Icon = folder?.icon ?? Ticket;
    const seller = names[c.user_id];
    const pct = discountPct(c);
    return (
      <div key={c.id} className="group/card relative">
        <button onClick={() => setDetail(c)} className="block h-full w-full text-left">
          <Card
            className={`h-full overflow-hidden rounded-xl bg-card/80 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_40px_-18px_hsl(var(--primary)/0.55)] ${
              premium ? "border-accent/60 ring-1 ring-accent/30" : top ? "border-primary/50 ring-1 ring-primary/20" : "border-border"
            }`}
          >
            <div className="flex gap-4 p-4">
              <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-muted">
                {c.image_url ? (
                  <img src={c.image_url} alt={c.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover/card:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {pct > 0 && (
                  <span className="absolute left-1 top-1 rounded-md bg-primary px-1.5 py-0.5 text-[10px] font-black text-primary-foreground">
                    -{pct}%
                  </span>
                )}
                {premium && (
                  <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-accent/80 to-transparent py-1 text-center text-[10px] font-black uppercase tracking-wider text-accent-foreground">
                    Premium
                  </span>
                )}
              </div>
              <div className="min-w-0 flex-1 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="line-clamp-2 font-semibold leading-snug group-hover/card:text-primary">
                    {maskContactInfo(c.title)}
                  </h3>
                  <span className="flex shrink-0 flex-col items-end">
                    <span className="flex items-center gap-0.5 text-base font-black text-primary">
                      <Euro className="h-4 w-4" />{Number(c.selling_price).toFixed(0)}
                    </span>
                    <span className="text-[11px] text-muted-foreground line-through">€{Number(c.original_value).toFixed(0)}</span>
                  </span>
                </div>
                <p className="line-clamp-2 text-sm text-muted-foreground">{maskContactInfo(c.description || "")}</p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Store className="h-3.5 w-3.5" /> {c.store_name}</span>
                  <span>{COUPON_TYPES[c.coupon_type] ?? c.coupon_type}</span>
                  {c.expiry_date && (
                    <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" /> {new Date(c.expiry_date).toLocaleDateString()}</span>
                  )}
                  {c.location && <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> {c.location}</span>}
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
                  featuredAt={c.featured_at}
                  featuredUntil={c.featured_until}
                  premiumAt={c.premium_at}
                  premiumUntil={c.premium_until}
                  size="xs"
                />
              </div>
            </div>
          </Card>
        </button>
        {user?.id === c.user_id && (
          <Button
            size="sm"
            variant="outline"
            className="absolute right-2 top-2 gap-1 bg-background/90 backdrop-blur"
            onClick={(e) => { e.preventDefault(); setPromoteId(c.id); }}
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
        title="Coupon Marketplace — buy and sell coupons"
        description="Browse coupons, gift cards and vouchers for free. Publishing a listing costs 2 credits, the first message to a seller costs 2 credits. No commission."
        canonical="/coupon-marketplace"
      />

      <div className="min-h-screen bg-background pb-12 pt-16 sm:pt-20">
        <div className="container mx-auto max-w-7xl px-3 sm:px-4">
          <CouponHero couponCount={coupons.length} />

          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold tracking-tight">Browse coupons</h2>
              <p className="text-sm text-muted-foreground">
                Free to browse · posting 2 credits · first message 2 credits · no commission
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="w-full gap-2 sm:w-auto" onClick={() => (user ? navigate("/coupon-marketplace/messages") : navigate("/auth"))}>
                <MessageCircle className="h-4 w-4" /> Messages
              </Button>
              <Button className="w-full gap-2 sm:w-auto" onClick={() => (user ? navigate("/coupon-marketplace/create") : navigate("/auth"))}>
                <Plus className="h-4 w-4" />
                <span className="sm:hidden">Post · 2 cr</span>
                <span className="hidden sm:inline">Post a coupon · 2 credits</span>
              </Button>
            </div>
          </div>

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
                        {loading ? "…" : `${counts[f.value] || 0} coupon${(counts[f.value] || 0) === 1 ? "" : "s"}`}
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
                  <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search coupons, stores, sellers…" className="pl-9" />
                </div>
                <Input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="City / area" />
                <div className="flex flex-wrap items-center justify-between gap-2 md:col-span-3">
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold text-foreground">{filtered.length}</span> result{filtered.length === 1 ? "" : "s"}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button variant={hideExpired ? "default" : "outline"} size="sm" className="gap-1" onClick={() => setHideExpired((v) => !v)}>
                      <Tag className="h-3.5 w-3.5" /> {hideExpired ? "Hiding expired" : "Showing expired"}
                    </Button>
                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="newest">Newest</SelectItem>
                        <SelectItem value="discount_desc">Biggest discount</SelectItem>
                        <SelectItem value="price_asc">Price: low to high</SelectItem>
                        <SelectItem value="price_desc">Price: high to low</SelectItem>
                        <SelectItem value="expiry_asc">Expiring soon</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
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
                      No coupons in this category yet. Be the first to{" "}
                      <Link to="/coupon-marketplace/create" className="font-medium text-primary underline">post one</Link>.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-8">
                  {premiumList.length > 0 && (
                    <section>
                      <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        <Crown className="h-4 w-4 text-accent" /> Premium coupons
                      </h3>
                      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{premiumList.map(renderCard)}</div>
                    </section>
                  )}
                  <section>
                    {premiumList.length > 0 && (
                      <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                        Standard &amp; Top coupons
                      </h3>
                    )}
                    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">{standardList.map(renderCard)}</div>
                  </section>
                </div>
              )}
            </>
          )}

        </div>
      </div>

      {/* Listing detail */}
      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-lg">
          {detail && (
            <>
              <DialogHeader>
                <DialogTitle className="pr-8">{maskContactInfo(detail.title)}</DialogTitle>
                <DialogDescription>
                  {detail.store_name} · {COUPON_TYPES[detail.coupon_type] ?? detail.coupon_type}
                  {detail.location ? ` · ${detail.location}` : ""}
                  {detail.expiry_date ? ` · valid until ${new Date(detail.expiry_date).toLocaleDateString()}` : ""}
                </DialogDescription>
              </DialogHeader>

              {detail.image_url && (
                <img src={detail.image_url} alt={detail.title} className="h-44 w-full rounded-lg object-cover" loading="lazy" />
              )}

              <div className="flex items-center justify-between">
                <span className="flex items-baseline gap-2">
                  <span className="flex items-center gap-1 text-2xl font-black text-primary">
                    <Euro className="h-5 w-5" />{Number(detail.selling_price).toFixed(0)}
                  </span>
                  <span className="text-sm text-muted-foreground line-through">€{Number(detail.original_value).toFixed(0)}</span>
                  <Badge variant="secondary">-{discountPct(detail)}%</Badge>
                </span>
                <PromotionBadge
                  featuredAt={detail.featured_at}
                  featuredUntil={detail.featured_until}
                  premiumAt={detail.premium_at}
                  premiumUntil={detail.premium_until}
                />
              </div>

              <p className="whitespace-pre-wrap text-sm text-muted-foreground">{maskContactInfo(detail.description || "")}</p>
              {detail.terms_conditions && (
                <p className="whitespace-pre-wrap text-xs text-muted-foreground">
                  Terms: {maskContactInfo(detail.terms_conditions)}
                </p>
              )}

              <p className="text-xs text-muted-foreground">Seller: {names[detail.user_id]?.name ?? "Seller"}</p>

              <div className="flex flex-col gap-2 sm:flex-row">
                {user?.id === detail.user_id ? (
                  <>
                    <Button variant="outline" className="flex-1 gap-2" onClick={() => setPromoteId(detail.id)}>
                      <Flame className="h-4 w-4" /> Promote
                    </Button>
                    <Button variant="destructive" className="gap-2" onClick={() => deleteCoupon(detail)}>
                      <Trash2 className="h-4 w-4" /> Delete
                    </Button>
                  </>
                ) : (
                  <Button className="flex-1 gap-2" disabled={unlocking} onClick={() => unlockContact(detail)}>
                    {unlocking ? <Loader2 className="h-4 w-4 animate-spin" /> : detailUnlocked ? <MessageCircle className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                    {detailUnlocked ? "Message seller" : "Message seller · 2 credits"}
                  </Button>
                )}
              </div>
              {!detailUnlocked && user?.id !== detail.user_id && (
                <p className="text-xs text-muted-foreground">
                  Contact details are hidden until you unlock the chat for 2 credits. After that you deal directly — no commission.
                </p>
              )}
            </>
          )}
        </DialogContent>
      </Dialog>

      <CouponPromoteDialog
        couponId={promoteId}
        open={!!promoteId}
        onOpenChange={(v) => !v && setPromoteId(null)}
        onPromoted={() => setReload((r) => r + 1)}
      />

      {chatCoupon && (
        <CouponChatDialog
          open={!!chatCoupon}
          onOpenChange={(o) => !o && setChatCoupon(null)}
          couponId={chatCoupon.id}
          couponTitle={chatCoupon.title}
          otherId={chatCoupon.user_id}
          otherName={names[chatCoupon.user_id]?.name}
        />
      )}
    </>
  );
}
