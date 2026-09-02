import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { AuctionChatDialog } from "@/components/auction/AuctionChatDialog";
import { maskContactInfo } from "@/lib/contactMask";
import { ArrowLeft, Gavel, MessageCircle, Store } from "lucide-react";

interface Msg {
  id: string;
  auction_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean | null;
  created_at: string;
}

interface Item {
  id: string;
  title: string;
  image_url: string | null;
  current_price: number | null;
  user_id: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface Thread {
  auctionId: string;
  otherId: string;
  item: Item | null;
  other: Profile | null;
  lastMessage: Msg;
  unreadCount: number;
  isSelling: boolean;
}

export default function AuctionMessages() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [items, setItems] = useState<Record<string, Item>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [activeThread, setActiveThread] = useState<Thread | null>(null);
  const [tab, setTab] = useState("all");

  useEffect(() => {
    if (!user) return;
    let cancelled = false;

    const load = async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("auction_messages")
        .select("id, auction_id, sender_id, receiver_id, message, is_read, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(500);
      if (cancelled) return;
      const rows = ((data as Msg[]) || []);
      setMessages(rows);

      const auctionIds = [...new Set(rows.map((m) => m.auction_id))];
      const otherIds = [...new Set(rows.map((m) => (m.sender_id === user.id ? m.receiver_id : m.sender_id)))];

      if (auctionIds.length) {
        const { data: its } = await (supabase as any)
          .from("auction_items")
          .select("id, title, image_url, current_price, user_id")
          .in("id", auctionIds);
        const map: Record<string, Item> = {};
        ((its as Item[]) || []).forEach((i) => { map[i.id] = i; });
        if (!cancelled) setItems(map);
      }
      if (otherIds.length) {
        const { data: profs } = await (supabase as any)
          .from("public_profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", otherIds);
        const map: Record<string, Profile> = {};
        ((profs as Profile[]) || []).forEach((p) => { map[p.id] = p; });
        if (!cancelled) setProfiles(map);
      }
      setLoading(false);
    };

    load();

    const channel = supabase
      .channel(`auction-inbox-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "auction_messages" }, () => load())
      .subscribe();

    return () => { cancelled = true; supabase.removeChannel(channel); };
  }, [user]);

  const threads = useMemo<Thread[]>(() => {
    if (!user) return [];
    const map = new Map<string, Thread>();
    messages.forEach((m) => {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      const key = `${m.auction_id}:${otherId}`;
      const item = items[m.auction_id] ?? null;
      const existing = map.get(key);
      const unread = m.receiver_id === user.id && !m.is_read ? 1 : 0;
      if (!existing) {
        map.set(key, {
          auctionId: m.auction_id,
          otherId,
          item,
          other: profiles[otherId] ?? null,
          lastMessage: m,
          unreadCount: unread,
          isSelling: item ? item.user_id === user.id : false,
        });
      } else {
        existing.unreadCount += unread;
        if (new Date(m.created_at) > new Date(existing.lastMessage.created_at)) existing.lastMessage = m;
      }
    });
    return [...map.values()].sort(
      (a, b) => +new Date(b.lastMessage.created_at) - +new Date(a.lastMessage.created_at),
    );
  }, [messages, items, profiles, user]);

  const visible = tab === "all" ? threads : tab === "selling" ? threads.filter((t) => t.isSelling) : threads.filter((t) => !t.isSelling);

  const unreadFor = (list: Thread[]) => list.reduce((s, t) => s + t.unreadCount, 0);

  if (!user) {
    return (
      <main className="container max-w-2xl py-20 text-center">
        <p className="text-muted-foreground">Please sign in to see your auction messages.</p>
        <Button className="mt-4" onClick={() => navigate("/auth")}>Sign in</Button>
      </main>
    );
  }

  return (
    <>
      <SEO title="Auction messages — buyers and sellers" description="All your auction conversations in one inbox, split into bidding and selling threads." canonical="/auction/messages" />
      <main className="container mx-auto max-w-3xl px-4 pb-16 pt-20">
        <Button variant="ghost" size="sm" className="mb-4 gap-2" onClick={() => navigate("/auction")}>
          <ArrowLeft className="h-4 w-4" /> Back to Auctions
        </Button>

        <h1 className="mb-1 text-3xl font-black tracking-tight">Auction messages</h1>
        <p className="mb-6 text-sm text-muted-foreground">Conversations about items you bid on and items you sell.</p>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all" className="gap-2">
              All {unreadFor(threads) > 0 && <Badge variant="destructive">{unreadFor(threads)}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="bidding" className="gap-2">
              <Gavel className="h-4 w-4" /> Bidding
            </TabsTrigger>
            <TabsTrigger value="selling" className="gap-2">
              <Store className="h-4 w-4" /> Selling
            </TabsTrigger>
          </TabsList>

          <TabsContent value={tab} className="mt-0 space-y-3">
            {loading ? (
              [0, 1, 2].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)
            ) : visible.length === 0 ? (
              <Card><CardContent className="py-16 text-center text-muted-foreground">No messages yet.</CardContent></Card>
            ) : (
              visible.map((t) => (
                <Card
                  key={`${t.auctionId}:${t.otherId}`}
                  className="cursor-pointer transition-colors hover:border-primary/40"
                  onClick={() => setActiveThread(t)}
                >
                  <CardContent className="flex items-center gap-3 p-4">
                    <Avatar className="h-11 w-11">
                      <AvatarImage src={t.other?.avatar_url ?? undefined} />
                      <AvatarFallback>{(t.other?.full_name || t.other?.username || "U").charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-semibold" translate="no">{t.other?.full_name || t.other?.username || "User"}</p>
                        {t.unreadCount > 0 && <Badge variant="destructive">{t.unreadCount}</Badge>}
                        <Badge variant="outline" className="ml-auto shrink-0 text-[10px] uppercase">
                          {t.isSelling ? "Selling" : "Bidding"}
                        </Badge>
                      </div>
                      <p className="truncate text-xs text-muted-foreground">{t.item?.title ?? "Auction"}</p>
                      <p className="truncate text-sm text-muted-foreground">{maskContactInfo(t.lastMessage.message)}</p>
                    </div>
                    {t.item?.image_url && (
                      <img src={t.item.image_url} alt={t.item.title} loading="lazy" className="h-12 w-12 rounded-lg object-cover" />
                    )}
                    <MessageCircle className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>

      {activeThread && (
        <AuctionChatDialog
          open={!!activeThread}
          onOpenChange={(o) => !o && setActiveThread(null)}
          auctionId={activeThread.auctionId}
          auctionTitle={activeThread.item?.title ?? "Auction"}
          otherId={activeThread.otherId}
          otherName={activeThread.other?.full_name || activeThread.other?.username || undefined}
        />
      )}
    </>
  );
}
