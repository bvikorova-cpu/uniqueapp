import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  Heart, HeartCrack, Users, MessageCircleHeart, Send, Loader2,
  ShieldCheck, Sparkles, DoorOpen, HandHeart, Sunrise, LifeBuoy, Coins,
  Lock, ArrowLeft, MailPlus, UserPlus, Check, X,
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
  memberId: string;
  nickname: string;
  content: string;
  created_at: string;
  mine: boolean;
}

interface AiMessage {
  role: "user" | "assistant";
  content: string;
}

const ENTRY_CREDITS = 1;
const AI_MESSAGE_CREDITS = 3;
const DM_CREDITS = 1;
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
  const [searchParams] = useSearchParams();
  const initialTab = ["rooms", "private", "known", "ai"].includes(searchParams.get("tab") || "")
    ? (searchParams.get("tab") as string)
    : "rooms";
  const [tab, setTab] = useState(initialTab);
  const [dmTarget, setDmTarget] = useState<{ memberId: string; nickname: string } | null>(null);

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
      try {
        const status = await callLounge({ action: "status" });
        setHasPass(Boolean(status.hasPass));
        setNickname(status.nickname ?? null);
      } catch {
        setHasPass(false);
      } finally {
        setChecking(false);
      }
    })();
  }, [user, callLounge]);

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
            <li>• You can write someone a <strong>private message</strong> for <strong>{DM_CREDITS} credit</strong> per message.</li>
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
        <TabsList className="grid grid-cols-4 w-full max-w-2xl mb-2 shrink-0">
          <TabsTrigger value="rooms" className="flex items-center gap-1.5 text-[11px] sm:text-sm">
            <Users className="h-4 w-4" /> Rooms
          </TabsTrigger>
          <TabsTrigger value="private" className="flex items-center gap-1.5 text-[11px] sm:text-sm">
            <Lock className="h-4 w-4" /> Private
          </TabsTrigger>
          <TabsTrigger value="known" className="flex items-center gap-1.5 text-[11px] sm:text-sm">
            <UserPlus className="h-4 w-4" /> <span className="hidden min-[390px]:inline">Known</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-1.5 text-[11px] sm:text-sm">
            <Sparkles className="h-4 w-4" /> AI
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rooms" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
          <RoomsChat
            nickname={nickname ?? "Anonymous"}
            callLounge={callLounge}
            onPrivateMessage={(m) => {
              setDmTarget({ memberId: m.memberId, nickname: m.nickname });
              setTab("private");
            }}
          />
        </TabsContent>
        <TabsContent value="private" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
          <PrivateChats
            callLounge={callLounge}
            target={dmTarget}
            setTarget={setDmTarget}
          />
        </TabsContent>
        <TabsContent value="known" className="flex-1 min-h-0 mt-0 data-[state=inactive]:hidden">
          <KnownPeople callLounge={callLounge} onMessage={(person) => { setDmTarget(person); setTab("private"); }} />
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

function RoomsChat({ nickname, callLounge, onPrivateMessage }: {
  nickname: string;
  callLounge: (p: Record<string, unknown>) => Promise<any>;
  onPrivateMessage: (m: LoungeMessage) => void;
}) {
  const [room, setRoom] = useState<RoomId>("broken-heart");
  const [messages, setMessages] = useState<LoungeMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([]);
    let cancelled = false;
    const load = async () => {
      try {
        const data = await callLounge({ action: "room_history", room });
        if (!cancelled) setMessages(data.messages ?? []);
      } catch {
        if (!cancelled) toast.error("Messages could not be loaded.");
      }
    };
    load();
    const timer = window.setInterval(load, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [room, callLounge]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const content = text.trim();
    if (!content || sending) return;
    setSending(true);
    try {
      const result = await callLounge({ action: "send_room", room, content: content.slice(0, 500) });
      if (result.message) setMessages((prev) => [...prev.filter((m) => m.id !== result.message.id), result.message]);
      setText("");
    } catch {
      toast.error("Message could not be sent.");
    } finally {
      setSending(false);
    }
  };

  const active = ROOMS.find((r) => r.id === room) ?? ROOMS[0];

  const addKnown = async (message: LoungeMessage) => {
    try {
      await callLounge({ action: "contact_request", memberId: message.memberId });
      toast.success(`Request sent to ${message.nickname}`);
    } catch (error: any) {
      toast.error(error?.body?.error === "request_exists" ? "A request or connection already exists." : "Request could not be sent.");
    }
  };

  return (
    <div className="grid sm:grid-cols-[220px_1fr] gap-2 h-full min-h-0">
      <div className="grid grid-cols-2 sm:flex sm:flex-col gap-1.5 sm:gap-2 pb-1 shrink-0">
        {ROOMS.map((r) => (
          <Button
            key={r.id}
            variant={room === r.id ? "default" : "outline"}
            onClick={() => setRoom(r.id)}
            className={`h-8 sm:h-auto min-w-0 justify-start gap-1.5 px-2 sm:px-3 sm:py-2 text-left text-[11px] sm:text-sm ${r.id === "new-beginnings" ? "col-span-2" : ""}`}
          >
            <span className="text-sm sm:text-lg">{r.emoji}</span>
            <span className="font-medium truncate">{r.label}</span>
          </Button>
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
            const own = m.mine;
            return (
              <div key={m.id} className={`flex flex-col ${own ? "items-end" : "items-start"}`}>
                <span className="text-[11px] text-muted-foreground mb-0.5 flex items-center gap-1.5">
                  {own ? "You" : m.nickname} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  {!own && (
                    <>
                      <Button variant="ghost" size="sm" onClick={() => onPrivateMessage(m)} className="h-6 gap-1 px-1.5 text-[10px]" title={`Private message · ${DM_CREDITS} credit`}>
                        <MailPlus className="h-3 w-3" /> Private · {DM_CREDITS}
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => addKnown(m)} className="h-6 w-6" title="Add to Known People" aria-label={`Add ${m.nickname} to Known People`}>
                        <UserPlus className="h-3 w-3" />
                      </Button>
                    </>
                  )}
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

interface DmMessage {
  id: string;
  otherMemberId: string;
  fromNickname: string;
  content: string;
  created_at: string;
  mine: boolean;
}

function PrivateChats({ callLounge, target, setTarget }: {
  callLounge: (p: Record<string, unknown>) => Promise<any>;
  target: { memberId: string; nickname: string } | null;
  setTarget: (t: { memberId: string; nickname: string } | null) => void;
}) {
  const navigate = useNavigate();
  const [dms, setDms] = useState<DmMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    let knownIds = new Set<string>();
    const load = async () => {
      try {
        const data = await callLounge({ action: "list_dms" });
        const next = (data.messages ?? []) as DmMessage[];
        if (!cancelled && knownIds.size > 0) {
          const incoming = next.find((m) => !m.mine && !knownIds.has(m.id));
          if (incoming) toast(`💌 ${incoming.fromNickname} sent you a private message`, { description: "Open the Private tab to reply." });
        }
        knownIds = new Set(next.map((m) => m.id));
        if (!cancelled) setDms(next);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const timer = window.setInterval(load, 4000);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [callLounge]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dms, target]);

  const threads = (() => {
    const map = new Map<string, { memberId: string; nickname: string; last: DmMessage }>();
    for (const m of dms) {
      const nick = m.mine ? (map.get(m.otherMemberId)?.nickname ?? "Anonymous") : m.fromNickname;
      map.set(m.otherMemberId, { memberId: m.otherMemberId, nickname: nick, last: m });
    }
    return [...map.values()].sort((a, b) => b.last.created_at.localeCompare(a.last.created_at));
  })();

  const thread = target
    ? dms.filter((m) => m.otherMemberId === target.memberId)
    : [];

  const send = async () => {
    const content = text.trim();
    if (!content || sending || !target) return;
    setSending(true);
    try {
      const res = await callLounge({ action: "dm", memberId: target.memberId, content });
      if (res?.message) {
        setDms((prev) => (prev.some((p) => p.id === res.message.id) ? prev : [...prev, res.message]));
      }
      setText("");
      toast.success(`Private message sent · ${DM_CREDITS} credit used`);
    } catch (e: any) {
      if (e?.status === 402 || e?.body?.error === "insufficient_credits") {
        toast.error(`You need ${DM_CREDITS} credit to send a private message.`);
        navigate("/ai-credits-store");
      } else if (e?.body?.error === "no_pass") {
        toast.error("Your daily pass expired. Please re-enter tomorrow.");
      } else {
        toast.error("Message could not be sent.");
      }
    } finally {
      setSending(false);
    }
  };

  if (!target) {
    return (
      <div className="rounded-2xl border bg-card flex flex-col h-full w-full max-w-2xl mx-auto min-h-0">
        <div className="px-4 py-2 border-b shrink-0">
          <p className="font-bold text-sm flex items-center gap-1.5"><Lock className="h-4 w-4 text-primary" /> Private messages</p>
          <p className="text-xs text-muted-foreground">Sending one private message costs {DM_CREDITS} credit · nicknames only</p>
        </div>
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2 min-h-0">
          {loading && <div className="flex justify-center py-8"><Loader2 className="h-5 w-5 animate-spin text-primary" /></div>}
          {!loading && threads.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-10">
              No private conversations yet. Tap <strong>Private</strong> next to someone's message in a room to write them. 💛
            </p>
          )}
          {threads.map((t) => (
            <button
              key={t.memberId}
              onClick={() => setTarget({ memberId: t.memberId, nickname: t.nickname })}
              className="w-full rounded-xl border bg-background hover:bg-muted transition-colors px-3 py-2 text-left"
            >
              <p className="text-sm font-semibold">{t.nickname}</p>
              <p className="text-xs text-muted-foreground truncate">
                {t.last.mine ? "You: " : ""}{t.last.content}
              </p>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card flex flex-col h-full w-full max-w-2xl mx-auto min-h-0">
      <div className="px-3 py-2 border-b shrink-0 flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setTarget(null)} aria-label="Back">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="min-w-0">
          <p className="font-bold text-sm truncate">{target.nickname}</p>
          <p className="text-xs text-muted-foreground">Private · {DM_CREDITS} credit per message you send</p>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-0">
        {thread.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-10">
            Say something kind. Your first message costs {DM_CREDITS} credit.
          </p>
        )}
        {thread.map((m) => {
          const own = m.mine;
          return (
            <div key={m.id} className={`flex flex-col ${own ? "items-end" : "items-start"}`}>
              <span className="text-[11px] text-muted-foreground mb-0.5">
                {own ? "You" : m.fromNickname} · {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              </span>
              <div className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm whitespace-pre-wrap ${own ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
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
          placeholder="Write a private message…"
          maxLength={500}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <Button size="icon" onClick={send} disabled={sending || !text.trim()} aria-label={`Send for ${DM_CREDITS} credit`} title={`${DM_CREDITS} credit per private message`}>
          {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
        </Button>
      </div>
    </div>
  );
}

export default SupportLounge;
