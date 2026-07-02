import { useState } from "react";
import { motion } from "framer-motion";
import { Heart, Image as ImageIcon, Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const CommunityGalleryView = () => {
  const queryClient = useQueryClient();
  const [liking, setLiking] = useState<string | null>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["community-gallery"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_community_gallery")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return data || [];
    },
  });

  const toggleLike = async (itemId: string) => {
    setLiking(itemId);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return toast.error("Please sign in to like");

      const { data: existing } = await supabase
        .from("ai_gallery_likes")
        .select("id")
        .eq("user_id", user.id)
        .eq("gallery_item_id", itemId)
        .maybeSingle();

      if (existing) {
        await supabase.from("ai_gallery_likes").delete().eq("id", existing.id);
        await supabase.rpc("increment_ai_gallery_likes", { p_item_id: itemId, p_delta: -1 });
      } else {
        await supabase.from("ai_gallery_likes").insert({ user_id: user.id, gallery_item_id: itemId });
        await supabase.rpc("increment_ai_gallery_likes", { p_item_id: itemId, p_delta: 1 });
      }
      queryClient.invalidateQueries({ queryKey: ["community-gallery"] });
    } catch (e: any) {
      toast.error("Failed to like");
    } finally {
      setLiking(null);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Community Gallery View - How it works"} steps={[{ title: 'Open', desc: 'Access the Community Gallery View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Community Gallery View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-black mb-2">🌍 Community Gallery</h2>
        <p className="text-muted-foreground text-sm">Browse and like AI-generated images shared by the community</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 border rounded-xl bg-card/60">
          <ImageIcon className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No images shared yet. Be the first!</p>
          <p className="text-xs text-muted-foreground mt-1">Generate images and share them to the gallery</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {items.map((item, i) => (
            <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="rounded-xl border border-border overflow-hidden bg-card/80 group">
              <div className="aspect-square overflow-hidden">
                <img src={item.image_url} alt={item.title || "AI Art"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              </div>
              <div className="p-3">
                <p className="text-xs font-bold truncate">{item.title || "Untitled"}</p>
                <p className="text-[10px] text-muted-foreground truncate">{item.prompt}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-[10px] text-muted-foreground">{item.tool_used}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" className="h-6 px-2 gap-1" title="Remix this prompt"
                      onClick={() => { navigator.clipboard.writeText(item.prompt || ""); toast.success("Prompt copied — paste into Generate"); }}>
                      <Wand2 className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-6 px-2 gap-1" onClick={() => toggleLike(item.id)} disabled={liking === item.id}>
                      <Heart className={`w-3 h-3 ${liking === item.id ? 'animate-pulse' : ''}`} />
                      <span className="text-[10px]">{item.likes_count || 0}</span>
                    </Button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
    </>
  );
};
