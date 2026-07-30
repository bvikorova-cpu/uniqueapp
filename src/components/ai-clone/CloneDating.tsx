import { useCallback, useEffect, useRef, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Heart, MessageCircle, Sparkles, Bot, Loader2, Play, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface DateMessage { speaker: string; text: string }


interface MatchClone {
  id: string;
  clone_name: string;
  personality_data: any;
  user_id?: string | null;
  owner_name?: string | null;
}


interface DatingSession {
  id: string;
  clone_1_id?: string | null;
  clone_2_id?: string | null;
  status: string;
  compatibility_score: number | null;
  payment_amount: number | null;
  created_at: string;
  session_data?: { messages?: DateMessage[]; summary?: string } | null;
}

export function CloneDating() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSearching, setIsSearching] = useState(false);
  const [sessions, setSessions] = useState<DatingSession[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [openSession, setOpenSession] = useState<DatingSession | null>(null);
  const [runningId, setRunningId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  const [matches, setMatches] = useState<Record<string, MatchClone>>({});

  const timersRef = useRef<ReturnType<typeof setInterval>[]>([]);

  const RUN_STAGES = [
    "Matching your clones…",
    "Warming up the conversation…",
    "Clones are chatting…",
    "Measuring chemistry…",
    "Almost done…",
  ];

  const clearTimers = () => {
    timersRef.current.forEach((t) => clearInterval(t));
    timersRef.current = [];
  };

  useEffect(() => () => clearTimers(), []);




  const loadSessions = useCallback(async () => {
    setLoadingSessions(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setSessions([]); return; }
      const { data: clones } = await supabase
        .from("personality_clones")
        .select("id")
        .eq("user_id", user.id);
      const ids = (clones ?? []).map((c: { id: string }) => c.id);
      if (!ids.length) { setSessions([]); return; }
      const { data } = await supabase
        .from("clone_dating_sessions")
        .select("id, clone_1_id, clone_2_id, status, compatibility_score, payment_amount, created_at, session_data")
        .or(`clone_1_id.in.(${ids.join(",")}),clone_2_id.in.(${ids.join(",")})`)
        .order("created_at", { ascending: false })
        .limit(20);
      const rows = (data as DatingSession[]) ?? [];
      setSessions(rows);

      // Chat always targets ANOTHER user's clone (the date partner), never my own.
      const mine = new Set(ids);
      const partnerIds = Array.from(new Set(
        rows.flatMap((r) => [r.clone_1_id, r.clone_2_id].filter((cid): cid is string => !!cid && !mine.has(cid))),
      ));
      const byId: Record<string, MatchClone> = {};
      if (partnerIds.length) {
        const { data: partnerRows } = await supabase
          .from("personality_clones")
          .select("id, clone_name, personality_data")
          .in("id", partnerIds);
        (partnerRows ?? []).forEach((c: any) => { byId[c.id] = c as MatchClone; });
      }

      // Fallback pool: random clones from other users for sessions without a partner.
      const needsFallback = rows.some(
        (r) => !( (r.clone_1_id && byId[r.clone_1_id]) || (r.clone_2_id && byId[r.clone_2_id]) ),
      );
      let pool: MatchClone[] = [];
      if (needsFallback) {
        const { data: others } = await supabase
          .from("personality_clones")
          .select("id, clone_name, personality_data")
          .neq("user_id", user.id)
          .limit(50);
        pool = (others ?? []) as MatchClone[];
      }

      const map: Record<string, MatchClone> = {};
      rows.forEach((r) => {
        const partner =
          (r.clone_1_id && byId[r.clone_1_id]) ||
          (r.clone_2_id && byId[r.clone_2_id]) ||
          (pool.length ? pool[Math.floor(Math.random() * pool.length)] : null);
        if (partner) map[r.id] = partner;
      });
      setMatches(map);


    } finally {
      setLoadingSessions(false);
    }
  }, []);

  const openOrRun = async (session: DatingSession) => {
    const hasTranscript = Array.isArray(session.session_data?.messages) && session.session_data!.messages!.length > 0;
    setOpenSession(session);
    if (hasTranscript) return;
    setRunningId(session.id);
    setProgress(6);
    setStage(0);
    clearTimers();
    timersRef.current.push(
      setInterval(() => setProgress((p) => (p < 92 ? p + Math.max(1, Math.round((95 - p) / 18)) : p)), 400),
    );
    timersRef.current.push(
      setInterval(() => setStage((s) => Math.min(s + 1, RUN_STAGES.length - 1)), 2600),
    );
    try {
      const { data, error } = await supabase.functions.invoke("clone-chat", { body: { mode: "date", sessionId: session.id } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const updated: DatingSession = {
        ...session,
        status: "completed",
        compatibility_score: data.score ?? session.compatibility_score,
        session_data: { messages: data.messages ?? [], summary: data.summary ?? "" },
      };
      clearTimers();
      setProgress(100);
      setOpenSession(updated);
      setSessions((prev) => prev.map((s) => (s.id === session.id ? updated : s)));
      toast({ title: "The date is ready", description: `Compatibility ${updated.compatibility_score ?? "—"}%` });
      // refresh from DB so the list always reflects persisted state
      loadSessions();
    } catch (err: unknown) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Could not load the date",
        variant: "destructive",
      });
    } finally {
      clearTimers();
      setRunningId(null);

    }
  };


  const matchOf = useCallback((s: DatingSession | null): MatchClone | null => {
    if (!s) return null;
    // The date partner: another user's clone, resolved per session.
    return matches[s.id] ?? null;
  }, [matches]);



  useEffect(() => { loadSessions(); }, [loadSessions]);


  const startDatingSession = async () => {
    // Open synchronously so mobile browsers do not block Stripe as a popup
    // after the asynchronous authentication and checkout requests finish.
    const checkoutWindow = window.open("about:blank", "_blank");
    setIsSearching(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        checkoutWindow?.close();
        toast({ title: "Authentication Required", description: "Please sign in to use Clone Dating", variant: "destructive" });
        return;
      }

      const { data: userClones } = await supabase
        .from('personality_clones')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .limit(1);

      if (!userClones || userClones.length === 0) {
        checkoutWindow?.close();
        toast({ title: "No Active Clone", description: "You need an active clone to use Clone Dating", variant: "destructive" });
        return;
      }

      // Use Stripe checkout for dating session
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { productKey: "clone_dating" } });

      if (error) throw error;
      if (data?.url) {
        if (checkoutWindow) {
          checkoutWindow.location.href = data.url;
        } else {
          window.location.href = data.url;
        }
      } else {
        checkoutWindow?.close();
        throw new Error("Stripe checkout URL was not returned.");
      }
    } catch (error: any) {
      checkoutWindow?.close();
      toast({ title: "Error", description: error.message || "Failed to start dating session", variant: "destructive" });
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Clone Dating - How it works"} steps={[{ title: 'Open', desc: 'Access the Clone Dating section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Clone Dating.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <Card className="bg-card/80 backdrop-blur-xl border-pink-500/20 bg-gradient-to-br from-pink-950/10 to-purple-950/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-400" />
            Clone-to-Clone Speed Dating
          </CardTitle>
          <CardDescription>
            Let your AI clone meet and chat with other clones to build connections
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-4">
            <div className="flex justify-center gap-4 mb-6">
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity }}>
                <Bot className="h-16 w-16 text-primary" />
              </motion.div>
              <Heart className="h-12 w-12 text-pink-400 mt-2" />
              <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}>
                <Bot className="h-16 w-16 text-accent" />
              </motion.div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[
                { icon: MessageCircle, title: "Auto Conversations", desc: "Clones chat automatically", color: "text-primary" },
                { icon: Sparkles, title: "Compatibility Score", desc: "AI-generated match rating", color: "text-pink-400" },
                { icon: Heart, title: "New Connections", desc: "Expand your network", color: "text-accent" },
              ].map((item, i) => (
                <Card key={i} className="bg-background/50 border-border/50">
                  <CardContent className="pt-6 text-center">
                    <item.icon className={`h-8 w-8 mx-auto mb-2 ${item.color}`} />
                    <h3 className="font-semibold mb-1 text-sm">{item.title}</h3>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={startDatingSession} disabled={isSearching} size="lg" className="w-full max-w-md">
              {isSearching ? (
                <><Loader2 className="h-4 w-4 animate-spin mr-2" /> Finding a match...</>
              ) : (
                <><Heart className="mr-2 h-5 w-5" /> Start Dating Session (€4.99)</>
              )}
            </Button>

            <p className="text-xs text-muted-foreground">
              Your clone will have a 10-minute speed dating session with another compatible clone
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card/80 backdrop-blur-xl border-pink-500/20">
        <CardHeader className="flex flex-row items-center justify-between gap-2">
          <CardTitle className="text-base">Your Dating Sessions</CardTitle>
          <Button variant="outline" size="sm" onClick={loadSessions} disabled={loadingSessions}>
            {loadingSessions ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Refresh"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {loadingSessions ? (
            <p className="text-sm text-muted-foreground">Loading…</p>
          ) : sessions.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No sessions yet. After a successful payment your session appears here.
            </p>
          ) : (
            sessions.map((s) => {
              const hasTranscript = (s.session_data?.messages?.length ?? 0) > 0;
              return (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => openOrRun(s)}
                  disabled={runningId === s.id}
                  className="w-full flex items-center justify-between gap-3 rounded-lg border border-border/50 p-3 text-left transition-colors hover:bg-muted/50 disabled:opacity-70"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium">Speed dating session</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {new Date(s.created_at).toLocaleString()} · €{Number(s.payment_amount ?? 0).toFixed(2)}
                    </p>
                    <p className="text-xs text-pink-400 mt-1 flex items-center gap-1">
                      {runningId === s.id ? (
                        <><Loader2 className="h-3 w-3 animate-spin" /> {RUN_STAGES[stage]}</>
                      ) : hasTranscript ? (
                        <><MessageCircle className="h-3 w-3" /> View conversation</>
                      ) : (
                        <><Play className="h-3 w-3" /> Run the date</>
                      )}
                    </p>
                    {runningId === s.id && <Progress value={progress} className="h-1 mt-2" />}
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {s.compatibility_score != null && (
                      <Badge variant="secondary">{s.compatibility_score}%</Badge>
                    )}
                    <Badge variant="outline" className="capitalize">{s.status}</Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </button>
              );
            })

          )}
        </CardContent>
      </Card>

      <Dialog open={!!openSession} onOpenChange={(o) => !o && setOpenSession(null)}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-400" /> Speed dating result
            </DialogTitle>
          </DialogHeader>
          {openSession && (
            <div className="space-y-4">
              {openSession.compatibility_score != null && (
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">Compatibility {openSession.compatibility_score}%</Badge>
                  <Badge variant="outline" className="capitalize">{openSession.status}</Badge>
                </div>
              )}
              {runningId === openSession.id ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin text-pink-400" /> {RUN_STAGES[stage]}
                    </p>
                    <Progress value={progress} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      This usually takes 10-20 seconds. The result appears here automatically.
                    </p>
                  </div>
                  <div className="space-y-2">
                    {[0, 1, 2].map((i) => (
                      <div key={i} className={`rounded-lg p-3 ${i % 2 === 0 ? "bg-primary/5" : "bg-pink-500/5"}`}>
                        <Skeleton className="h-3 w-24 mb-2" />
                        <Skeleton className="h-3 w-full mb-1.5" />
                        <Skeleton className="h-3 w-4/5" />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  <AnimatePresence initial={false}>
                    <div className="space-y-2">
                      {(openSession.session_data?.messages ?? []).map((m, i) => (
                        <motion.div
                          key={i}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: Math.min(i * 0.08, 0.6) }}
                          className={`rounded-lg p-3 text-sm ${i % 2 === 0 ? "bg-primary/10" : "bg-pink-500/10"}`}
                        >
                          <p className="text-xs font-semibold mb-1">{m.speaker}</p>
                          <p>{m.text}</p>
                        </motion.div>
                      ))}
                    </div>
                  </AnimatePresence>
                  {(openSession.session_data?.messages?.length ?? 0) > 0 && (
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> Date completed
                    </p>
                  )}
                  {matchOf(openSession)?.user_id && (
                    <Button
                      className="w-full"
                      onClick={() => {
                        const m = matchOf(openSession);
                        if (!m?.user_id) return;
                        setOpenSession(null);
                        navigate(`/messenger?user=${m.user_id}`);
                      }}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Message {matchOf(openSession)?.owner_name ?? "your match"}
                    </Button>
                  )}

                  {openSession.session_data?.summary && (
                    <div className="rounded-lg border border-border/50 p-3">

                      <p className="text-xs font-semibold mb-1">Chemistry summary</p>
                      <p className="text-sm text-muted-foreground">{openSession.session_data.summary}</p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>






      <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
        <CardHeader>
          <CardTitle>How Clone Dating Works</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[
            "Your AI clone is matched with another compatible clone",
            "They have an automatic conversation for 10 minutes",
            "AI analyzes compatibility and generates a match score",
            "Review the conversation, then chat live yourself with the matched clone of another user",
          ].map((step, i) => (
            <div key={i} className="flex gap-3">
              <Badge variant="outline" className="h-6 w-6 rounded-full flex items-center justify-center flex-shrink-0">{i + 1}</Badge>
              <p className="text-sm">{step}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
    </>
  );
}
