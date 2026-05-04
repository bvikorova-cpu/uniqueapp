import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Trophy, ThumbsUp, ThumbsDown, Plus, Flame, MessageCircle, Send, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type Battle = { id: string; theme: string; description: string | null; status: string; deadline: string; prize_pool: number };
type Participant = { id: string; battle_id: string; user_id: string; dish_title: string; description: string | null; image_url: string | null; video_url: string | null; media_type: string | null; vote_count: number; dislike_count: number };
type Comment = { id: string; battle_id: string; participant_id: string | null; user_id: string; content: string; created_at: string };
type MyVote = { participant_id: string; vote_type: string };

export default function KitchenStarsBattles() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [battles, setBattles] = useState<Battle[]>([]);
  const [participants, setParticipants] = useState<Record<string, Participant[]>>({});
  const [comments, setComments] = useState<Record<string, Comment[]>>({});
  const [myVotes, setMyVotes] = useState<Record<string, MyVote>>({});
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [entryFor, setEntryFor] = useState<string | null>(null);
  const [dishTitle, setDishTitle] = useState("");
  const [dishDesc, setDishDesc] = useState("");
  const [dishImage, setDishImage] = useState("");
  const [dishFile, setDishFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const ALLOWED_IMAGE = ["image/jpeg", "image/png", "image/webp"];
  const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];
  const MAX_IMAGE = 8 * 1024 * 1024;   // 8 MB
  const MAX_VIDEO = 50 * 1024 * 1024;  // 50 MB
  const [commentDraft, setCommentDraft] = useState<Record<string, string>>({});
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});

  const load = async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { navigate("/auth"); return; }
    setUserId(session.user.id);

    const { data: bs } = await supabase.from("kitchen_battles")
      .select("*").order("created_at", { ascending: false }).limit(20);
    setBattles(bs || []);

    if (bs && bs.length) {
      const ids = bs.map(b => b.id);
      const [{ data: ps }, { data: cs }, { data: vs }] = await Promise.all([
        supabase.from("kitchen_battle_participants").select("*").in("battle_id", ids),
        supabase.from("kitchen_battle_comments").select("*").in("battle_id", ids).order("created_at", { ascending: true }),
        supabase.from("kitchen_battle_votes").select("battle_id, participant_id, vote_type").eq("voter_id", session.user.id).in("battle_id", ids),
      ]);

      const grouped: Record<string, Participant[]> = {};
      (ps || []).forEach((p: any) => {
        grouped[p.battle_id] = grouped[p.battle_id] || [];
        grouped[p.battle_id].push(p);
      });
      Object.values(grouped).forEach(arr => arr.sort((a, b) => (b.vote_count - b.dislike_count) - (a.vote_count - a.dislike_count)));
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

  const createBattle = async () => {
    setCreating(true);
    const { data, error } = await supabase.functions.invoke("create-kitchen-battle", { body: {} });
    setCreating(false);
    if (error || data?.error) {
      toast({ title: "Error", description: error?.message || data?.error, variant: "destructive" });
      return;
    }
    toast({ title: "Battle created!" });
    load();
  };

  const formatBytes = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`;

  const validateFile = (file: File):
    | { ok: true; type: "image" | "video" }
    | { ok: false; title: string; reason: string; suggestion: string } => {
    const isImage = ALLOWED_IMAGE.includes(file.type);
    const isVideo = ALLOWED_VIDEO.includes(file.type);
    const ext = file.name.split(".").pop()?.toUpperCase() || "unknown";

    if (!isImage && !isVideo) {
      const looksLikeImage = file.type.startsWith("image/");
      const looksLikeVideo = file.type.startsWith("video/");
      return {
        ok: false,
        title: "Unsupported file format",
        reason: looksLikeImage
          ? `Image type ${file.type} (${ext}) is not allowed.`
          : looksLikeVideo
          ? `Video type ${file.type} (${ext}) is not allowed.`
          : `File "${file.name}" has type "${file.type || "unknown"}", which is neither image nor video.`,
        suggestion: looksLikeImage
          ? "Convert to JPG, PNG or WEBP before uploading."
          : looksLikeVideo
          ? "Convert to MP4, WEBM or MOV (H.264) before uploading."
          : "Upload an image (JPG/PNG/WEBP, ≤8 MB) or a video (MP4/WEBM/MOV, ≤50 MB).",
      };
    }

    const max = isImage ? MAX_IMAGE : MAX_VIDEO;
    if (file.size > max) {
      const overBy = file.size - max;
      return {
        ok: false,
        title: isImage ? "Image too large" : "Video too large",
        reason: `Your ${isImage ? "image" : "video"} is ${formatBytes(file.size)} — that's ${formatBytes(overBy)} over the ${isImage ? "8 MB" : "50 MB"} limit.`,
        suggestion: isImage
          ? "Compress with squoosh.app or tinypng.com, or resize to ≤2000px on the long edge."
          : "Trim length, lower resolution to 720p, or re-encode at a lower bitrate (e.g. with HandBrake).",
      };
    }

    if (file.size === 0) {
      return { ok: false, title: "Empty file", reason: "The selected file is 0 bytes.", suggestion: "Pick a different file and try again." };
    }

    return { ok: true, type: isImage ? "image" : "video" };
  };

  const submitEntry = async (battleId: string) => {
    // Hard limit: one entry per user per battle
    const existing = (participants[battleId] || []).find(p => p.user_id === userId);
    if (existing) {
      toast({
        title: "You already entered this battle",
        description: `Your dish "${existing.dish_title}" is already submitted. Each chef can submit only ONE dish per battle to keep voting fair. Wait for the next battle to compete again.`,
        variant: "destructive",
      });
      setEntryFor(null);
      return;
    }

    if (!dishTitle.trim() || dishTitle.length > 120) {
      toast({ title: "Dish title required (max 120 chars)", variant: "destructive" }); return;
    }
    if (dishDesc.length > 500) {
      toast({ title: "Description too long (max 500)", variant: "destructive" }); return;
    }

    let imageUrl: string | null = dishImage || null;
    let videoUrl: string | null = null;
    let mediaType: "image" | "video" | null = null;
    let mediaSize: number | null = null;
    let mediaMime: string | null = null;

    if (dishFile) {
      const v = validateFile(dishFile);
      if (v.ok === false) {
        toast({ title: v.title, description: `${v.reason} ${v.suggestion}`, variant: "destructive" });
        return;
      }
      setUploading(true);
      const ext = dishFile.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${userId}/${battleId}/${crypto.randomUUID()}.${ext}`;
      const { error: ue } = await supabase.storage.from("kitchen-battles")
        .upload(path, dishFile, { contentType: dishFile.type, upsert: false });
      if (ue) {
        setUploading(false);
        const msg = /exceeded|too large|payload/i.test(ue.message)
          ? "Server rejected the file (too large for the storage bucket). Try a smaller file."
          : /duplicate|already exists/i.test(ue.message)
          ? "A file with this name already exists. Try renaming and re-uploading."
          : ue.message;
        toast({ title: "Upload failed", description: msg, variant: "destructive" });
        return;
      }
      const { data: pub } = supabase.storage.from("kitchen-battles").getPublicUrl(path);
      mediaType = v.type; mediaSize = dishFile.size; mediaMime = dishFile.type;
      if (v.type === "image") imageUrl = pub.publicUrl;
      else videoUrl = pub.publicUrl;
      setUploading(false);
    }

    const { error } = await supabase.from("kitchen_battle_participants").insert({
      battle_id: battleId, user_id: userId, dish_title: dishTitle.trim(),
      description: dishDesc.trim() || null, image_url: imageUrl, video_url: videoUrl,
      media_type: mediaType, media_size: mediaSize, media_mime: mediaMime,
    });
    if (error) {
      const isDup = (error as any).code === "23505" || /duplicate|unique/i.test(error.message);
      toast({
        title: isDup ? "You already entered this battle" : "Error",
        description: isDup
          ? "Each chef can submit only ONE dish per battle. Refresh to see your existing entry."
          : error.message,
        variant: "destructive",
      });
      if (isDup) { setEntryFor(null); load(); }
      return;
    }
    setEntryFor(null); setDishTitle(""); setDishDesc(""); setDishImage(""); setDishFile(null);
    toast({ title: "Entry submitted!" });
    load();
  };

  const vote = async (battleId: string, participantId: string, voteType: "like" | "dislike") => {
    const { data, error } = await supabase.functions.invoke("kitchen-battle-vote", {
      body: { battleId, participantId, voteType },
    });
    if (error || data?.error) {
      toast({ title: "Vote failed", description: error?.message || data?.error, variant: "destructive" });
      return;
    }
    toast({ title: voteType === "like" ? "👍 Liked!" : "👎 Disliked" });
    load();
  };

  const postComment = async (battleId: string, participantId?: string) => {
    const key = `${battleId}:${participantId || ""}`;
    const content = (commentDraft[key] || "").trim();
    if (!content) return;
    const { error } = await supabase.from("kitchen_battle_comments").insert({
      battle_id: battleId, participant_id: participantId || null, user_id: userId, content,
    });
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    setCommentDraft(prev => ({ ...prev, [key]: "" }));
    load();
  };

  const deleteComment = async (id: string) => {
    const { error } = await supabase.from("kitchen_battle_comments").delete().eq("id", id);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }
    load();
  };

  return (
    <div className="min-h-screen bg-background pt-20 pb-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        <Button variant="ghost" onClick={() => navigate("/masterchef")}>← Back</Button>

        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-black bg-gradient-to-r from-orange-500 via-primary to-accent bg-clip-text text-transparent mb-2">
            KitchenStars Battles
          </h1>
          <p className="text-muted-foreground text-lg">Submit your dish, get votes, win the crown 👑</p>
        </div>

        <Button size="lg" onClick={createBattle} disabled={creating} className="w-full">
          <Plus className="h-4 w-4 mr-2" /> {creating ? "Creating..." : "Start a New Battle"}
        </Button>

        {loading ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : battles.length === 0 ? (
          <Card><CardContent className="py-10 text-center text-muted-foreground">No battles yet. Be the first!</CardContent></Card>
        ) : (
          battles.map(battle => {
            const parts = participants[battle.id] || [];
            const allComments = comments[battle.id] || [];
            const myEntry = parts.find(p => p.user_id === userId);
            const isOpen = battle.status === "open" && new Date(battle.deadline) > new Date();
            const myVote = myVotes[battle.id];
            const showCs = showComments[battle.id];
            return (
              <Card key={battle.id} className="border-orange-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2"><ChefHat className="h-5 w-5 text-orange-500" /> {battle.theme}</span>
                    <Badge variant={isOpen ? "default" : "secondary"}>{isOpen ? "OPEN" : "CLOSED"}</Badge>
                  </CardTitle>
                  {battle.description && <p className="text-sm text-muted-foreground">{battle.description}</p>}
                  <p className="text-xs text-muted-foreground">Deadline: {new Date(battle.deadline).toLocaleString()}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {parts.length === 0 && <p className="text-sm text-muted-foreground italic">No entries yet.</p>}
                  {parts.map((p, i) => {
                    const liked = myVote?.participant_id === p.id && myVote.vote_type === "like";
                    const disliked = myVote?.participant_id === p.id && myVote.vote_type === "dislike";
                    const score = p.vote_count - p.dislike_count;
                    return (
                      <div key={p.id} className="p-3 rounded-lg bg-secondary/30 space-y-2">
                        {p.video_url && (
                          <video src={p.video_url} controls className="w-full max-h-64 rounded" />
                        )}
                        {!p.video_url && p.image_url && (
                          <img src={p.image_url} alt={p.dish_title} loading="lazy" className="w-full max-h-64 object-cover rounded" />
                        )}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-3">
                            {i === 0 && score > 0 && <Trophy className="h-5 w-5 text-yellow-500" />}
                            <div>
                              <p className="font-semibold">{p.dish_title}</p>
                              {p.description && <p className="text-xs text-muted-foreground">{p.description}</p>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline"><Flame className="h-3 w-3 mr-1" />{score}</Badge>
                            {isOpen && p.user_id !== userId && (
                              <>
                                <Button size="sm" variant={liked ? "default" : "outline"} onClick={() => vote(battle.id, p.id, "like")}>
                                  <ThumbsUp className="h-3 w-3 mr-1" /> {p.vote_count}
                                </Button>
                                <Button size="sm" variant={disliked ? "destructive" : "outline"} onClick={() => vote(battle.id, p.id, "dislike")}>
                                  <ThumbsDown className="h-3 w-3 mr-1" /> {p.dislike_count}
                                </Button>
                              </>
                            )}
                            {(!isOpen || p.user_id === userId) && (
                              <>
                                <Badge variant="outline"><ThumbsUp className="h-3 w-3 mr-1" />{p.vote_count}</Badge>
                                <Badge variant="outline"><ThumbsDown className="h-3 w-3 mr-1" />{p.dislike_count}</Badge>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {myEntry && (
                    <div className="p-3 rounded-lg border border-primary/30 bg-primary/5 text-sm">
                      ✅ You've already submitted "<strong>{myEntry.dish_title}</strong>" to this battle. Only one entry per chef is allowed.
                    </div>
                  )}
                  {isOpen && !myEntry && (
                    entryFor === battle.id ? (
                      <div className="space-y-2 p-3 rounded-lg border border-primary/20">
                        <Input placeholder="Dish title" value={dishTitle} onChange={e => setDishTitle(e.target.value)} />
                        <Textarea placeholder="Short description (optional)" value={dishDesc} onChange={e => setDishDesc(e.target.value)} />
                        <Input placeholder="Image URL (optional)" value={dishImage} onChange={e => setDishImage(e.target.value)} />
                        <div className="space-y-1">
                          <label className="text-xs text-muted-foreground">Or upload image (≤8MB JPG/PNG/WEBP) or video (≤50MB MP4/WEBM/MOV)</label>
                          <Input type="file" accept="image/jpeg,image/png,image/webp,video/mp4,video/webm,video/quicktime"
                            onChange={e => {
                              const f = e.target.files?.[0] || null;
                              if (f) {
                                const v = validateFile(f);
                                if (v.ok === false) {
                                  toast({ title: v.title, description: `${v.reason} ${v.suggestion}`, variant: "destructive" });
                                  e.target.value = "";
                                  setDishFile(null);
                                  return;
                                }
                              }
                              setDishFile(f);
                            }} />
                          {dishFile && <p className="text-xs text-muted-foreground">{dishFile.name} ({(dishFile.size/1024/1024).toFixed(2)} MB)</p>}
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => submitEntry(battle.id)} disabled={uploading}>{uploading ? "Uploading..." : "Submit"}</Button>
                          <Button size="sm" variant="ghost" onClick={() => setEntryFor(null)}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <Button variant="outline" className="w-full" onClick={() => setEntryFor(battle.id)}>
                        <Plus className="h-4 w-4 mr-2" /> Submit Your Dish
                      </Button>
                    )
                  )}

                  <Button variant="ghost" size="sm" className="w-full" onClick={() => setShowComments(s => ({ ...s, [battle.id]: !s[battle.id] }))}>
                    <MessageCircle className="h-4 w-4 mr-2" /> {showCs ? "Hide" : "Show"} Comments ({allComments.length})
                  </Button>

                  {showCs && (
                    <div className="space-y-2 pt-2 border-t border-border">
                      {allComments.length === 0 && <p className="text-xs text-muted-foreground italic">No comments yet.</p>}
                      {allComments.map(c => (
                        <div key={c.id} className="flex items-start justify-between gap-2 p-2 rounded bg-background/50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm">{c.content}</p>
                            <p className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleString()}</p>
                          </div>
                          {c.user_id === userId && (
                            <Button size="icon" variant="ghost" onClick={() => deleteComment(c.id)}>
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Write a comment..."
                          value={commentDraft[`${battle.id}:`] || ""}
                          onChange={e => setCommentDraft(prev => ({ ...prev, [`${battle.id}:`]: e.target.value }))}
                          onKeyDown={e => { if (e.key === "Enter") postComment(battle.id); }}
                        />
                        <Button size="icon" onClick={() => postComment(battle.id)}>
                          <Send className="h-4 w-4" />
                        </Button>
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
