import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { GiftVisual } from "@/components/gifts/GiftVisual";
import { Gift, Inbox, Send, Coins, ArrowLeft, Wallet, Euro } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface Row {
  id: string;
  sender_id: string;
  recipient_id: string;
  credits_spent: number;
  recipient_share_credits: number;
  recipient_share_eur: number | null;
  created_at: string;
  post_id: string | null;
  gift_catalog: { name: string; slug: string; animation: string; image_url: string | null } | null;
}

type Profile = { id: string; full_name: string | null; username: string | null; avatar_url: string | null };

type Balance = { earned_eur: number; withdrawn_eur: number; available_eur: number; min_eur: number };

export default function GiftsInbox() {
  const { user } = useAuth();
  const [received, setReceived] = useState<Row[]>([]);
  const [sent, setSent] = useState<Row[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [balance, setBalance] = useState<Balance | null>(null);
  const [cashingOut, setCashingOut] = useState(false);
  const [loading, setLoading] = useState(true);


  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const select =
      "id, sender_id, recipient_id, credits_spent, recipient_share_credits, recipient_share_eur, created_at, post_id, gift_catalog:gift_id(name, slug, animation, image_url)";

    const [inRes, outRes] = await Promise.all([
      (supabase as any)
        .from("gift_transactions")
        .select(select)
        .eq("recipient_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200),
      (supabase as any)
        .from("gift_transactions")
        .select(select)
        .eq("sender_id", user.id)
        .order("created_at", { ascending: false })
        .limit(200),
    ]);
    const inRows = (inRes.data as Row[]) ?? [];
    const outRows = (outRes.data as Row[]) ?? [];
    setReceived(inRows);
    setSent(outRows);

    const ids = [
      ...new Set([...inRows.map((r) => r.sender_id), ...outRows.map((r) => r.recipient_id)]),
    ].filter(Boolean);
    if (ids.length) {
      const map: Record<string, Profile> = {};
      const { data: pub } = await (supabase as any)
        .from("public_profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", ids);
      (pub ?? []).forEach((p: any) => (map[p.id] = p));
      const missing = ids.filter((id) => !map[id]);
      if (missing.length) {
        const { data: profs } = await supabase
          .from("profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", missing);
        (profs ?? []).forEach((p: any) => (map[p.id] = p));
      }
      setProfiles(map);
    }
    const { data: bal } = await (supabase as any).rpc("get_gift_withdrawable");
    if (bal && !bal.error) {
      setBalance({
        earned_eur: Number(bal.earned_eur ?? 0),
        withdrawn_eur: Number(bal.withdrawn_eur ?? 0),
        available_eur: Number(bal.available_eur ?? 0),
        min_eur: Number(bal.min_eur ?? 20),
      });
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const handleCashout = async () => {
    setCashingOut(true);
    const { data, error } = await (supabase as any).rpc("cashout_gift_earnings");
    setCashingOut(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (data?.success) {
      toast.success(`Payout requested: €${Number(data.amount_eur).toFixed(2)}`);
      load();
    } else if (data?.error === "below_minimum") {
      toast.error(`Minimum payout is €${data.min_eur}. Available: €${Number(data.available_eur).toFixed(2)}`);
    } else {
      toast.error("Payout failed");
    }
  };

  const earnedEur = balance?.earned_eur ?? received.reduce((s, r) => s + Number(r.recipient_share_eur || 0), 0);
  const availableEur = balance?.available_eur ?? 0;
  const spent = sent.reduce((s, r) => s + (r.credits_spent || 0), 0);


  const name = (id: string) =>
    profiles[id]?.full_name || profiles[id]?.username || "Unique user";

  const PersonChip = ({ id }: { id: string }) => {
    const p = profiles[id];
    const initials = (name(id) || "U").slice(0, 2).toUpperCase();
    return (
      <Link
        to={`/profile/${id}`}
        className="inline-flex items-center gap-1.5 align-middle hover:underline"
      >
        <Avatar className="h-5 w-5">
          <AvatarImage src={p?.avatar_url ?? undefined} alt={name(id)} />
          <AvatarFallback className="text-[9px]">{initials}</AvatarFallback>
        </Avatar>
        <span className="font-medium text-foreground">{name(id)}</span>
      </Link>
    );
  };


  const List = ({ rows, mode }: { rows: Row[]; mode: "in" | "out" }) => {
    if (loading) return <Skeleton className="h-40 w-full" />;
    if (!rows.length)
      return (
        <div className="py-12 text-center text-muted-foreground">
          <Inbox className="mx-auto mb-3 h-8 w-8 opacity-50" />
          {mode === "in" ? "No gifts received yet." : "You have not sent any gifts yet."}
        </div>
      );
    return (
      <div className="divide-y">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center gap-3 py-3">
            <div className="h-12 w-12 shrink-0">
              <GiftVisual
                slug={r.gift_catalog?.slug ?? ""}
                name={r.gift_catalog?.name ?? "Gift"}
                image_url={r.gift_catalog?.image_url ?? null}
                animation={r.gift_catalog?.animation ?? "none"}
                size={48}

              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {r.gift_catalog?.name ?? "Gift"}{" "}
                <span className="text-muted-foreground font-normal">
                  {mode === "in" ? "from " : "to "}
                  <PersonChip id={mode === "in" ? r.sender_id : r.recipient_id} />

                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(r.created_at), "d MMM yyyy, HH:mm")}
                {r.post_id ? " · post" : " · chat"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-primary">
                {mode === "in"
                  ? `+€${Number(r.recipient_share_eur || 0).toFixed(2)}`
                  : `-${r.credits_spent}`}
              </p>
              <p className="text-[10px] text-muted-foreground">
                {mode === "in" ? "earnings" : "credits"}
              </p>
            </div>

          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto max-w-3xl px-3 py-6">
      <Button asChild variant="ghost" size="sm" className="mb-4 gap-1">
        <Link to="/profile">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
      </Button>

      <h1 className="mb-1 flex items-center gap-2 text-2xl font-bold">
        <Gift className="h-6 w-6 text-primary" /> My gifts
      </h1>

      <p className="mb-5 text-sm text-muted-foreground">
        Every gift you receive earns you 50% of its value in euros (1 credit = €0.50, so €0.25 per
        credit for you). Withdraw once you reach €{balance?.min_eur ?? 20}.
      </p>


      <div className="mb-5 grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Earned from gifts</p>
            <p className="flex items-center gap-1.5 text-2xl font-bold text-primary">
              <Euro className="h-5 w-5" /> {earnedEur.toFixed(2)}
            </p>
            <p className="text-[11px] font-semibold text-foreground">
              €{availableEur.toFixed(2)} available
            </p>
            <p className="text-[11px] text-muted-foreground">{received.length} gifts received</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Spent on gifts</p>
            <p className="flex items-center gap-1.5 text-2xl font-bold">
              <Send className="h-5 w-5" /> {spent}
            </p>
            <p className="flex items-center gap-1 text-[11px] font-semibold text-foreground">
              <Coins className="h-3 w-3" /> credits
            </p>
            <p className="text-[11px] text-muted-foreground">{sent.length} gifts sent</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-5">
        <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2">
            <Wallet className="mt-0.5 h-5 w-5 text-primary" />
            <div>
              <p className="text-sm font-medium">Payouts</p>
              <p className="text-xs text-muted-foreground">
                Gift earnings are paid in euros. Request a payout once your available balance reaches
                €{balance?.min_eur ?? 20}. Withdrawn so far: €
                {(balance?.withdrawn_eur ?? 0).toFixed(2)}.
              </p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleCashout}
            disabled={cashingOut || availableEur < (balance?.min_eur ?? 20)}
          >
            {cashingOut ? "Processing…" : `Withdraw €${availableEur.toFixed(2)}`}
          </Button>
        </CardContent>
      </Card>


      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Gift history</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="in">
            <TabsList className="mb-2">
              <TabsTrigger value="in">Received ({received.length})</TabsTrigger>
              <TabsTrigger value="out">Sent ({sent.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="in">
              <List rows={received} mode="in" />
            </TabsContent>
            <TabsContent value="out">
              <List rows={sent} mode="out" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
