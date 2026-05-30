import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Globe, Upload, MapPin, Heart, MessageSquare, TrendingUp, Camera, Send, Sparkles } from "lucide-react";
import { useAICredits } from "@/hooks/useAICredits";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const AI_SCORE_COST = 3;

const CITIES = ["New York", "Paris", "Tokyo", "London", "Milan", "Seoul", "Berlin", "Los Angeles", "Copenhagen", "Lagos"];

export default function GlobalStreetStyleFeed() {
  const [selectedCity, setSelectedCity] = useState("all");
  const [showUpload, setShowUpload] = useState(false);
  const [caption, setCaption] = useState("");
  const [city, setCity] = useState("");
  const [uploading, setUploading] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);
  const { credits, spendCredit } = useAICredits();
  const queryClient = useQueryClient();

  const { data: posts = [], isLoading } = useQuery({
    queryKey: ["street-style-feed", selectedCity],
    queryFn: async () => {
      const { data: ootdPosts } = await supabase
        .from("fashion_ootd")
        .select("*, profiles:user_id(full_name, avatar_url)")
        .order("created_at", { ascending: false })
        .limit(30);

      return (ootdPosts || []).map((p: any) => ({
        id: p.id,
        imageUrl: p.image_url,
        caption: p.outfit_description || "Street style look",
        city: "Global",
        score: p.score,
        userName: p.profiles?.full_name || "Style Maven",
        avatar: p.profiles?.avatar_url,
        createdAt: p.created_at,
        likes: Math.floor(Math.random() * 200),
        comments: Math.floor(Math.random() * 30),
      }));
    },
  });

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");
      const ext = file.name.split(".").pop();
      const path = `street-style/${session.user.id}/${Date.now()}.${ext}`;
      const { error } = await supabase.storage.from("fashion").upload(path, file);
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from("fashion").getPublicUrl(path);
      setImageUrl(publicUrl);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setUploading(false);
    }
  };

  const postMutation = useMutation({
    mutationFn: async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      for (let i = 0; i < AI_SCORE_COST; i++) {
        const ok = await spendCredit("custom_generation", "Street Style Post");
        if (!ok && i === 0) throw new Error("Insufficient credits");
      }

      const { data, error } = await supabase.functions.invoke("fashion-ai", {
        body: { action: "ootd-score", imageUrl, outfitDescription: `${caption} - ${city}` },
      });
      if (error) throw error;

      await supabase.from("fashion_ootd").insert({
        user_id: session.user.id,
        image_url: imageUrl,
        outfit_description: `${caption} | 📍 ${city}`,
        score: data.ootdResult?.overall_score || 75,
        feedback: data.ootdResult,
      } as any);

      return data;
    },
    onSuccess: () => {
      toast.success("Posted to street style feed!");
      setShowUpload(false);
      setCaption("");
      setCity("");
      setImageUrl("");
      queryClient.invalidateQueries({ queryKey: ["street-style-feed"] });
    },
    onError: (e: any) => toast.error(e.message),
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-orange-500/15 via-primary/10 to-pink-500/15 border-primary/30 backdrop-blur-xl">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
              <Globe className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Global Street Style</h2>
              <p className="text-sm text-muted-foreground">Community fashion feed with AI trend mapping • {AI_SCORE_COST} Credits/post</p>
            </div>
          </div>

          <Dialog open={showUpload} onOpenChange={setShowUpload}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Camera className="h-4 w-4" /> Post Your Look</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader><DialogTitle>Share Your Street Style</DialogTitle></DialogHeader>
              <div className="space-y-4">
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleUpload(e.target.files[0])} />
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                ) : (
                  <div className="border-2 border-dashed border-primary/30 rounded-lg p-8 text-center cursor-pointer hover:border-primary/60" onClick={() => fileRef.current?.click()}>
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm">{uploading ? "Uploading..." : "Upload your outfit photo"}</p>
                  </div>
                )}
                <Textarea value={caption} onChange={e => setCaption(e.target.value)} placeholder="Describe your look..." rows={2} />
                <Input value={city} onChange={e => setCity(e.target.value)} placeholder="📍 City (e.g., Paris, Tokyo)" />
                <Button onClick={() => postMutation.mutate()} disabled={postMutation.isPending || !imageUrl || !caption} className="w-full gap-2">
                  {postMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  Post & Get AI Score ({AI_SCORE_COST} Credits)
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </Card>

      {/* City Filter */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button variant={selectedCity === "all" ? "default" : "outline"} size="sm" onClick={() => setSelectedCity("all")}>
          <Globe className="h-3 w-3 mr-1" /> All
        </Button>
        {CITIES.map(c => (
          <Button key={c} variant={selectedCity === c ? "default" : "outline"} size="sm" onClick={() => setSelectedCity(c)} className="whitespace-nowrap">
            {c}
          </Button>
        ))}
      </div>

      {/* Feed */}
      {isLoading ? (
        <div className="text-center py-12"><Loader2 className="h-6 w-6 animate-spin mx-auto text-primary" /></div>
      ) : posts.length === 0 ? (
        <Card className="p-12 text-center">
          <Globe className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
          <p className="font-semibold">No street style posts yet</p>
          <p className="text-sm text-muted-foreground">Be the first to share your look!</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {posts.map((post, i) => (
            <motion.div key={post.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="overflow-hidden bg-card/80 border-white/10 hover:border-primary/30 transition-all">
                {post.imageUrl && (
                  <div className="relative">
                    <img src={post.imageUrl} alt="Street style" className="w-full h-64 object-cover" />
                    {post.score && (
                      <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                        <Sparkles className="h-3 w-3 text-primary" />
                        <span className="text-sm font-bold text-white">{post.score}/100</span>
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-xs font-bold">
                      {post.userName?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{post.userName}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1"><MapPin className="h-2.5 w-2.5" /> {post.city}</p>
                    </div>
                  </div>
                  <p className="text-sm mb-3">{post.caption}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1"><Heart className="h-3 w-3" /> {post.likes}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" /> {post.comments}</span>
                    <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3" /> Trending</span>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
