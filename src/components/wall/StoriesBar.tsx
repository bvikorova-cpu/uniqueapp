import { useState, Fragment } from "react";
import { Plus, Play, Camera, Video, Megaphone, Loader2 } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStories } from "@/hooks/useStories";
import { motion, AnimatePresence } from "framer-motion";
import { StoryAnalyticsPanel } from "@/components/story/StoryAnalyticsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { showMonetagRewarded } from "@/lib/monetag";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const STORY_AD_INTERVAL = 10;
const STORY_AD_XP = 25;

const StoryAdTile = ({ slotIndex }: { slotIndex: number }) => {
  const [loading, setLoading] = useState(false);
  const [claimed, setClaimed] = useState(false);

  const handleWatch = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (loading || claimed) return;
    setLoading(true);
    try {
      const shown = await showMonetagRewarded();
      if (!shown) {
        toast.error("Ad couldn't load. Try again in a moment.");
        return;
      }
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return;
      const today = new Date().toISOString().slice(0, 10);
      await supabase.rpc("award_xp", {
        _user_id: uid,
        _amount: STORY_AD_XP,
        _source: "story_ad_view",
        _ref_id: `${today}:story:${slotIndex}`,
      });
      setClaimed(true);
      toast.success(`+${STORY_AD_XP} XP earned!`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleWatch}
      disabled={loading || claimed}
      className="flex-shrink-0 relative w-[100px] h-[150px] rounded-2xl overflow-hidden group border border-primary/30"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/30 to-primary/20 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="relative h-full flex flex-col items-center justify-center gap-2 p-2 text-center">
        {loading ? (
          <Loader2 className="w-6 h-6 text-white animate-spin" />
        ) : (
          <Megaphone className="w-6 h-6 text-white" />
        )}
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">
          {claimed ? "Claimed" : "Sponsored"}
        </span>
        <span className="text-[10px] text-white/90">+{STORY_AD_XP} XP</span>
      </div>
      <span className="absolute top-1 right-1 text-[8px] uppercase text-white/70 border border-white/30 rounded-full px-1.5">
        Ad
      </span>
    </motion.button>
  );
};

export const StoriesBar = () => {
  const [open, setOpen] = useState(false);
  const [viewingStory, setViewingStory] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const { stories, createStory, viewStory } = useStories();
  const { user } = useAuth();
  const isOwnStory = viewingStory && user?.id === viewingStory.user_id;

  const handleCreateStory = () => {
    if (!selectedFile) return;
    createStory(
      { mediaFile: selectedFile, caption },
      {
        onSuccess: () => {
          setOpen(false);
          setSelectedFile(null);
          setCaption("");
        },
      }
    );
  };

  const handleViewStory = (story: any) => {
    setViewingStory(story);
    viewStory(story.id);
  };

  return (
    <>
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* Create Story - Premium glass card */}
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setOpen(true)}
            className="flex-shrink-0 relative w-[100px] h-[150px] rounded-2xl overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-accent/20 to-primary/10 backdrop-blur-xl border border-white/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <div className="relative h-full flex flex-col items-center justify-center gap-2">
              <motion.div 
                className="w-10 h-10 rounded-full bg-primary/80 backdrop-blur-sm flex items-center justify-center ring-2 ring-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.4)]"
                animate={{ boxShadow: ['0 0 15px rgba(139,92,246,0.3)', '0 0 25px rgba(139,92,246,0.6)', '0 0 15px rgba(139,92,246,0.3)'] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Plus className="w-5 h-5 text-primary-foreground" />
              </motion.div>
              <span className="text-[11px] font-semibold text-foreground/90">Your Story</span>
            </div>
          </motion.button>

          {/* Story items with sponsored tile every Nth */}
          {stories.map((story, index) => (
            <Fragment key={story.id}>
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleViewStory(story)}
                className="flex-shrink-0 relative w-[100px] h-[150px] rounded-2xl overflow-hidden group cursor-pointer"
              >

              {/* Story background */}
              <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-xl" />
              <div className="absolute inset-0">
                {story.media_url ? (
                  <img 
                    src={story.media_url} 
                    alt="" 
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" 
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/40 to-accent/40" />
                )}
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              
              {/* Ring indicator */}
              <div className="absolute top-2 left-2">
                <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-br from-primary via-accent to-primary">
                  <Avatar className="w-full h-full border-2 border-background">
                    <AvatarImage src={story.profiles?.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px] bg-accent">{story.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                  </Avatar>
                </div>
              </div>

              {/* Play icon for video */}
              {story.media_type === 'video' && (
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <Play className="w-8 h-8 text-white drop-shadow-lg" />
                </div>
              )}
              
              {/* Name */}
              <div className="absolute bottom-2 left-2 right-2">
                <span className="text-[11px] font-semibold text-white drop-shadow-md line-clamp-2 leading-tight">
                  {story.profiles?.full_name || "User"}
                </span>
              </div>
            </motion.button>
            {(index + 1) % STORY_AD_INTERVAL === 0 && (
              <StoryAdTile slotIndex={Math.floor(index / STORY_AD_INTERVAL)} />
            )}
            </Fragment>
          ))}


          {/* Placeholder stories for visual richness */}
          {stories.length < 3 && (
            <>
              {[...Array(4 - stories.length)].map((_, i) => (
                <div 
                  key={`placeholder-${i}`}
                  className="flex-shrink-0 w-[100px] h-[150px] rounded-2xl overflow-hidden bg-accent/30 backdrop-blur-sm border border-white/5 animate-pulse"
                />
              ))}
            </>
          )}
        </div>
      </div>

      {/* Create Story Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" />
              Create Story
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center hover:border-primary/60 transition-colors cursor-pointer">
              <Input
                type="file"
                accept="image/*,video/*"
                onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                className="hidden"
                id="story-file"
              />
              <label htmlFor="story-file" className="cursor-pointer space-y-2">
                <div className="flex justify-center gap-3">
                  <Camera className="w-8 h-8 text-primary/60" />
                  <Video className="w-8 h-8 text-accent/60" />
                </div>
                <p className="text-sm text-muted-foreground">
                  {selectedFile ? selectedFile.name : "Tap to add photo or video"}
                </p>
              </label>
            </div>
            <Textarea
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="resize-none"
            />
            <Button onClick={handleCreateStory} disabled={!selectedFile} className="w-full">
              Share Story
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Story Viewer */}
      <AnimatePresence>
        {viewingStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            onClick={() => setViewingStory(null)}
          >
            <button 
              className="absolute top-4 right-4 z-10 text-white/80 hover:text-white text-2xl"
              onClick={() => setViewingStory(null)}
            >
              ✕
            </button>
            {/* Story progress bar */}
            <div className="absolute top-2 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-white rounded-full"
                initial={{ width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ duration: 5, ease: "linear" }}
                onAnimationComplete={() => setViewingStory(null)}
              />
            </div>
            
            {/* Story header */}
            <div className="absolute top-6 left-4 flex items-center gap-3">
              <Avatar className="w-8 h-8 ring-2 ring-white/30">
                <AvatarImage src={viewingStory.profiles?.avatar_url || undefined} />
                <AvatarFallback>{viewingStory.profiles?.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-white text-sm font-medium">{viewingStory.profiles?.full_name}</span>
            </div>

            {viewingStory.media_url && (
              <img 
                src={viewingStory.media_url} 
                alt="" 
                className="max-w-full max-h-full object-contain"
                onClick={(e) => e.stopPropagation()}
              />
            )}
            {viewingStory.caption && (
              <div className="absolute bottom-12 left-4 right-4 text-white text-center text-lg font-medium drop-shadow-lg">
                {viewingStory.caption}
              </div>
            )}

            {isOwnStory && (
              <div
                className="absolute bottom-4 left-4 right-4 max-w-md mx-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <StoryAnalyticsPanel storyId={viewingStory.id} />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
