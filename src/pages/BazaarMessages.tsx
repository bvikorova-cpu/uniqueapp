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
import { BazaarChatDialog } from "@/components/bazaar/BazaarChatDialog";
import { maskContactInfo } from "@/lib/contactMask";
import { ArrowLeft, MessageCircle, ShoppingBag, Store } from "lucide-react";

interface Msg {
  id: string;
  item_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean | null;
  created_at: string;
  attachment_path?: string | null;
  attachment_type?: string | null;
}

interface Item {
  id: string;
  title: string;
  image_url: string | null;
  price: number;
  user_id: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface Thread {
  itemId: string;
  otherId: string;
  item: Item | null;
  other: Profile | null;
  lastMessage: Msg;
  unreadCount: number;
  isSelling: boolean;
}

export default function BazaarMessages() {
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
      const { data, error } = await supabase
        .from("bazaar_messages")
        .select("id, item_id, sender_id, receiver_id, message, is_read, created_at, attachment_path, attachment_type")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(500);

      if (cancelled) return;
      if (error) {
        setLoading(false);
        return;
      }

      const rows = (data || []) as Msg[];
      setMessages(rows);

      const itemIds = [...new Set(rows.map((m) => m.item_id))];
      const userIds = [...new Set(rows.flatMap((m) => [m.sender_id, m.receiver_id]))].filter((id) => id !== user.id);

      if (itemIds.length) {
        const { data: itemRows } = await supabase
          .from("bazaar_items")
          .select("id, title, image_url, price, user_id")
          .in("id", itemIds);
        const itemMap: Record<string, Item> = {};
        (itemRows || []).forEach((i: any) => { itemMap[i.id] = i; });
        setItems(itemMap);
      }

      if (userIds.length) {
        const { data: profRows } = await supabase
          .from("public_profiles")
          .select("id, full_name, username, avatar_url")
          .in("id", userIds);
        const profMap: Record<string, Profile> = {};
        (profRows || []).forEach((p: any) => { profMap[p.id] = p; });
        setProfiles(profMap);
      }

      setLoading(false);
    };

    load();

    const channel = supabase
      .channel("bazaar-messages-inbox")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "bazaar_messages" },
        (payload) => {
          const m = payload.new as Msg;
          if (m.sender_id !== user.id && m.receiver_id !== user.id) return;
          setMessages((prev) => {
            if (prev.some((x) => x.id === m.id)) return prev;
            return [m, ...prev];
          });
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "bazaar_messages" },
        (payload) => {
          const m = payload.new as Msg;
          setMessages((prev) => prev.map((x) => (x.id === m.id ? m : x)));
        },
      )
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user]);

  const threads = useMemo<Thread[]>(() => {
    if (!user) return [];
    const map = new Map<string, Thread>();

    // Process in reverse chronological order so the first message we see for each thread is the latest
    [...messages].reverse().forEach((m) => {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      const key = `${m.item_id}__${otherId}`;
      const item = items[m.item_id] || null;
      const isSelling = item?.user_id === user.id;
      const existing = map.get(key);
      const unread = m.receiver_id === user.id && !m.is_read ? 1 : 0;

      if (existing) {
        existing.unreadCount += unread;
      } else {
        map.set(key, {
          itemId: m.item_id,
          otherId,
          item,
          other: profiles[otherId] || null,
          lastMessage: m,
          unreadCount: unread,
          isSelling,
        });
      }
    });

    return Array.from(map.values()).sort((a, b) => +new Date(b.lastMessage.created_at) - +new Date(a.lastMessage.created_at));
  }, [messages, items, profiles, user]);

  const filteredThreads = useMemo(() => {
    if (tab === "buying") return threads.filter((t) => !t.isSelling);
    if (tab === "selling") return threads.filter((t) => t.isSelling);
    return threads;
  }, [threads, tab]);

  const markRead = async (thread: Thread) => {
    if (!user || thread.unreadCount === 0) return;
    await supabase
      .from("bazaar_messages")
      .update({ is_read: true })
      .eq("item_id", thread.itemId)
      .eq("sender_id", thread.otherId)
      .eq("receiver_id", user.id)
      .eq("is_read", false);
  };

  const openThread = (thread: Thread) => {
    markRead(thread);
    setActiveThread(thread);
  };

  const displayName = (p?: Profile | null) => p?.full_name || p?.username || "Unique member";

  return (
    <>
      <SEO
        title="Bazaar Messages"
        description="Your Bazaar conversations. Reply to buyers and sellers directly."
        canonical="/bazaar/messages"
      />

      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => navigate("/bazaar")} aria-label="Back to Bazaar">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              <MessageCircle className="h-6 w-6 text-primary" /> Bazaar messages
            </h1>
            <p className="text-sm text-muted-foreground">All your buyer and seller conversations in one place.</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3 sm:w-auto">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="buying" className="gap-1"><ShoppingBag className="h-4 w-4" /> Buying</TabsTrigger>
            <TabsTrigger value="selling" className="gap-1"><Store className="h-4 w-4" /> Selling</TabsTrigger>
          </TabsList>

          <TabsContent value={tab}>
            {loading ? (
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 w-full rounded-xl" />
                ))}
              </div>
            ) : filteredThreads.length === 0 ? (
              <Card className="rounded-xl border-dashed">
                <CardContent className="p-10 text-center">
                  <MessageCircle className="mx-auto mb-3 h-10 w-10 text-muted-foreground/60" />
                  <p className="text-muted-foreground">
                    No messages here yet. Browse the{" "}
                    <button onClick={() => navigate("/bazaar")} className="font-medium text-primary underline">
                      Bazaar
                    </button>{" "}
                    and unlock a chat to start negotiating.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {filteredThreads.map((t) => {
                  const other = t.other;
                  const item = t.item;
                  const lastText = t.lastMessage.attachment_path
                    ? t.lastMessage.attachment_type?.startsWith("video/")
                      ? "🎬 Video"
                      : "📷 Photo"
                    : maskContactInfo(t.lastMessage.message);

                  return (
                    <button
                      key={`${t.itemId}-${t.otherId}`}
                      onClick={() => openThread(t)}
                      className="block w-full text-left"
                    >
                      <Card className="rounded-xl transition-all hover:border-primary/50 hover:shadow-[0_14px_30px_-16px_hsl(var(--primary)/0.35)]">
                        <CardContent className="flex items-center gap-4 p-4">
                          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                            {item?.image_url ? (
                              <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center">
                                <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-5 w-5">
                                <AvatarImage src={other?.avatar_url || undefined} alt={displayName(other)} />
                                <AvatarFallback className="text-[10px]">
                                  {displayName(other).slice(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span className="truncate text-sm font-medium" translate="no">{displayName(other)}</span>
                              {t.isSelling && (
                                <Badge variant="secondary" className="text-[10px]">Selling</Badge>
                              )}
                            </div>
                            <p className="mt-0.5 truncate text-sm font-semibold">{maskContactInfo(item?.title || "Listing")}</p>
                            <p className={`truncate text-sm ${t.unreadCount > 0 ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                              {lastText}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {new Date(t.lastMessage.created_at).toLocaleString()}
                            </p>
                          </div>

                          {t.unreadCount > 0 && (
                            <Badge className="h-6 min-w-[1.5rem] justify-center rounded-full px-2">
                              {t.unreadCount}
                            </Badge>
                          )}
                        </CardContent>
                      </Card>
                    </button>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {activeThread && (
        <BazaarChatDialog
          open={!!activeThread}
          onOpenChange={(o) => !o && setActiveThread(null)}
          itemId={activeThread.itemId}
          itemTitle={activeThread.item?.title || "Listing"}
          otherId={activeThread.otherId}
          otherName={displayName(activeThread.other)}
        />
      )}
    </>
  );
}
