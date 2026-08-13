import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Film, Trophy, Plus, Flame, MessageCircle, Send, Trash2, Video, Swords, X,
  Info, RefreshCw, Coins, Users,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DropZone, type DropZoneValidation } from "@/components/kitchen-battles/DropZone";
import reelHero from "@/assets/reel-battles-hero.mp4.asset.json";
import ReelBattlesLeaderboard from "@/components/reel-battles/ReelBattlesLeaderboard";
import { useBattleCoins, BATTLE_ENTRY_COINS } from "@/hooks/useBattleCoins";
import BattleCoinsWallet from "@/components/battle-coins/BattleCoinsWallet";
import MonthlyChampionRewardsCard from "@/components/battle-coins/MonthlyChampionRewardsCard";
import BattleCosmeticsShop from "@/components/battle-coins/BattleCosmeticsShop";

type Battle = { id: string; theme: string; description: string | null; status: string; deadline: string; created_by: string | null };
type Participant = { id: string; battle_id: string; user_id: string; reel_title: string; description: string | null; video_url: string | null; media_type: string | null; vote_count: number };
type Comment = { id: string; battle_id: string; participant_id: string | null; user_id: string; content: string; created_at: string };
type MyVote = { participant_id: string; vote_type: string };

/** Entry fee in Battle Coins — identical to KitchenStars. */
const REEL_ENTRY_COST = BATTLE_ENTRY_COINS;
const STORAGE_BUCKET = "wall-media";
const VIDEO_EXTS = ["mp4", "webm", "mov", "m4v", "3gp", "3gpp", "mkv", "avi", "mpeg", "mpg", "ogv"];
const MAX_VIDEO = 50 * 1024 * 1024; // 50 MB
/** Mobile pickers often report odd or empty MIME types — accept any video/* or a known extension. */
const isVideoFile = (file: File) => {
  if (file.type?.toLowerCase().startsWith("video/")) return true;
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  return VIDEO_EXTS.includes(ext);
};
/** The storage bucket only accepts a short MIME whitelist — normalise anything else. */
const safeMime = (file: File) =>
  ["video/mp4", "video/webm", "video/quicktime"].includes(file.type) ? file.type : "video/mp4";

export default function ReelBattles() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { coins: balance, refresh: refreshCoins } = useBattleCoins("reel_battles");
  const [battles, setBattles] = useState<Battle[]>([]);
  const [participants, setParticipants] = useState<Record<string, Participant[]>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [myVotes, setMyVotes] = useState<Record<string, MyVote>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [userXP, setUserXP] = useState<number>(0);
  const [hubXP, setHubXP] = useState<number>(0);
  /** null = closed, "new" = start a duel, "<battleId>" = join as opponent */
  const [formFor, setFormFor] = useState<string | null>(null);
  const [reelTitle, setReelTitle] = useState("");
  const [reelDesc, setReelDesc] = useState("");
  const [reelFile, setReelFile] = useState<File | null>(null);
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  /** Deep-linkable selected duel (?c=<battleId>) */
  const [selectedId, setSelectedId] = useState<string | null>(
    () => new URLSearchParams(window.location.search).get("c"),
  );
  const openCompetition = (id: string) => {
    setSelectedId(id);
    navigate({ search: `?c=${id}` }, { replace: false });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const closeCompetition = () => {
    setSelectedId(null);
    navigate({ search: "" }, { replace: false });
  };
  const visibleBattles = selectedId ? battles.filter(b => b.id === selectedId) : battles;

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    setUserId(session.user.id);

    const [{ data: xpData }, { data: hubData }] = await Promise.all([
      supabase.from("user_xp").select("total_xp").eq("user_id", session.user.id).maybeSingle(),
      supabase.from("hub_xp").select("xp").eq("user_id", session.user.id).eq("hub", "reel_battles").maybeSingle(),
    ]);
    await refreshCoins();
    setUserXP(xpData?.total_xp ?? 0);
    setHubXP(hubData?.xp ?? 0);

    const { data: bs } = await supabase.from("reel_battles")
      .select("id, theme, description, status, deadline, created_by")
      .order("created_at", { ascending: false }).limit(30);
    setBattles(bs || []);

    if (bs && bs.length) {
      const ids = bs.map(b => b.id);
      const [{ data: ps }, { data: cs }, { data: vs }] = await Promise.all([
        supabase.from("reel_battle_participants").select("*").in("battle_id", ids).order("created_at", { ascending: true }),
        supabase.from("reel_battle_comments").select("*").in("battle_id", ids).order("created_at", { ascending: true }),
        supabase.from("reel_battle_votes").select("battle_id, participant_id, vote_type").eq("voter_id", session.user.id).in("battle_id", ids),
      ]);

      const grouped: Record<string, Participant[]> = {};
      (ps || []).forEach((p: any) => {
        grouped[p.battle_id] = grouped[p.battle_id] || [];
        grouped[p.battle_id].push(p);
      });
      setParticipants(grouped);

      const cgrouped: Record<string, Comment[]> = {};
      (cs || []).forEach((c: any) => {
        cgrouped[c.battle_id] = cgrouped[c.battle_id] || [];
        cgrouped[c.battle_id].push(c);
      });
      setComments(cgrouped);

      const mv: Record<string, MyVote> = {};
      (vs || []).forEach((v: any) => { mv[v.battle_id] = { participant_id: v.participant_id, vote_type: v.vote_type }; });
      setMyVotes(mv);
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const formatBytes = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`;

  const validateFile = (file: File): DropZoneValidation => {
    if (!isVideoFile(file)) {
      return { ok: false, title: "Video required", reason: `"${file.name}" is not a supported video format.`, suggestion: "Upload MP4, WEBM or MOV, max 50 MB." };
    }
    if (file.size > MAX_VIDEO) {
      return { ok: false, title: "Video too large", reason: `Your reel is ${formatBytes(file.size)} — the limit is 50 MB.`, suggestion: "Trim it or re-encode at 720p." };
    }
    if (file.size === 0) {
      return { ok: false, title: "Empty file", reason: "The selected file is 0 bytes.", suggestion: "Pick another video and try again." };
    }
    return { ok: true, type: "video" };
  };

  const resetForm = () => { setFormFor(null); setReelTitle(""); setReelDesc(""); setReelFile(null); };

  /** Uploads the reel video and returns its public URL and storage path. */
  const uploadVideo = async (battleId: string, file: File): Promise<{ url: string; path: string } | null> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const path = `${userId}/reel-battles/${battleId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from(STORAGE_BUCKET)
      .upload(path, file, { contentType: safeMime(file), upsert: false });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    return { url: supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path).data.publicUrl, path };
  };

  const registerPaidEntry = async (battleId: string, file: File, videoUrl: string) => {
    const { data, error } = await supabase.rpc("enter_reel_competition", {
      _battle_id: battleId,
      _reel_title: reelTitle.trim(),
      _description: reelDesc.trim(),
      _video_url: videoUrl,
      _media_size: file.size,
      _media_mime: safeMime(file),
    });
    if (error) {
      const insufficient = error.message.includes("INSUFFICIENT_COINS");
      toast({
        title: insufficient ? "Not enough Battle Coins" : "Could not enter the duel",
        description: insufficient
          ? `Entry costs ${REEL_ENTRY_COST} Battle Coins — you have ${balance}.`
          : error.message,
        variant: "destructive",
      });
      return false;
    }
    window.dispatchEvent(new Event("battle-coins-updated"));
    await refreshCoins();
    return Boolean(data);
  };

  /** Validates the shared reel form. */
  const validateForm = (): File | null => {
    if (!reelTitle.trim() || reelTitle.length > 120) {
      toast({ title: "Reel title required (max 120 characters)", variant: "destructive" }); return null;
    }
    if (reelDesc.length > 500) {
      toast({ title: "Description too long (max 500 characters)", variant: "destructive" }); return null;
    }
    if (!reelFile) {
      toast({ title: "Reel video required", description: "Upload your reel video.", variant: "destructive" }); return null;
    }
    const v = validateFile(reelFile);
    if (v.ok === false) { toast({ title: v.title, description: `${v.reason} ${v.suggestion}`, variant: "destructive" }); return null; }
    return reelFile;
  };

  /** Start a duel: creates the duel and uploads the first reel. */
  const startCompetition = async () => {
    const file = validateForm();
    if (!file || !userId) return;

    if (balance < REEL_ENTRY_COST) {
      toast({ title: "Not enough Battle Coins", description: `Entry costs ${REEL_ENTRY_COST} Battle Coins — you have ${balance}.`, variant: "destructive" });
      return;
    }

    setBusy(true);
    const { data: battle, error: be } = await supabase.from("reel_battles")
      .insert({ theme: reelTitle.trim(), description: reelDesc.trim() || null, created_by: userId })
      .select("id").single();
    if (be || !battle) {
      setBusy(false);
      toast({ title: "Could not start the duel", description: be?.message, variant: "destructive" });
      return;
    }

    const upload = await uploadVideo(battle.id, file);
    if (!upload) { setBusy(false); return; }
    const registered = await registerPaidEntry(battle.id, file, upload.url);
    setBusy(false);
    if (!registered) {
      await Promise.all([
        supabase.storage.from(STORAGE_BUCKET).remove([upload.path]),
        supabase.from("reel_battles").delete().eq("id", battle.id).eq("created_by", userId),
      ]);
      return;
    }

    resetForm();
    toast({ title: "Reel duel started!", description: "The next creator who uploads a reel becomes your opponent." });
    load();
  };

  /** Join an open duel as the opponent. */
  const joinCompetition = async (battleId: string) => {
    const parts = participants[battleId] || [];
    if (parts.find(p => p.user_id === userId)) {
      toast({ title: "You are already in this duel", variant: "destructive" }); resetForm(); return;
    }
    if (parts.length >= 2) {
      toast({ title: "Duel is full", description: "Start your own duel instead.", variant: "destructive" });
      resetForm(); load(); return;
    }
    const file = validateForm();
    if (!file || !userId) return;

    if (balance < REEL_ENTRY_COST) {
      toast({ title: "Not enough Battle Coins", description: `Entry costs ${REEL_ENTRY_COST} Battle Coins — you have ${balance}.`, variant: "destructive" });
      return;
    }

    setBusy(true);
    const upload = await uploadVideo(battleId, file);
    if (!upload) { setBusy(false); return; }
    const registered = await registerPaidEntry(battleId, file, upload.url);
    setBusy(false);
    if (!registered) {
      await supabase.storage.from(STORAGE_BUCKET).remove([upload.path]);
      return;
    }

    resetForm();
    toast({ title: "You are the opponent!", description: "Both reels are live — voting is open." });
    load();
  };

  const vote = async (battleId: string, participantId: string) => {
    if (!userId) {
      toast({ title: "Sign in required", description: "Voting is free, but you must be registered on Unique." });
      navigate("/auth");
      return;
    }
    if (myVotes[battleId]) {
      toast({ title: "Vote already used", description: "You have exactly 1 free vote per duel and it can't be changed.", variant: "destructive" });
      return;
    }

    const { data, error } = await supabase.functions.invoke("reel-battle-vote", {
      body: { battleId, participantId, voteType: "like" } });

    if (error || data?.error) {
      toast({ title: "Vote failed", description: error?.message || data?.error, variant: "destructive" });
      return;
    }
    toast({ title: "Vote counted!" });
    load();
  };

  const postComment = async (battleId: string) => {
    const content = (commentDraft[battleId] || "").trim();
    if (!content) return;
    const { error } = await supabase.from("reel_battle_comments").insert({ battle_id: battleId, participant_id: null, user_id: userId, content });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setCommentDraft(prev => ({ ...prev, [battleId]: "" }));
    load();
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from("reel_battle_comments").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    load();
  };

  const convertXP = async () => {
    if (userXP < 1000) {
      toast({ title: "Not enough XP", description: "You need at least 1 000 XP to convert.", variant: "destructive" });
      return;
    }
    setBusy(true);
    const { data, error } = await supabase.rpc("convert_xp_to_credits", {
      p_xp_amount: 1000,
      p_target: "ai_credits",
    });
    setBusy(false);
    if (error) {
      toast({ title: "Conversion failed", description: error.message, variant: "destructive" });
      return;
    }
    const received = (data as any)?.credits_received ?? 1;
    toast({ title: "XP converted!", description: `You spent 1 000 XP and received ${received} AI credit.` });
    await load();
    window.dispatchEvent(new Event("ai-credits-updated"));
  };

  const videoForm = (mode: "new" | string) => (
    <div className="space-y-3 p-4 rounded-xl border border-primary/30 bg-secondary/20">
      <div className="flex items-center justify-between">
        <p className="font-semibold flex items-center gap-2">
          <Video className="h-4 w-4 text-primary" />
          {mode === "new" ? "Start a reel duel" : "Upload your reel as the opponent"}
        </p>
        <Button size="icon" variant="ghost" onClick={resetForm} aria-label="Close form"><X className="h-4 w-4" /></Button>
      </div>
      <Input placeholder="Reel title (e.g. Sunset skate line)" value={reelTitle} maxLength={120}
        onChange={e => setReelTitle(e.target.value)} />
      <Textarea placeholder="Short description of your reel (optional)" value={reelDesc} maxLength={500}
        onChange={e => setReelDesc(e.target.value)} rows={3} />
      <DropZone file={reelFile} onChange={setReelFile} validate={validateFile} accept="video/*" hint="Reel video: MP4 / WEBM / MOV, max 50 MB" />
      <p className="text-xs text-muted-foreground">
        Reel video only — MP4 / WEBM / MOV, max 50 MB. Entry costs {REEL_ENTRY_COST} Battle Coins (you have {balance}).
      </p>
      <Button className="w-full" disabled={busy}
        onClick={() => mode === "new" ? startCompetition() : joinCompetition(mode)}>
        {busy ? "Uploading..." : mode === "new" ? "Create duel & upload reel" : "Upload reel & become opponent"}
      </Button>
    </div>
  );

  const renderSide = (
    battle: Battle,
    p: Participant | undefined,
    label: "X" | "Y",
    totalVotes: number,
    canVote: boolean,
    myVote: MyVote | undefined,
    isWinner: boolean,
  ) => {
    if (!p) {
      return (
        <div className="rounded-xl border-2 border-dashed border-border p-6 text-center space-y-2">
          <Video className="h-8 w-8 mx-auto text-muted-foreground/50" />
          <p className="font-semibold">Creator {label} slot open</p>
          <p className="text-xs text-muted-foreground">The next creator who uploads a reel becomes the opponent.</p>
        </div>
      );
    }
    const pct = totalVotes > 0 ? Math.round((p.vote_count / totalVotes) * 100) : 0;
    const votedThis = myVote?.participant_id === p.id;
    return (
      <div className={`rounded-xl border p-3 space-y-3 ${isWinner ? "border-yellow-500/60 bg-yellow-500/5" : "border-primary/20 bg-secondary/20"}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge className="shrink-0">Creator {label}</Badge>
            <p className="font-semibold truncate">{p.reel_title}</p>
          </div>
          {isWinner && <Trophy className="h-5 w-5 text-yellow-500 shrink-0" />}
        </div>
        {p.video_url && (
          <video src={p.video_url} controls playsInline className="w-full rounded-lg bg-black max-h-[60vh]" />
        )}
        {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-primary" />{p.vote_count} votes</span>
            <span className="font-semibold">{pct}%</span>
          </div>
          <Progress value={pct} />
        </div>
        {canVote && p.user_id !== userId && (
          <Button
            className="w-full"
            variant={votedThis ? "default" : "outline"}
            disabled={!!myVote}
            onClick={() => vote(battle.id, p.id)}
          >
            {votedThis
              ? `✓ Voted for Creator ${label}`
              : myVote
                ? "Vote already used"
                : `Vote for Creator ${label}`}
          </Button>
        )}
        {canVote && p.user_id !== userId && myVote && (
          <p className="text-[11px] text-center text-muted-foreground">You have 1 vote per duel — it can't be changed.</p>
        )}
        {p.user_id === userId && (
          <p className="text-xs text-center text-muted-foreground">This is your reel — you can't vote for yourself.</p>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <section className="relative h-[76svh] min-h-[520px] overflow-hidden rounded-2xl bg-black">
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
            src={reelHero.url}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
          <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 pb-8 md:p-10">
            <div className="inline-block self-start mb-3 px-4 py-1.5 bg-primary/30 backdrop-blur-sm rounded-full border border-primary/40">
              <span className="text-white font-semibold text-xs uppercase tracking-wider">
                🎬 Online Reel Battle Platform
              </span>
            </div>
            <h1 className="text-[clamp(2.2rem,11vw,4.5rem)] font-black leading-[1.05] mb-3 max-w-[20ch] bg-gradient-to-br from-white via-primary to-accent bg-clip-text text-transparent drop-shadow-xl">
              Reel Battles
            </h1>
            <p className="text-white/80 text-sm md:text-lg max-w-xl mb-3 leading-relaxed">
              Two creators upload reel videos. Each pays 100 Battle Coins (1 AI credit), the winner takes 80% of the pot + 10 XP — voting is free for every registered Unique user, 1 vote per duel. Coins are bought with AI credits (1 credit = 100 coins) and spent on cosmetics only.
            </p>
          </div>
        </section>

        {/* How it works */}
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-5 w-5 text-primary" /> How Reel Battles work
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="flex items-start gap-3 p-3 rounded-xl border border-primary/20 bg-secondary/20">
                <Coins className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">100 Battle Coins entry</p>
                  <p className="text-xs text-muted-foreground">Both the starter and the opponent pay 100 Battle Coins (1 AI credit) to compete.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl border border-primary/20 bg-secondary/20">
                <Video className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Creator X vs Creator Y</p>
                  <p className="text-xs text-muted-foreground">Two reels are paired one under the other.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl border border-primary/20 bg-secondary/20">
                <Users className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Free voting</p>
                  <p className="text-xs text-muted-foreground">Every registered Unique user gets exactly 1 free vote per duel.</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 rounded-xl border border-primary/20 bg-secondary/20">
                <Trophy className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">160 coins + 10 XP</p>
                  <p className="text-xs text-muted-foreground">The winning creator takes the whole coin pot plus 10 XP.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/20 bg-secondary/20 p-3">
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Battle Coins: {balance.toLocaleString()}</span>
              </div>
              <div className="flex items-center gap-2">
                <Flame className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">Reel XP: {hubXP}</span>
              </div>
              <div className="flex items-center gap-2">
                <Trophy className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Total XP: {userXP}</span>
              </div>
            </div>

            {userXP >= 1000 && (
              <Button variant="outline" className="w-full" onClick={convertXP} disabled={busy}>
                <RefreshCw className="h-4 w-4 mr-2" /> Convert 1 000 XP to 1 credit
              </Button>
            )}
          </CardContent>
        </Card>

        <BattleCoinsWallet accent="primary" module="reel_battles" />

        <BattleCosmeticsShop coins={balance} module="reel_battles" />

        <MonthlyChampionRewardsCard module="reel_battles" accent="primary" />

        <ReelBattlesLeaderboard currentUserId={userId} />

        {/* Public duel directory — tap any duel to open it */}
        {!loading && battles.length > 0 && (
          selectedId ? (
            <Button variant="outline" className="w-full" onClick={() => closeCompetition()}>
              ← Back to all reel duels
            </Button>
          ) : (
            <Card className="border-primary/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Trophy className="h-5 w-5 text-primary" /> All reel duels ({battles.length})
                </CardTitle>
                <p className="text-xs text-muted-foreground">Tap a duel to open it and vote for free.</p>
              </CardHeader>
              <CardContent className="space-y-2">
                {battles.map(b => {
                  const parts = participants[b.id] || [];
                  const votes = parts.reduce((s, p) => s + (p.vote_count || 0), 0);
                  const open = b.status === "open" && new Date(b.deadline) > new Date();
                  return (
                    <button
                      key={b.id}
                      onClick={() => openCompetition(b.id)}
                      className="w-full text-left p-3 rounded-xl border border-primary/20 bg-secondary/20 hover:bg-secondary/40 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="flex items-center gap-2 min-w-0 font-semibold">
                          <Film className="h-4 w-4 text-primary shrink-0" />
                          <span className="truncate">{b.theme}</span>
                        </span>
                        <Badge variant={open ? "default" : "secondary"} className="shrink-0">{open ? "OPEN" : "CLOSED"}</Badge>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {parts.length}/2 creators · {votes} votes · deadline {new Date(b.deadline).toLocaleDateString()}
                      </p>
                    </button>
                  );
                })}
              </CardContent>
            </Card>
          )
        )}

        {formFor === "new" ? videoForm("new") : (
          <Button size="lg" onClick={() => { setFormFor("new"); setReelTitle(""); setReelDesc(""); setReelFile(null); }} className="w-full">
            <Plus className="h-4 w-4 mr-2" /> Start Reel Duel
          </Button>
        )}

        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : battles.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No reel duels yet. Be the first creator!</CardContent></Card>
        ) : (
          visibleBattles.map(battle => {
            const parts = (participants[battle.id] || []).slice(0, 2);
            const [a, b] = parts;
            const allComments = comments[battle.id] || [];
            const myEntry = parts.find(p => p.user_id === userId);
            const isOpen = battle.status === "open" && new Date(battle.deadline) > new Date();
            const myVote = myVotes[battle.id];
            const showCs = showComments[battle.id];
            const totalVotes = (a?.vote_count || 0) + (b?.vote_count || 0);
            const bothIn = !!a && !!b;
            const canVote = isOpen && bothIn;
            const winnerId = !a || !b || totalVotes === 0
              ? null
              : (a.vote_count === b.vote_count ? null : (a.vote_count > b.vote_count ? a.id : b.id));

            return (
              <Card key={battle.id} className="border-primary/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                    <span className="flex items-center gap-2 min-w-0"><Film className="h-5 w-5 text-primary shrink-0" /> <span className="truncate">{battle.theme}</span></span>
                    <div className="flex items-center gap-2">
                      <Badge variant={myEntry ? "default" : "outline"} className={myEntry ? "bg-green-600 hover:bg-green-700" : "text-muted-foreground"}>
                        {myEntry ? "✓ You're in" : `${parts.length}/2 creators`}
                      </Badge>
                      <Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "OPEN" : "CLOSED"}</Badge>
                    </div>
                  </CardTitle>
                  {battle.description && <p className="text-sm text-muted-foreground">{battle.description}</p>}
                  <p className="text-xs text-muted-foreground">Deadline: {new Date(battle.deadline).toLocaleString()} · {totalVotes} total votes</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {renderSide(battle, a, "X", totalVotes, canVote, myVote, winnerId === a?.id)}

                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="flex items-center gap-1 font-black text-lg text-primary">
                      <Swords className="h-5 w-5" /> VS
                    </span>
                    <div className="h-px flex-1 bg-border" />
                  </div>

                  {renderSide(battle, b, "Y", totalVotes, canVote, myVote, winnerId === b?.id)}

                  {isOpen && bothIn && !myVote && (
                    <p className="text-xs text-center text-muted-foreground">Watch both reels, then vote for the better one. One vote per duel.</p>
                  )}

                  {isOpen && !myEntry && parts.length < 2 && (
                    formFor === battle.id ? videoForm(battle.id) : (
                      <Button variant="outline" className="w-full" onClick={() => { setFormFor(battle.id); setReelTitle(""); setReelDesc(""); setReelFile(null); }}>
                        <Video className="h-4 w-4 mr-2" /> Upload your reel & become the opponent
                      </Button>
                    )
                  )}

                  <Button variant="ghost" size="sm" className="w-full"
                    onClick={() => setShowComments(prev => ({ ...prev, [battle.id]: !showCs }))}>
                    <MessageCircle className="h-4 w-4 mr-2" /> {showCs ? "Hide" : "Show"} comments ({allComments.length})
                  </Button>

                  {showCs && (
                    <div className="space-y-2">
                      {allComments.map(c => (
                        <div key={c.id} className="flex items-start justify-between gap-2 text-sm p-2 rounded-lg bg-secondary/30">
                          <p className="break-words">{c.content}</p>
                          {c.user_id === userId && (
                            <Button size="icon" variant="ghost" className="h-6 w-6 shrink-0" onClick={() => deleteComment(c.id)} aria-label="Delete comment">
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input placeholder="Write a comment..." value={commentDraft[battle.id] || ""} maxLength={500}
                          onChange={e => setCommentDraft(prev => ({ ...prev, [battle.id]: e.target.value }))} />
                        <Button size="icon" onClick={() => postComment(battle.id)} aria-label="Send comment"><Send className="h-4 w-4" /></Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
