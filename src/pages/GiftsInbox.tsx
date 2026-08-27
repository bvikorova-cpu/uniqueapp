import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { GiftVisual } from "@/components/gifts/GiftVisual";
import { Gift, Inbox, Send, Coins, ArrowLeft, Wallet } from "lucide-react";
import { format } from "date-fns";

interface Row {
  id: string;
  sender_id: string;
  recipient_id: string;
  credits_spent: number;
  recipient_share_credits: number;
  created_at: string;
  post_id: string | null;
  gift_catalog: { name: string; slug: string; animation: string; image_url: string | null } | null;
}

type Profile = { id: string; full_name: string | null; username: string | null; avatar_url: string | null };

export default function GiftsInbox() {
  const { user } = useAuth();
  const [received, setReceived] = useState<Row[]>([]);
  const [sent, setSent] = useState<Row[]>([]);
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const select =
      "id, sender_id, recipient_id, credits_spent, recipient_share_credits, created_at, post_id, gift_catalog:gift_id(name, slug, animation, image_url)";
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
      const { data: profs } = await supabase
        .from("profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", ids);
      const map: Record<string, Profile> = {};
      (profs ?? []).forEach((p: any) => (map[p.id] = p));
      setProfiles(map);
    }
    setLoading(false);
  }, [user?.id]);

  useEffect(() => {
    load();
  }, [load]);

  const earned = received.reduce((s, r) => s + (r.recipient_share_credits || 0), 0);
  const spent = sent.reduce((s, r) => s + (r.credits_spent || 0), 0);

  const name = (id: string) =>
    profiles[id]?.full_name || profiles[id]?.username || "Unique user";

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
                imageUrl={r.gift_catalog?.image_url ?? null}
                animation={r.gift_catalog?.animation ?? "none"}
                size={48}

              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {r.gift_catalog?.name ?? "Gift"}{" "}
                <span className="text-muted-foreground font-normal">
                  {mode === "in" ? `from ${name(r.sender_id)}` : `to ${name(r.recipient_id)}`}
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(r.created_at), "d MMM yyyy, HH:mm")}
                {r.post_id ? " · post" : " · chat"}
              </p>
            </div>
            <div className="shrink-0 text-right">
              <p className="text-sm font-semibold text-primary">
                {mode === "in" ? `+${r.recipient_share_credits}` : `-${r.credits_spent}`}
              </p>
              <p className="text-[10px] text-muted-foreground">credits</p>
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
        Every gift you receive credits 50% of its value to your credit balance.
      </p>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">Earned from gifts</p>
            <p className="flex items-center gap-1.5 text-2xl font-bold text-primary">
              <Coins className="h-5 w-5" /> {earned}
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
                Gift credits land in your credit balance and can be spent anywhere on Unique. Cash
                payouts (min. €20) are handled in Earnings.
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="secondary">
            <Link to="/earnings">Open Earnings</Link>
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
