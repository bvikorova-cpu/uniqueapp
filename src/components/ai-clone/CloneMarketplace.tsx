import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Bot, Search, MessageCircle, Crown, Swords, Loader2, TrendingUp, Sparkles, Trophy } from "lucide-react";
import { CloneChatDialog } from "./CloneChatDialog";
import { motion } from "framer-motion";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Clone {
  id: string;
  clone_name: string;
  subscription_tier: string;
  total_conversations: number;
  personality_data: any;
  tone?: string | null;
}

type SortKey = "trending" | "new" | "fresh";

const SORTS: { id: SortKey; label: string; icon: any }[] = [
  { id: "trending", label: "Most talked-to", icon: TrendingUp },
  { id: "new", label: "Newest", icon: Sparkles },
  { id: "fresh", label: "Needs a first chat", icon: MessageCircle },
];

export function CloneMarketplace() {
  const { toast } = useToast();
  const [clones, setClones] = useState<Clone[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sort, setSort] = useState<SortKey>("trending");
  const [loading, setLoading] = useState(false);
  const [selectedClone, setSelectedClone] = useState<Clone | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [challengingId, setChallengingId] = useState<string | null>(null);
  const [challengeResult, setChallengeResult] = useState<any | null>(null);

  // Server-side search (debounced) so results aren't limited to the first page.
  useEffect(() => {
    const t = setTimeout(() => { fetchPublicClones(searchTerm.trim()); }, 150);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, sort]);

  const fetchPublicClones = async (term = "") => {
    setLoading(true);
    try {
      let query = (supabase as any)
        .from('public_clones')
        .select('id, clone_name, subscription_tier, total_conversations, personality_summary, tone, created_at');

      if (term) {
        const safe = term.replace(/[%,()]/g, " ").trim();
        query = query.or(`clone_name.ilike.%${safe}%,personality_summary.ilike.%${safe}%`);
      }

      if (sort === "new") query = query.order('created_at', { ascending: false });
      else if (sort === "fresh") query = query.order('total_conversations', { ascending: true });
      else query = query.order('total_conversations', { ascending: false });

      const { data, error } = await query.limit(60);
      if (error) throw error;
      setClones((data || []).map((c: any) => ({
        id: c.id,
        clone_name: c.clone_name,
        subscription_tier: c.subscription_tier,
        total_conversations: c.total_conversations,
        tone: c.tone,
        personality_data: { personality: c.personality_summary, tone: c.tone },
      })));
    } catch (error) {
      console.error('Error fetching clones:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (clone: Clone) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({ title: "Authentication Required", description: "Please sign in to chat with AI clones", variant: "destructive" });
      return;
    }
    setSelectedClone(clone);
    setChatOpen(true);
  };

  const handleChallenge = async (clone: Clone) => {
    setChallengingId(clone.id);
    try {
      const { data, error } = await supabase.functions.invoke("clone-battle", { body: { opponentCloneId: clone.id } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setChallengeResult(data);
    } catch (err: any) {
      toast({ title: "Challenge failed", description: err.message || "Please try again", variant: "destructive" });
    } finally {
      setChallengingId(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title="Clone Marketplace - How it works"
        steps={[
          { title: "Browse", desc: "Every public clone on the platform, ranked by how much people talk to it." },
          { title: "Search", desc: "Type a name, trait or vibe - suggestions appear from the first letter." },
          { title: "Chat", desc: "Talk to any clone as if you were talking to its owner's personality." },
          { title: "Challenge", desc: "Send your own clone into the arena against the one you are viewing." },
        ]}
      />
      <div className="space-y-6">
        <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
          <CardHeader>
            <CardTitle>Explore AI Clones</CardTitle>
            <CardDescription>
              The marketplace is where every public clone lives. Chat with someone's AI personality before you ever
              message the person, discover clones worth following, or challenge one to a duel in the arena.
              (20 AI responses/day limit.)
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search clones by name or personality..."
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setSuggestOpen(true); }}
                onFocus={() => setSuggestOpen(true)}
                onBlur={() => setTimeout(() => setSuggestOpen(false), 150)}
                className="pl-10 bg-background/50"
              />
              {suggestOpen && searchTerm.trim().length >= 1 && clones.length > 0 && (
                <div className="absolute z-50 mt-1 w-full max-h-72 overflow-y-auto rounded-md border border-primary/20 bg-popover shadow-lg">
                  {clones.slice(0, 8).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      className="flex w-full items-center gap-2 px-3 py-2 text-left transition-colors hover:bg-accent"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => { setSuggestOpen(false); handleStartChat(c); }}
                    >
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-4 w-4 text-primary" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{c.clone_name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {(c.personality_data as any)?.personality || `${c.total_conversations} conversations`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {suggestOpen && searchTerm.trim().length >= 1 && !loading && clones.length === 0 && (
                <div className="absolute z-50 mt-1 w-full rounded-md border border-primary/20 bg-popover px-3 py-2 text-sm text-muted-foreground shadow-lg">
                  No clones found
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {SORTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setSort(s.id)}
                  className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    sort === s.id ? "border-primary bg-primary/10 text-primary" : "border-border/60 text-muted-foreground hover:border-primary/40"
                  }`}
                >
                  <s.icon className="h-3 w-3" /> {s.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {clones.map((clone, i) => (
            <motion.div key={clone.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i * 0.04, 0.4) }}>
              <Card className="h-full bg-card/80 backdrop-blur-xl border-primary/20 transition-all hover:border-primary/40">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                        <Bot className="h-5 w-5 text-primary" />
                      </div>
                      <CardTitle className="text-lg">{clone.clone_name}</CardTitle>
                    </div>
                    {clone.subscription_tier === 'celebrity' && (
                      <Badge variant="default"><Crown className="mr-1 h-3 w-3" /> Celebrity</Badge>
                    )}
                  </div>
                  <CardDescription className="flex flex-wrap items-center gap-2">
                    <span>{clone.total_conversations} conversations</span>
                    {clone.tone && <Badge variant="outline" className="capitalize">{clone.tone}</Badge>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="mb-4 line-clamp-3 text-sm text-muted-foreground">
                    {(clone.personality_data as any)?.personality || "A unique AI personality"}
                  </p>
                  <div className="flex gap-2">
                    <Button className="flex-1" variant="outline" onClick={() => handleStartChat(clone)}>
                      <MessageCircle className="mr-2 h-4 w-4" /> Chat
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => handleChallenge(clone)}
                      disabled={challengingId === clone.id}
                      aria-label={`Challenge ${clone.clone_name}`}
                    >
                      {challengingId === clone.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {!loading && clones.length === 0 && (
          <Card className="bg-card/80 backdrop-blur-xl border-primary/20">
            <CardContent className="py-12 text-center">
              <Bot className="mx-auto mb-4 h-16 w-16 text-muted-foreground/50" />
              <p className="text-muted-foreground">No clones found matching your search</p>
            </CardContent>
          </Card>
        )}

        <CloneChatDialog open={chatOpen} onOpenChange={setChatOpen} clone={selectedClone} />

        <Dialog open={!!challengeResult} onOpenChange={(o) => !o && setChallengeResult(null)}>
          <DialogContent className="max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-400" /> Winner: {challengeResult?.winner}
              </DialogTitle>
              <DialogDescription>
                {challengeResult?.topic} · {challengeResult?.myClone?.name} {challengeResult?.userScore}
                {" – "}
                {challengeResult?.opponentScore} {challengeResult?.opponent?.name}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-3">
              {(challengeResult?.rounds ?? []).map((r: any) => (
                <div key={r.round} className="rounded-xl border border-border/50 bg-background/50 p-3">
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Round {r.round}</p>
                  <p className="mb-2 text-sm">{r.a}</p>
                  <p className="text-sm text-muted-foreground">{r.b}</p>
                </div>
              ))}
              {challengeResult?.verdict && (
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-3 text-sm">
                  <span className="font-semibold">Judge: </span>{challengeResult.verdict}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}
