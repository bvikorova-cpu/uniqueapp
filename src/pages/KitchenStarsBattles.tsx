import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Trophy, Plus, Flame, MessageCircle, Send, Trash2, Video, Swords, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DropZone, type DropZoneValidation } from "@/components/kitchen-battles/DropZone";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useMasterChefAccess, KITCHENSTARS_COSTS } from "@/hooks/useMasterChefAccess";
import masterchefHero from "@/assets/masterchef-hero-v2.mp4.asset.json";

type Battle = { id: string; theme: string; description: string | null; status: string; deadline: string; created_by: string | null };
type Participant = { id: string; battle_id: string; user_id: string; dish_title: string; description: string | null; image_url: string | null; video_url: string | null; media_type: string | null; vote_count: number };
type Comment = { id: string; battle_id: string; participant_id: string | null; user_id: string; content: string; created_at: string };
type MyVote = { participant_id: string; vote_type: string };

const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_VIDEO = 50 * 1024 * 1024; // 50 MB

export default function KitchenStarsCompetitions() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { balance, refresh: refreshCredits } = useMasterChefAccess();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [participants, setParticipants] = useState<Record<string, Participant[]>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [myVotes, setMyVotes] = useState<Record<string, MyVote>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  /** null = closed, "new" = start a competition, "<battleId>" = join as opponent */
  const [formFor, setFormFor] = useState<string | null>(null);
  const [dishTitle, setDishTitle] = useState("");
  const [dishDesc, setDishDesc] = useState("");
  const [dishFile, setDishFile] = useState<File | null>(null);
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    setUserId(session.user.id);

    const { data: bs } = await supabase.from("kitchen_battles")
      .select("id, theme, description, status, deadline, created_by")
      .order("created_at", { ascending: false }).limit(30);
    setBattles(bs || []);

    if (bs && bs.length) {
      const ids = bs.map(b => b.id);
      const [{ data: ps }, { data: cs }, { data: vs }] = await Promise.all([
        supabase.from("kitchen_battle_participants").select("*").in("battle_id", ids).order("created_at", { ascending: true }),
        supabase.from("kitchen_battle_comments").select("*").in("battle_id", ids).order("created_at", { ascending: true }),
        supabase.from("kitchen_battle_votes").select("battle_id, participant_id, vote_type").eq("voter_id", session.user.id).in("battle_id", ids),
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
    if (!ALLOWED_VIDEO.includes(file.type)) {
      return { ok: false, title: "Video required", reason: `"${file.name}" is not a supported video format.`, suggestion: "Upload MP4, WEBM or MOV, max 50 MB." };
    }
    if (file.size > MAX_VIDEO) {
      return { ok: false, title: "Video too large", reason: `Your video is ${formatBytes(file.size)} — the limit is 50 MB.`, suggestion: "Trim it or re-encode at 720p." };
    }
    if (file.size === 0) {
      return { ok: false, title: "Empty file", reason: "The selected file is 0 bytes.", suggestion: "Pick another video and try again." };
    }
    return { ok: true, type: "video" };
  };

  const resetForm = () => { setFormFor(null); setDishTitle(""); setDishDesc(""); setDishFile(null); };

  /** Uploads the cooking video and returns its public URL and storage path. */
  const uploadVideo = async (battleId: string, file: File): Promise<{ url: string; path: string } | null> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const path = `${userId}/${battleId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("kitchen-battles")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    return { url: supabase.storage.from("kitchen-battles").getPublicUrl(path).data.publicUrl, path };
  };

  const registerPaidEntry = async (battleId: string, file: File, videoUrl: string) => {
    const { data, error } = await supabase.rpc("enter_kitchen_competition", {
      _battle_id: battleId,
      _dish_title: dishTitle.trim(),
      _description: dishDesc.trim(),
      _video_url: videoUrl,
      _media_size: file.size,
      _media_mime: file.type,
    });
    if (error) {
      const insufficient = error.message.includes("INSUFFICIENT_CREDITS");
      toast({
        title: insufficient ? "Not enough credits" : "Could not enter the competition",
        description: insufficient
          ? `Entry costs ${KITCHENSTARS_COSTS.competition_entry} credits — you have ${balance}.`
          : error.message,
        variant: "destructive",
      });
      return false;
    }
    await refreshCredits();
    window.dispatchEvent(new Event("ai-credits-updated"));
    return Boolean(data);
  };

  /** Validates the shared video form. */
  const validateForm = (): File | null => {
    if (!dishTitle.trim() || dishTitle.length > 120) {
      toast({ title: "Dish title required (max 120 characters)", variant: "destructive" }); return null;
    }
    if (dishDesc.length > 500) {
      toast({ title: "Description too long (max 500 characters)", variant: "destructive" }); return null;
    }
    if (!dishFile) {
      toast({ title: "Cooking video required", description: "Upload a video of you cooking the dish.", variant: "destructive" }); return null;
    }
    const v = validateFile(dishFile);
    if (v.ok === false) { toast({ title: v.title, description: `${v.reason} ${v.suggestion}`, variant: "destructive" }); return null; }
    return dishFile;
  };

  /** Start a competition: creates the competition and uploads the first video. */
  const startCompetition = async () => {
    const file = validateForm();
    if (!file || !userId) return;

    if (balance < KITCHENSTARS_COSTS.competition_entry) {
      toast({ title: "Not enough credits", description: `Entry costs ${KITCHENSTARS_COSTS.competition_entry} credits — you have ${balance}.`, variant: "destructive" });
      return;
    }

    setBusy(true);
    const { data: battle, error: be } = await supabase.from("kitchen_battles")
      .insert({ theme: dishTitle.trim(), description: dishDesc.trim() || null, created_by: userId })
      .select("id").single();
    if (be || !battle) {
      setBusy(false);
      toast({ title: "Could not start the competition", description: be?.message, variant: "destructive" });
      return;
    }

    const upload = await uploadVideo(battle.id, file);
    if (!upload) { setBusy(false); return; }
    const registered = await registerPaidEntry(battle.id, file, upload.url);
    setBusy(false);
    if (!registered) {
      await Promise.all([
        supabase.storage.from("kitchen-battles").remove([upload.path]),
        supabase.from("kitchen_battles").delete().eq("id", battle.id).eq("created_by", userId),
      ]);
      return;
    }

    resetForm();
    toast({ title: "Competition started!", description: "The next chef who uploads a video becomes your opponent." });
    load();
  };

  /** Join an open competition as the opponent. */
  const joinCompetition = async (battleId: string) => {
    const parts = participants[battleId] || [];
    if (parts.find(p => p.user_id === userId)) {
      toast({ title: "You are already in this competition", variant: "destructive" }); resetForm(); return;
    }
    if (parts.length >= 2) {
      toast({ title: "Competition is full", description: "Start your own competition instead.", variant: "destructive" });
      resetForm(); load(); return;
    }
    const file = validateForm();
    if (!file || !userId) return;

    if (balance < KITCHENSTARS_COSTS.competition_entry) {
      toast({ title: "Not enough credits", description: `Entry costs ${KITCHENSTARS_COSTS.competition_entry} credits — you have ${balance}.`, variant: "destructive" });
      return;
    }

    setBusy(true);
    const upload = await uploadVideo(battleId, file);
    if (!upload) { setBusy(false); return; }
    const registered = await registerPaidEntry(battleId, file, upload.url);
    setBusy(false);
    if (!registered) {
      await supabase.storage.from("kitchen-battles").remove([upload.path]);
      return;
    }

    resetForm();
    toast({ title: "You are the opponent!", description: "Both videos are live — voting is open." });
    load();
  };

  const vote = async (battleId: string, participantId: string) => {
    if (myVotes[battleId]) {
      toast({ title: "Vote already used", description: "You have exactly 1 vote per duel and it can't be changed.", variant: "destructive" });
      return;
    }
    const { data, error } = await supabase.functions.invoke("kitchen-battle-vote", {
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
    const { error } = await supabase.from("kitchen_battle_comments").insert({ battle_id: battleId, participant_id: null, user_id: userId, content });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setCommentDraft(prev => ({ ...prev, [battleId]: "" }));
    load();
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from("kitchen_battle_comments").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    load();
  };

  const videoForm = (mode: "new" | string) => (
    <div className="space-y-3 p-4 rounded-xl border border-primary/30 bg-secondary/20">
      <div className="flex items-center justify-between">
        <p className="font-semibold flex items-center gap-2">
          <Video className="h-4 w-4 text-orange-500" />
          {mode === "new" ? "Start a competition" : "Upload your video as the opponent"}
        </p>
        <Button size="icon" variant="ghost" onClick={resetForm} aria-label="Close form"><X className="h-4 w-4" /></Button>
      </div>
      <Input placeholder="Dish name (e.g. Truffle risotto)" value={dishTitle} maxLength={120}
        onChange={e => setDishTitle(e.target.value)} />
      <Textarea placeholder="Short description of your dish (optional)" value={dishDesc} maxLength={500}
        onChange={e => setDishDesc(e.target.value)} rows={3} />
      <DropZone file={dishFile} onChange={setDishFile} validate={validateFile} accept="video/mp4,video/webm,video/quicktime" hint="Cooking video: MP4 / WEBM / MOV, max 50 MB" />
      <p className="text-xs text-muted-foreground">
        Cooking video only — MP4 / WEBM / MOV, max 50 MB. Entry costs {KITCHENSTARS_COSTS.competition_entry} credits (you have {balance}).
      </p>
      <Button className="w-full" disabled={busy}
        onClick={() => mode === "new" ? startCompetition() : joinCompetition(mode)}>
        {busy ? "Uploading..." : mode === "new" ? "Create competition & upload video" : "Upload video & become opponent"}
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
          <p className="font-semibold">Chef {label} slot open</p>
          <p className="text-xs text-muted-foreground">The next chef who uploads a cooking video becomes the opponent.</p>
        </div>
      );
    }
    const pct = totalVotes > 0 ? Math.round((p.vote_count / totalVotes) * 100) : 0;
    const votedThis = myVote?.participant_id === p.id;
    return (
      <div className={`rounded-xl border p-3 space-y-3 ${isWinner ? "border-yellow-500/60 bg-yellow-500/5" : "border-primary/20 bg-secondary/20"}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <Badge className="bg-orange-600 hover:bg-orange-700 shrink-0">Chef {label}</Badge>
            <p className="font-semibold truncate">{p.dish_title}</p>
          </div>
          {isWinner && <Trophy className="h-5 w-5 text-yellow-500 shrink-0" />}
        </div>
        {p.video_url ? (
          <video src={p.video_url} controls playsInline className="w-full rounded-lg bg-black max-h-[60vh]" />
        ) : p.image_url ? (
          <img src={p.image_url} alt={p.dish_title} loading="lazy" className="w-full rounded-lg object-cover max-h-72" />
        ) : null}
        {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-1"><Flame className="h-3.5 w-3.5 text-orange-500" />{p.vote_count} votes</span>
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
              ? `✓ Voted for Chef ${label}`
              : myVote
                ? "Vote already used"
                : `Vote for Chef ${label}`}
          </Button>
        )}
        {canVote && p.user_id !== userId && myVote && (
          <p className="text-[11px] text-center text-muted-foreground">You have 1 vote per duel — it can't be changed.</p>
        )}
        {p.user_id === userId && (
          <p className="text-xs text-center text-muted-foreground">This is your entry — you can't vote for yourself.</p>
        )}

      </div>
    );
  };

  return (
    <>
      <FloatingHowItWorks
        title="How KitchenStars Competitions work"
        steps={[
          { title: "Start a competition", desc: `Tap "Start Competition", fill the form and upload your cooking video (${KITCHENSTARS_COSTS.competition_entry} credits).` },
          { title: "An opponent joins", desc: "The next chef who uploads a cooking video to your competition becomes your opponent." },
          { title: "X vs Y", desc: "Both videos appear one under the other as Chef X vs Chef Y." },
          { title: "Everyone votes", desc: "All platform users watch both videos and cast one vote per competition. The highest share wins the crown." },
        ]}
      />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <section className="relative h-[76svh] min-h-[520px] overflow-hidden rounded-2xl bg-black">
            <video
              autoPlay
              loop
              muted
              playsInline
              className="absolute inset-0 w-full h-full object-cover"
              src={masterchefHero.url}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-black/20" />
            <div className="absolute inset-0 z-10 flex flex-col justify-end p-4 pb-8 md:p-10">
              <div className="inline-block self-start mb-3 px-4 py-1.5 bg-orange-500/30 backdrop-blur-sm rounded-full border border-orange-400/40">
                <span className="text-orange-300 font-semibold text-xs uppercase tracking-wider">
                  🔥 Online Cooking Competition Platform
                </span>
              </div>
              <h1 className="text-[clamp(2.2rem,11vw,4.5rem)] font-black leading-[1.05] mb-3 max-w-[20ch] bg-gradient-to-br from-white via-orange-300 to-orange-500 bg-clip-text text-transparent drop-shadow-xl">
                KitchenStars Arena
              </h1>
              <p className="text-white/80 text-sm md:text-lg max-w-xl mb-3 leading-relaxed">
                Two chefs upload cooking videos. Each pays 5 credits, the platform votes, and the winner receives all 10 credits.
              </p>
            </div>
          </section>


          {formFor === "new" ? videoForm("new") : (
            <div className="space-y-2">
            <Button size="lg" onClick={() => { setFormFor("new"); setDishTitle(""); setDishDesc(""); setDishFile(null); }} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Start Competition
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/masterchef/duel-upload")} className="w-full">
              <Swords className="h-4 w-4 mr-2" /> Upload both duel videos (Chef X vs Chef Y)
            </Button>
            </div>
          )}

          {loading ? (
            <p className="text-center text-muted-foreground">Loading...</p>
          ) : battles.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">No competitions yet. Be the first chef!</CardContent></Card>
          ) : (
            battles.map(battle => {
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
              const winnerId = !bothIn || totalVotes === 0 ? null
                : (a!.vote_count === b!.vote_count ? null : (a!.vote_count > b!.vote_count ? a!.id : b!.id));

              return (
                <Card key={battle.id} className="border-orange-500/20">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2 flex-wrap">
                      <span className="flex items-center gap-2 min-w-0"><ChefHat className="h-5 w-5 text-orange-500 shrink-0" /> <span className="truncate">{battle.theme}</span></span>
                      <div className="flex items-center gap-2">
                        <Badge variant={myEntry ? "default" : "outline"} className={myEntry ? "bg-green-600 hover:bg-green-700" : "text-muted-foreground"}>
                          {myEntry ? "✓ You're in" : `${parts.length}/2 chefs`}
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
                      <span className="flex items-center gap-1 font-black text-lg text-orange-500">
                        <Swords className="h-5 w-5" /> VS
                      </span>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {renderSide(battle, b, "Y", totalVotes, canVote, myVote, winnerId === b?.id)}

                    {isOpen && bothIn && !myVote && (
                      <p className="text-xs text-center text-muted-foreground">Watch both videos, then vote for the better dish. One vote per competition.</p>
                    )}

                    {isOpen && !myEntry && parts.length < 2 && (
                      formFor === battle.id ? videoForm(battle.id) : (
                        <Button variant="outline" className="w-full" onClick={() => { setFormFor(battle.id); setDishTitle(""); setDishDesc(""); setDishFile(null); }}>
                          <Video className="h-4 w-4 mr-2" /> Upload your video & become the opponent
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
    </>
  );
}
