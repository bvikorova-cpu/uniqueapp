import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { motion } from "framer-motion";
import { Plus, Sparkles } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface StoryHighlightsProps {
  userId: string;
  isOwnProfile: boolean;
}

interface Highlight {
  id: string;
  title: string;
  cover_url: string | null;
  image_urls: string[] | null;
}

export const StoryHighlights = ({ userId, isOwnProfile }: StoryHighlightsProps) => {
  const [active, setActive] = useState<Highlight | null>(null);

  const { data: highlights } = useQuery({
    queryKey: ["story-highlights", userId],
    queryFn: async () => {
      const { data } = await supabase
        .from("story_highlights")
        .select("*")
        .eq("user_id", userId)
        .order("order_index", { ascending: true });
      return (
    <>
      <FloatingHowItWorks title={"Story Highlights - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Highlights section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Highlights.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      (data || []) as unknown
    </>
  ) as Highlight[];
    },
    enabled: !!userId,
  });

  if (!highlights || (highlights.length === 0 && !isOwnProfile)) return null;

  return (
    <>
      <div className="mb-6 px-1">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-300/80">Highlights</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {isOwnProfile && (
            <button
              className="shrink-0 h-16 w-16 rounded-full border-2 border-dashed border-amber-400/40 flex items-center justify-center hover:border-amber-400 transition-colors group"
              title="Add highlight"
            >
              <Plus className="h-6 w-6 text-amber-400/70 group-hover:text-amber-300 group-hover:scale-110 transition-transform" />
            </button>
          )}
          {highlights?.map((h, i) => (
            <motion.button
              key={h.id}
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => setActive(h)}
              className="shrink-0 group"
              title={h.title}
            >
              <div className="h-16 w-16 rounded-full p-[2.5px] bg-gradient-to-tr from-amber-400 via-pink-400 to-violet-400 group-hover:scale-105 transition-transform">
                <div className="h-full w-full rounded-full bg-background p-[2px]">
                  {h.cover_url ? (
                    <img src={h.cover_url} alt={h.title} className="h-full w-full rounded-full object-cover" />
                  ) : (
                    <div className="h-full w-full rounded-full bg-gradient-to-br from-amber-500/30 to-violet-500/30 flex items-center justify-center text-xs font-black text-white">
                      {h.title[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[10px] font-medium mt-1 text-center truncate w-16 text-foreground/80">{h.title}</div>
            </motion.button>
          ))}
        </div>
      </div>

      <Dialog open={!!active} onOpenChange={() => setActive(null)}>
        <DialogContent className="max-w-md bg-card/95 backdrop-blur-xl border-amber-400/30">
          <DialogHeader>
            <DialogTitle className="bg-gradient-to-r from-amber-300 to-amber-500 bg-clip-text text-transparent">
              {active?.title}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-2 max-h-[60vh] overflow-y-auto">
            {(active?.image_urls || []).map((url, i) => (
              <img key={i} src={url} alt="" className="rounded-lg object-cover aspect-square w-full" />
            ))}
            {(!active?.image_urls || active.image_urls.length === 0) && (
              <p className="col-span-2 text-center text-muted-foreground py-8 text-sm">No images yet</p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
