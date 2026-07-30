import { useEffect, useState, useCallback, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Heart, MessageCircle, Share2, Star, PawPrint, Loader2, Trash2, Send, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

type PetPost = {
  id: string;
  user_id: string;
  pet_name: string;
  species: string | null;
  mood: string | null;
  caption: string | null;
  media_url: string | null;
  media_type: string | null;
  score: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
};

type PetComment = { id: string; user_id: string; content: string; created_at: string };

const MOODS = ["Happy", "Playful", "Sleepy", "Hungry", "Anxious", "Curious"];
const MAX_MEDIA_MB = 25;


export default function PetSocialNetwork() {
  const { user } = useAuth();
  const [posts, setPosts] = useState<PetPost[]>([]);
  const [names, setNames] = useState<Record<string, string>>({});
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ pet_name: "", species: "", mood: MOODS[0], caption: "" });

  const [commentsFor, setCommentsFor] = useState<PetPost | null>(null);
  const [comments, setComments] = useState<PetComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentBusy, setCommentBusy] = useState(false);

  const fileRef = useRef<HTMLInputElement>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const pickMedia = (file?: File | null) => {
    if (!file) return;
    if (file.size > MAX_MEDIA_MB * 1024 * 1024) {
      toast.error(`File is too large (max ${MAX_MEDIA_MB} MB)`);
      return;
    }
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error("Only photos and videos are allowed");
      return;
    }
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const clearMedia = () => {
    if (mediaPreview) URL.revokeObjectURL(mediaPreview);
    setMediaFile(null);
    setMediaPreview(null);
    if (fileRef.current) fileRef.current.value = "";
  };


  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("pet_social_posts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      toast.error("Could not load the pet feed");
      setLoading(false);
      return;
    }
    const list = (data ?? []) as PetPost[];
    setPosts(list);

    const userIds = [...new Set(list.map(p => p.user_id))];
    if (userIds.length) {
      const { data: profs } = await (supabase as any)
        .from("profiles_public")
        .select("id, full_name")
        .in("id", userIds);
      const map: Record<string, string> = {};
      (profs ?? []).forEach((p: any) => { map[p.id] = p.full_name || "Pet lover"; });
      setNames(map);
    }

    if (user) {
      const { data: likes } = await supabase
        .from("pet_social_likes")
        .select("post_id")
        .eq("user_id", user.id);
      setLikedIds(new Set((likes ?? []).map((l: any) => l.post_id)));
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const channel = supabase
      .channel("pet-social-feed")
      .on("postgres_changes", { event: "*", schema: "public", table: "pet_social_posts" }, () => load())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [load]);

  const createPost = async () => {
    if (!user) { toast.error("Please sign in to share your pet"); return; }
    if (!form.pet_name.trim()) { toast.error("Pet name is required"); return; }
    setCreating(true);

    let media_url: string | null = null;
    let media_type: string | null = null;

    if (mediaFile) {
      setUploading(true);
      const ext = mediaFile.name.split(".").pop()?.toLowerCase() || "bin";
      const path = `${user.id}/social/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("pet-photos")
        .upload(path, mediaFile, { contentType: mediaFile.type, upsert: false });
      setUploading(false);
      if (upErr) {
        setCreating(false);
        toast.error(`Upload failed: ${upErr.message}`);
        return;
      }
      media_url = supabase.storage.from("pet-photos").getPublicUrl(path).data.publicUrl;
      media_type = mediaFile.type.startsWith("video/") ? "video" : "image";
    }

    const { error } = await supabase.from("pet_social_posts").insert({
      user_id: user.id,
      pet_name: form.pet_name.trim(),
      species: form.species.trim() || null,
      mood: form.mood,
      caption: form.caption.trim() || null,
      media_url,
      media_type,
      score: Math.floor(60 + Math.random() * 41),
    });
    setCreating(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Shared with the community!");
    setForm({ pet_name: "", species: "", mood: MOODS[0], caption: "" });
    clearMedia();
    setOpen(false);
    load();
  };


  const toggleLike = async (post: PetPost) => {
    if (!user) { toast.error("Please sign in to like posts"); return; }
    const liked = likedIds.has(post.id);
    setLikedIds(prev => {
      const next = new Set(prev);
      liked ? next.delete(post.id) : next.add(post.id);
      return next;
    });
    setPosts(prev => prev.map(p => p.id === post.id
      ? { ...p, likes_count: Math.max(0, p.likes_count + (liked ? -1 : 1)) }
      : p));

    const { error } = liked
      ? await supabase.from("pet_social_likes").delete().eq("post_id", post.id).eq("user_id", user.id)
      : await supabase.from("pet_social_likes").insert({ post_id: post.id, user_id: user.id });
    if (error) { toast.error("Could not update like"); load(); }
  };

  const openComments = async (post: PetPost) => {
    setCommentsFor(post);
    setComments([]);
    const { data } = await supabase
      .from("pet_social_comments")
      .select("id, user_id, content, created_at")
      .eq("post_id", post.id)
      .order("created_at", { ascending: true });
    setComments((data ?? []) as PetComment[]);
  };

  const addComment = async () => {
    if (!user) { toast.error("Please sign in to comment"); return; }
    if (!commentsFor || !commentText.trim()) return;
    setCommentBusy(true);
    const { data, error } = await supabase
      .from("pet_social_comments")
      .insert({ post_id: commentsFor.id, user_id: user.id, content: commentText.trim() })
      .select("id, user_id, content, created_at")
      .maybeSingle();
    setCommentBusy(false);
    if (error) { toast.error(error.message); return; }
    if (data) setComments(prev => [...prev, data as PetComment]);
    setCommentText("");
    setPosts(prev => prev.map(p => p.id === commentsFor.id ? { ...p, comments_count: p.comments_count + 1 } : p));
  };

  const deletePost = async (post: PetPost) => {
    const { error } = await supabase.from("pet_social_posts").delete().eq("id", post.id);
    if (error) { toast.error(error.message); return; }
    setPosts(prev => prev.filter(p => p.id !== post.id));
    toast.success("Post removed");
  };

  const sharePost = async (post: PetPost) => {
    const text = `${post.pet_name} is feeling ${post.mood ?? "great"} on Unique Pet Translator!`;
    const url = `${window.location.origin}/pet-translator`;
    try {
      if (navigator.share) {
        await navigator.share({ title: "Pet Social Network", text, url });
      } else {
        await navigator.clipboard.writeText(`${text} ${url}`);
        toast.success("Link copied to clipboard");
      }
    } catch { /* user cancelled */ }
  };

  return (
    <>
      <FloatingHowItWorks title="How Pet Social Network works" steps={[
        { title: 'Share your pet', desc: 'Post your pet\'s name, species and current mood.' },
        { title: 'Browse the feed', desc: 'See what other pets around the world are feeling.' },
        { title: 'React', desc: 'Like, comment and share posts you enjoy.' },
        { title: 'Come back daily', desc: 'The feed updates live as new posts arrive.' },
      ]} />
      <div className="space-y-6">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-xl sm:text-2xl font-black">🌍 Pet Social Network</h2>
          <Button size="sm" className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-xs" onClick={() => setOpen(true)}>
            <PawPrint className="h-3 w-3 mr-1" /> Share Your Pet
          </Button>
        </div>

        {loading ? (
          <div className="flex justify-center py-10"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
        ) : posts.length === 0 ? (
          <Card className="bg-card/80 border-purple-500/10">
            <CardContent className="p-8 text-center text-sm text-muted-foreground">
              No pet posts yet. Be the first to share your pet's mood with the community!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => {
              const author = names[post.user_id] || "Pet lover";
              const liked = likedIds.has(post.id);
              return (
                <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: Math.min(i, 8) * 0.04 }}>
                  <Card className="bg-card/80 border-purple-500/10 hover:border-purple-500/30 transition-all">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-fuchsia-500 flex items-center justify-center text-primary-foreground font-bold text-sm flex-shrink-0">
                          {author.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm">{author}</span>
                            <Badge variant="outline" className="text-[9px]">
                              {new Date(post.created_at).toLocaleDateString()}
                            </Badge>
                            {user?.id === post.user_id && (
                              <button onClick={() => deletePost(post)} className="ml-auto text-muted-foreground hover:text-destructive">
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {post.pet_name}{post.species ? ` · ${post.species}` : ""}
                          </p>
                          {post.caption && <p className="text-sm mt-2 break-words">{post.caption}</p>}
                          <div className="flex items-center gap-2 mt-2 flex-wrap">
                            {post.mood && (
                              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30 text-[10px]">{post.mood}</Badge>
                            )}
                            <Badge variant="outline" className="text-[10px]">
                              <Star className="h-2.5 w-2.5 mr-0.5 text-yellow-500" /> {post.score}/100
                            </Badge>
                          </div>
                          <div className="flex items-center gap-4 mt-3">
                            <button onClick={() => toggleLike(post)}
                              className={`flex items-center gap-1 text-xs transition-colors ${liked ? "text-pink-500" : "text-muted-foreground hover:text-pink-400"}`}>
                              <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} /> {post.likes_count}
                            </button>
                            <button onClick={() => openComments(post)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-blue-400 transition-colors">
                              <MessageCircle className="h-3.5 w-3.5" /> {post.comments_count}
                            </button>
                            <button onClick={() => sharePost(post)}
                              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-purple-400 transition-colors">
                              <Share2 className="h-3.5 w-3.5" /> Share
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Share your pet</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <Input placeholder="Pet name *" value={form.pet_name}
              onChange={e => setForm({ ...form, pet_name: e.target.value })} />
            <Input placeholder="Species (dog, cat, ...)" value={form.species}
              onChange={e => setForm({ ...form, species: e.target.value })} />
            <div className="flex flex-wrap gap-1.5">
              {MOODS.map(m => (
                <button key={m} onClick={() => setForm({ ...form, mood: m })}
                  className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${form.mood === m ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
                  {m}
                </button>
              ))}
            </div>
            <Textarea placeholder="What is your pet up to?" rows={3} value={form.caption}
              onChange={e => setForm({ ...form, caption: e.target.value })} />
          </div>
          <DialogFooter>
            <Button onClick={createPost} disabled={creating} className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600">
              {creating ? <Loader2 className="h-4 w-4 animate-spin mr-1" /> : <PawPrint className="h-4 w-4 mr-1" />}
              Post
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!commentsFor} onOpenChange={o => !o && setCommentsFor(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Comments · {commentsFor?.pet_name}</DialogTitle></DialogHeader>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {comments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No comments yet.</p>
            ) : comments.map(c => (
              <div key={c.id} className="rounded-lg border border-border/40 p-2">
                <p className="text-xs font-semibold">{names[c.user_id] || "Pet lover"}</p>
                <p className="text-sm break-words">{c.content}</p>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input placeholder="Write a comment..." value={commentText}
              onChange={e => setCommentText(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") addComment(); }} />
            <Button onClick={addComment} disabled={commentBusy || !commentText.trim()} size="icon">
              {commentBusy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
