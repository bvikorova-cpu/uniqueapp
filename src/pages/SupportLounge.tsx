import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import {
  Heart, HeartCrack, Users, MessageCircleHeart, Send, Loader2,
  ShieldCheck, Sparkles, DoorOpen, HandHeart, Sunrise, LifeBuoy, Coins,
} from "lucide-react";
import heroVideo from "@/assets/broken-hearts-hero-rozbit-srdce-10s-exact.mp4.asset.json";

const ROOMS = [
  { id: "cheated-on", label: "Cheated On", emoji: "💔", desc: "Betrayal, broken trust, healing after infidelity" },
  { id: "broken-heart", label: "Broken Heart", emoji: "🥀", desc: "Breakups, disappointment, lost love" },
  { id: "left-behind", label: "Left Behind", emoji: "🚪", desc: "Abandonment, ghosting, sudden goodbyes" },
  { id: "lonely", label: "Feeling Lonely", emoji: "🌧️", desc: "Loneliness, isolation, needing someone to talk to" },
  { id: "new-beginnings", label: "New Beginnings", emoji: "🌅", desc: "Recovery, self-worth, hope and fresh starts" },
] as const;

type RoomId = (typeof ROOMS)[number]["id"];

interface LoungeMessage {
  id: string;
  room: string;
  user_id: string;
  nickname: string;
  content: string;
  created_at: string;
}

interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

const ENTRY_CREDITS = 1;
const AI_MESSAGE_CREDITS = 3;
const SECTION_NAME = "Broken Hearts — You Are Not Alone";

function HeartbreakHero() {
  return (
    <section className="relative min-h-[180px] sm:min-h-[260px] lg:min-h-[420px] overflow-hidden rounded-b-2xl mb-4 sm:mb-8 border-b bg-muted">
      <video
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-label="A symbolic broken heart releasing light and turning into flowers"
        className="absolute inset-0 h-full w-full object-cover brightness-125 contrast-110 saturate-110 scale-105"
      >
        <source src={heroVideo.url} type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/25 to-background/10" />
      <div className="relative flex min-h-[180px] sm:min-h-[260px] lg:min-h-[420px] items-end px-4 pb-4 sm:px-8 sm:pb-8 lg:px-10 lg:pb-12">
        <div className="max-w-2xl">
          <div className="mb-2 sm:mb-3 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-background/85 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[10px] sm:text-xs font-semibold text-foreground backdrop-blur-md shadow-sm">
            <HeartCrack className="h-3 w-3 sm:h-4 sm:w-4 text-primary" /> Anonymous support for difficult relationship moments
          </div>
          <h1 className="text-xl sm:text-3xl lg:text-5xl font-black leading-tight text-foreground drop-shadow-[0_2px_12px_rgba(255,255,255,0.55)]">
            {SECTION_NAME}
          </h1>
          <p className="mt-2 sm:mt-3 max-w-xl text-xs sm:text-sm lg:text-base font-semibold text-foreground/95 drop-shadow-[0_1px_10px_rgba(255,255,255,0.55)]">
            A private place for betrayal, breakups, loneliness and finding your way forward.
          </p>
        </div>
      </div>
    </section>
  );
}

const SupportLounge = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [checking, setChecking] = useState(true);
  const [hasPass, setHasPass] = useState(false);
  const [nickname, setNickname] = useState<string | null>(null);
  const [nickInput, setNickInput] = useState("");
  const [entering, setEntering] = useState(false);

  const callLounge = useCallback(async (payload: Record<string, unknown>) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) throw new Error("not_signed_in");
    const res = await supabase.functions.invoke("support-lounge", { body: payload });
    if (res.error) {
      const ctx = (res.error as any)?.context;
      let body: any = null;
      try { body = ctx ? await ctx.json() : null; } catch { /* ignore */ }
      const err: any = new Error(body?.error || res.error.message || "Request failed");
      err.status = ctx?.status;
      err.body = body;
      throw err;
    }
    return res.data;
  }, []);

  // Check today's pass + nickname on load
  useEffect(() => {
    (async () => {
      if (!user) { setChecking(false); return; }
      const today = new Date().toISOString().slice(0, 10);
      const [{ data: pass }, { data: nick }] = await Promise.all([
        (supabase as any).from("support_lounge_passes").select("id").eq("user_id", user.id).eq("pass_date", today).maybeSingle(),
        (supabase as any).from("support_lounge_nicknames").select("nickname").eq("user_id", user.id).maybeSingle(),
      ]);
      setHasPass(!!pass);
      setNickname(nick?.nickname ?? null);
      setChecking(false);
    })();
  }, [user]);

  const handleEnter = async () => {
    const nick = nickInput.trim();
    if (nick.length < 2) {
      toast.error("Choose a nickname first (2–24 characters).");
      return;
    }
    setEntering(true);
    try {
      await callLounge({ action: "set_nickname", nickname: nick });
      const res = await callLounge({ action: "enter" });
      setNickname(res.nickname ?? nick);
      setHasPass(true);
      if (res.charged) toast.success(`Welcome in. ${ENTRY_CREDITS} credit used — entry valid all day. 💛`);
      else toast.success("Welcome back 💛");
    } catch (e: any) {
      if (e?.status === 402 || e?.body?.error === "insufficient_credits") {
        toast.error(`You need ${ENTRY_CREDITS} credit to enter. Top up your credits first.`);
        navigate("/ai-credits-store");
      } else if (e?.message === "not_signed_in") {
        navigate("/auth");
      } else {
        toast.error(e?.message || "Something went wrong. Please try again.");
      }
    } finally {
      setEntering(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 pt-4 sm:pt-8 lg:pt-16 pb-6 max-w-5xl">
        <HeartbreakHero />
        <div className="mx-auto max-w-lg text-center">
          <p className="text-muted-foreground mb-6">Sign in to join the anonymous support chat.</p>
          <Button onClick={() => navigate("/auth")}>Sign in</Button>
        </div>
      </div>
    );
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!hasPass) {
    return (
      <div className="container mx-auto px-4 pt-4 sm:pt-8 lg:pt-16 pb-6 max-w-5xl">
        <HeartbreakHero />

        <div className="mx-auto max-w-2xl rounded-2xl border bg-card p-4 sm:p-6 mb-4">
          <h2 className="font-bold mb-2 sm:mb-3 flex items-center gap-2 text-sm sm:text-base"><ShieldCheck className="h-5 w-5 text-primary" /> How it works</h2>
          <ul className="text-xs sm:text-sm text-muted-foreground space-y-1 sm:space-y-1.5 mb-4">
            <li>• You chat under a <strong>nickname</strong> — your real profile stays hidden.</li>
            <li>• Choose a themed room and talk with people going through the same thing.</li>
            <li>• Or talk privately with the <strong>AI Companion</strong> — nothing is saved.</li>
            <li>• Entry costs <strong>{ENTRY_CREDITS} credit per day</strong> and unlimited peer chat is included.</li>
            <li>• Each AI Companion reply costs <strong>{AI_MESSAGE_CREDITS} credits</strong>.</li>
            <li>• Be kind. No hate, no harassment, no sharing private data.</li>
          </ul>
          <div className="rounded-xl bg-amber-500/10 border border-amber-500/30 p-2.5 text-xs text-amber-700 dark:text-amber-400 mb-4 flex gap-2">
            <LifeBuoy className="h-4 w-4 shrink-0 mt-0.5" />
            <span>This is peer support, not professional help. If you are in crisis or thinking about self-harm, please contact local emergency services or a crisis hotline immediately.</span>
          </div>
          <label className="text-sm font-medium block mb-2">Your anonymous nickname</label>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
            <Input
              value={nickInput}
              onChange={(e) => setNickInput(e.target.value)}
              placeholder="e.g. BraveFox, QuietStorm…"
              maxLength={24}
              onKeyDown={(e) => e.key === "Enter" && handleEnter()}
              className="h-12 w-full min-w-0 text-base sm:flex-1"
            />
            <Button onClick={handleEnter} disabled={entering} className="h-12 w-full shrink-0 sm:w-auto">
              {entering ? <Loader2 className="h-4 w-4 animate-spin" /> : <DoorOpen className="h-4 w-4 mr-1" />}
              Enter · {ENTRY_CREDITS} credit/day
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 h-[100dvh] flex flex-col pt-3 pb-3 max-w-5xl">
      <div className="mb-2 shrink-0">
        <h1 className="text-lg sm:text-2xl font-black flex items-center gap-2">
          <MessageCircleHeart className="h-5 w-5 sm:h-7 sm:w-7 text-primary" /> {SECTION_NAME}
        </h1>
        <p className="text-xs text-muted-foreground">
          You are here as <strong>{nickname}</strong> · entry valid today ✓
        </p>
      </div>

      <Tabs value={tab} onValueChange={setTab} className="flex flex-col flex-1 min-h-0">
        <TabsList className="grid grid-cols-3 w-full max-w-lg mb-2 shrink-0">
          <TabsTrigger value="rooms" className="flex items-center gap-1.5 text-[11px] sm:text-sm">
            <Users className="h-4 w-4" /> Rooms
          </TabsTrigger>
          <TabsTrigger value="private" className="flex items-center gap-1.5 text-[11px] sm:text-sm">
            <Lock className="h-4 w-4" /> Private
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1.5 text-[11px] sm:text-sm">
            <Sparkles className="h-4 w-4" /> AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
          <RoomsChat
            nickname={nickname!}
            userId={user.id}
            onPrivateMessage={(m) => {
              setDmTarget({ userId: m.user_id, nickname: m.nickname });
              setTab("private");
            }}
          />
        </TabsContent>
        <TabsContent value="private" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
          <PrivateChats
            userId={user.id}
            callLounge={callLounge}
            target={dmTarget}
            setTarget={setDmTarget}
          />
        </TabsContent>
        <TabsContent value="ai" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
          <AiCompanion callLounge={callLounge} />
        </TabsContent>
      </Tabs>

      <div className="mt-2 shrink-0 rounded-xl bg-muted/60 border p-2 text-[11px] sm:text-xs text-muted-foreground flex gap-2">
        <LifeBuoy className="h-4 w-4 shrink-0 mt-0.5" />
        <span>{SECTION_NAME} offers peer support, not professional therapy. If you are in crisis, please contact local emergency services or a crisis hotline.</span>
      </div>
    </div>
  );
};

function RoomsChat({ nickname, userId }: { nickname: string; userId: string }) {
  const [room, setRoom] = useState<RoomId>("broken-heart");
  const [messages, setMessages] = useState<LoungeMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    let cancelled = false;
    (supabase as any)
      .from("support_lounge_messages")
      .select("*")
      .eq("room", room)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (!cancelled && data) setMessages([...data].reverse() as LoungeMessage[]);
      });

    const channel = supabase
      .channel(`lounge-${room}`)
      .on("postgres_changes",
        { event: "INSERT", schema: "public", table: "support_lounge_messages", filter: `room=eq.${room}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as LoungeMessage]);
        })
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [room]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    const { error } = await (supabase as any).from("support_lounge_messages").insert({
      room, user_id: userId, nickname, content: content.slice(0, 500),
    });
    if (error) toast.error("Message could not be sent.");
    setText("");
    setSending(false);
  };

  const active = ROOMS.find((r) => r.id === room)!;

  return (
    <div className="grid sm:grid-cols-[220px_1fr] gap-2 h-full min-h-0">
      <div className="flex sm:flex-col gap-2 overflow-x-auto pb-1 shrink-0">
        {ROOMS.map((r) => (
          <button
            key={r.id}
            onClick={() => setRoom(r.id)}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors shrink-0 sm:shrink ${
              room === r.id ? "bg-primary text-primary-foreground border-primary" : "bg-card hover:bg-muted"
            }`}
          >
            <span className="text-lg">{r.emoji}</span>
            <span className="font-medium">{r.label}</span>
          </button>
        ))}
      </div>

      <div className="rounded-2xl border bg-card flex flex-col h-full min-h-0">
        <div className="px-4 py-2 border-b shrink-0">
          <p className="font-bold text-sm">{active.emoji} {active.label}</p>
          <p className="text-xs text-muted-foreground">{active.desc}</p>
        </div>
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
          {messages.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">
              No messages yet. Be the first to say hi — someone out there needs it. 💛
            </p>
          )}
          {messages.map((m) => {
            const own = m.user_id === userId;
            return (
              <div key={m.id} className={`flex flex-col ${own ? "items-end" : "items-start"}`}>
                <span className="text-[11px] text-muted-foreground mb-0.5">
                  {own ? "You" : m.nickname} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>
                <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                  own ? "bg-primary text-primary-foreground" : "bg-muted"
                }`}>
                  {m.content}
                </div>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>
        <div className="p-3 border-t flex gap-2 shrink-0">
          <Input
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder={`Message as ${nickname}…`}
            maxLength={500}
            onKeyDown={(e) => e.key === "Enter" && send()}
          />
          <Button size="icon" onClick={send} disabled={sending || !text.trim()} aria-label="Send">
            {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
}

function AiCompanion({ callLounge }: { callLounge: (p: Record<string, unknown>) => Promise<any> }) {
  const [messages, setMessages] = useState<AiMessage[]>([]);
  const [text, setText] = useState("");
  const [thinking, setThinking] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, thinking]);

  const send = async () => {
    const content = text.trim();
    if (!content || thinking) return;
    const next = [...messages, { role: "user" as const, content }];
    setMessages(next);
    setText("");
    setThinking(true);
    try {
      const res = await callLounge({ action: "ai", messages: next });
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (e: any) {
      if (e?.body?.error === "no_pass") toast.error("Your daily pass expired. Please re-enter tomorrow.");
      else if (e?.status === 402 || e?.body?.error === "insufficient_credits") {
        toast.error(`You need ${AI_MESSAGE_CREDITS} credits for an AI reply. Top up to continue.`);
      }
      else toast.error("The companion could not respond. Please try again.");
    } finally {
      setThinking(false);
    }
  };

  return (
    <div className="rounded-2xl border bg-card flex flex-col h-full w-full max-w-2xl mx-auto">
      <div className="px-4 py-2 border-b flex items-center justify-between shrink-0">
        <div>
          <p className="font-bold text-sm flex items-center gap-1.5"><HandHeart className="h-4 w-4 text-primary" /> AI Companion</p>
          <p className="text-xs text-muted-foreground">Private · nothing is saved · {AI_MESSAGE_CREDITS} credits per reply</p>
        </div>
        {messages.length > 0 && (
          <Button variant="ghost" size="sm" onClick={() => setMessages([])}>
            <Sunrise className="h-4 w-4 mr-1" /> New
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {messages.length === 0 && (
          <div className="text-center py-8">
            <Heart className="h-8 w-8 mx-auto mb-3 text-primary" />
            <p className="text-sm text-muted-foreground mb-3">I'm here to listen. Whatever you're carrying, you can say it here.</p>
            <div className="flex flex-wrap justify-center gap-2">
              {["I was cheated on…", "I feel so alone tonight", "How do I move on?"].map((s) => (
                <button
                  key={s}
                  onClick={() => setText(s)}
                  className="text-xs rounded-full border px-3 py-1.5 hover:bg-muted transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${
              m.role === "user" ? "bg-primary text-primary-foreground" : ""
            }`}>
              {m.content}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Listening…
          </div>
        )}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t flex gap-2 items-end shrink-0">
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Say what's on your heart…"
          rows={1}
          className="min-h-[40px] max-h-28 resize-none"
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
          }}
        />
        <Button size="icon" onClick={send} disabled={thinking || !text.trim()} aria-label={`Send for ${AI_MESSAGE_CREDITS} credits`} title={`${AI_MESSAGE_CREDITS} credits per AI reply`}>
          {thinking ? <Loader2 className="h-4 w-4 animate-spin" /> : <Coins className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export default SupportLounge;
