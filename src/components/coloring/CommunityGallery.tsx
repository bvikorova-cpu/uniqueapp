import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Heart, Upload, Users, Eye, Loader2, Image as ImageIcon, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export function CommunityGallery() {
  const queryClient = useQueryClient();
  const [shareTitle, setShareTitle] = useState("");
  const [shareFile, setShareFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const { data: galleryItems, isLoading } = useQuery({
    queryKey: ["coloring-community-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("coloring_community_gallery")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    },
  });

  const { data: myLikes } = useQuery({
    queryKey: ["coloring-my-likes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("coloring_gallery_likes")
        .select("gallery_item_id")
        .eq("user_id", user.id);
      return data?.map((l) => l.gallery_item_id) || [];
    },
  });

  const likeMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const isLiked = myLikes?.includes(itemId);
      if (isLiked) {
        await supabase.from("coloring_gallery_likes").delete().eq("user_id", user.id).eq("gallery_item_id", itemId);
      } else {
        await supabase.from("coloring_gallery_likes").insert({ user_id: user.id, gallery_item_id: itemId });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["coloring-community-gallery"] });
      queryClient.invalidateQueries({ queryKey: ["coloring-my-likes"] });
    },
  });

  const handleShare = async () => {
    if (!shareFile || !shareTitle.trim()) return;
    setIsUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      const ext = shareFile.name.split(".").pop();
      const fileName = `gallery/${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("coloring-images").upload(fileName, shareFile);
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("coloring-images").getPublicUrl(fileName);
      await supabase.from("coloring_community_gallery").insert({
        user_id: user.id,
        title: shareTitle,
        image_url: publicUrl,
        is_public: true,
      });
      toast.success("Shared to community gallery!");
      setShareTitle("");
      setShareFile(null);
      queryClient.invalidateQueries({ queryKey: ["coloring-community-gallery"] });
    } catch (err: any) {
      toast.error(err.message || "Failed to share");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Community Gallery - How it works"} steps={[{ title: 'Open', desc: 'Access the Community Gallery section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Community Gallery.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      {/* Share Card */}
      <Card className="backdrop-blur-xl bg-card/80 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-rose-500/20 to-pink-500/20 flex items-center justify-center">
              <Share2 className="h-4 w-4 text-rose-500" />
            </div>
            Share Your Creation
          </CardTitle>
          <CardDescription>Upload your colored masterpiece to inspire others</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Input placeholder="Give it a title..." value={shareTitle} onChange={(e) => setShareTitle(e.target.value)} className="rounded-xl" />
          <Input type="file" accept="image/*" onChange={(e) => setShareFile(e.target.files?.[0] || null)} className="rounded-xl" />
          <Button onClick={handleShare} disabled={!shareFile || !shareTitle.trim() || isUploading} className="w-full rounded-xl">
            {isUploading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...</> : <><Upload className="mr-2 h-4 w-4" /> Share to Gallery</>}
          </Button>
        </CardContent>
      </Card>

      {/* Gallery Grid */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-bold flex items-center gap-2">
          <Users className="w-5 h-5 text-primary" /> Community Creations
        </h3>
        <Badge variant="outline">{galleryItems?.length || 0} artworks</Badge>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin" /></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {galleryItems?.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="overflow-hidden group hover:shadow-lg transition-all">
                <div className="relative aspect-square cursor-pointer" onClick={() => setSelectedImage(item.image_url)}>
                  <img src={item.image_url} alt={item.title || "Community artwork"} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                    <Eye className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <CardContent className="p-3">
                  <p className="text-sm font-medium truncate">{item.title || "Untitled"}</p>
                  <div className="flex items-center justify-between mt-1">
                    <button
                      onClick={() => likeMutation.mutate(item.id)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        myLikes?.includes(item.id) ? "text-rose-500" : "text-muted-foreground hover:text-rose-500"
                      }`}
                    >
                      <Heart className={`w-3.5 h-3.5 ${myLikes?.includes(item.id) ? "fill-current" : ""}`} />
                      {item.likes_count || 0}
                    </button>
                    <span className="text-[10px] text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      {selectedImage && (
        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader><DialogTitle>Artwork</DialogTitle></DialogHeader>
            <img src={selectedImage} alt="Full view" className="w-full rounded-lg" />
          </DialogContent>
        </Dialog>
      )}
    </motion.div>
    </>
  );
}
