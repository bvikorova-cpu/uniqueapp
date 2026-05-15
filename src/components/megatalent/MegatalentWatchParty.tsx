import { useEffect, useRef, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Radio, Send, Users, Tv } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Stream {
  id: string;
  host_user_id: string;
  category: string;
  title: string;
  description: string | null;
  status: string;
  started_at: string | null;
  viewer_count: number;
}

interface PartyMessage {
  id: string;
  stream_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface Props {
  category: string;
}

export const MegatalentWatchParty = ({ category }: Props) => {
  const { toast } = useToast();
  const [streams, setStreams] = useState<Stream[]>([]);
  const [activeStream, setActiveStream] = useState<Stream | null>(null);
  const [messages, setMessages] = useState<PartyMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [title, setTitle] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const loadStreams = async () => {
    const { data } = await (supabase as any)
      .from("megatalent_live_streams")
      .select("*")
      .eq("category", category)
      .in("status", ["scheduled", "live"])
      .order("started_at", { ascending: false, nullsFirst: false })
      .limit(10);
    setStreams((data ?? []) as Stream[]);
    setLoading(false);
  };

  useEffect(() => {
    loadStreams();
    const ch = supabase
      .channel(`mt-streams-${category}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "megatalent_live_streams", filter: `category=eq.${category}` },
        () => loadStreams(),
      )
      .subscribe();
    return () => {
      supabase.removeChannel(ch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  useEffect(() => {
    if (!activeStream) return;
    let cancelled = false;
    (async () => {
      const { data } = await (supabase as any)
        .from("megatalent_watch_party_messages")
        .select("*")
        .eq("stream_id", activeStream.id)
        .order("created_at", { ascending: true })
        .limit(200);
      if (!cancelled) setMessages((data ?? []) as PartyMessage[]);
    })();
    const ch = supabase
      .channel(`mt-party-${activeStream.id}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "megatalent_watch_party_messages", filter: `stream_id=eq.${activeStream.id}` },
        (payload) => setMessages((prev) => [...prev, payload.new as PartyMessage]),
      )
      .subscribe();
    return () => {
      cancelled = true;
      supabase.removeChannel(ch);
    };
  }, [activeStream]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!input.trim() || !activeStream) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      toast({ title: "Prihlás sa pre chat", variant: "destructive" });
      return;
    }
    const text = input.trim();
    setInput("");
    const { error } = await (supabase as any).from("megatalent_watch_party_messages").insert({
      stream_id: activeStream.id,
      user_id: u.user.id,
      content: text,
    });
    if (error) toast({ title: "Chyba", description: error.message, variant: "destructive" });
  };

  const createStream = async () => {
    if (!title.trim()) return;
    const { data: u } = await supabase.auth.getUser();
    if (!u.user) {
      toast({ title: "Prihlás sa pre vytvorenie streamu", variant: "destructive" });
      return;
    }
    const { data, error } = await (supabase as any)
      .from("megatalent_live_streams")
      .insert({
        host_user_id: u.user.id,
        category,
        title: title.trim(),
        status: "live",
        started_at: new Date().toISOString(),
      })
      .select()
      .single();
    if (error) {
      toast({ title: "Chyba", description: error.message, variant: "destructive" });
      return;
    }
    setTitle("");
    setCreating(false);
    setActiveStream(data as Stream);
    toast({ title: "🎥 Stream je live!" });
  };

  const endStream = async () => {
    if (!activeStream) return;
    await (supabase as any)
      .from("megatalent_live_streams")
      .update({ status: "ended", ended_at: new Date().toISOString() })
      .eq("id", activeStream.id);
    setActiveStream(null);
    toast({ title: "Stream ukončený" });
  };

  if (loading) return null;

  return (
    <Card className="bg-gradient-to-br from-rose-500/10 via-primary/5 to-purple-500/10 border-rose-500/30">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-base">
          <span className="flex items-center gap-2">
            <Tv className="h-5 w-5 text-rose-500" />
            Live & Watch Party
          </span>
          {!activeStream && !creating && (
            <Button size="sm" variant="outline" onClick={() => setCreating(true)}>
              <Radio className="h-3.5 w-3.5 mr-1" /> Go Live
            </Button>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {creating && !activeStream && (
          <div className="space-y-2 p-3 rounded-lg bg-card/50 border border-border/50">
            <Input
              placeholder="Názov streamu…"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
            />
            <div className="flex gap-2">
              <Button size="sm" onClick={createStream} className="flex-1">
                <Radio className="h-3.5 w-3.5 mr-1" /> Spustiť
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setCreating(false)}>
                Zrušiť
              </Button>
            </div>
          </div>
        )}

        {activeStream ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 min-w-0">
                <Badge className="bg-red-600 text-white shrink-0">
                  <Radio className="h-3 w-3 mr-1 animate-pulse" /> LIVE
                </Badge>
                <span className="font-semibold text-sm truncate">{activeStream.title}</span>
              </div>
              <Button size="sm" variant="ghost" onClick={() => setActiveStream(null)}>
                ← Späť
              </Button>
            </div>
            <div className="aspect-video bg-black rounded-lg flex items-center justify-center">
              <div className="text-center text-white/70 px-4">
                <Tv className="h-10 w-10 mx-auto mb-2 opacity-50" />
                <p className="text-xs">Watch party prebieha</p>
              </div>
            </div>
            <div className="border border-border/50 rounded-lg bg-card/40">
              <div className="h-48 overflow-y-auto p-2 space-y-1">
                {messages.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-6">
                    Buď prvý kto napíše do chatu 💬
                  </p>
                ) : (
                  messages.map((m) => (
                    <div key={m.id} className="text-xs p-1.5 rounded bg-muted/30">
                      <span className="text-muted-foreground mr-2">
                        {m.user_id.slice(0, 6)}
                      </span>
                      {m.content}
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
              <div className="flex gap-1 p-2 border-t border-border/50">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Napíš správu…"
                  className="h-8 text-xs"
                  maxLength={500}
                />
                <Button size="sm" onClick={send} className="h-8 px-2">
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <Button size="sm" variant="destructive" className="w-full" onClick={endStream}>
              Ukončiť stream
            </Button>
          </div>
        ) : streams.length === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">
            Žiadne aktívne streamy. Buď prvý!
          </p>
        ) : (
          <div className="space-y-2">
            {streams.map((s) => (
              <button
                key={s.id}
                onClick={() => setActiveStream(s)}
                className="w-full text-left p-3 rounded-lg bg-card/50 hover:bg-card border border-border/50 hover:border-rose-500/50 transition-all"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 min-w-0">
                    {s.status === "live" && (
                      <Badge className="bg-red-600 text-white text-[10px] shrink-0">
                        <Radio className="h-2.5 w-2.5 mr-1 animate-pulse" /> LIVE
                      </Badge>
                    )}
                    <span className="font-medium text-sm truncate">{s.title}</span>
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0 ml-2">
                    <Users className="h-3 w-3" /> {s.viewer_count}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MegatalentWatchParty;
