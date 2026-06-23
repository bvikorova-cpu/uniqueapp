import { useState, useEffect, useMemo, Fragment } from "react";
import { Plus, Play, Camera, Video, Megaphone, Loader2, Trash2, X } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStories } from "@/hooks/useStories";
import { motion, AnimatePresence } from "framer-motion";
import { StoryAnalyticsPanel } from "@/components/story/StoryAnalyticsPanel";
import { useAuth } from "@/contexts/AuthContext";
import { showMonetagRewarded, trackMonetagEvent, MONETAG_ZONES } from "@/lib/monetag";
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
      trackMonetagEvent("impression", MONETAG_ZONES.REWARDED_VIGNETTE, `story_slot_${slotIndex}`);
      const shown = await showMonetagRewarded();
      if (!shown) { toast.error("Ad couldn't load. Try again in a moment."); return; }
      trackMonetagEvent("click", MONETAG_ZONES.REWARDED_VIGNETTE, `story_slot_${slotIndex}`);
      const { data: auth } = await supabase.auth.getUser();
      const uid = auth?.user?.id;
      if (!uid) return;
      const today = new Date().toISOString().slice(0, 10);
      await supabase.rpc("award_xp", {
        _user_id: uid, _amount: STORY_AD_XP,
        _source: "story_ad_view", _ref_id: `${today}:story:${slotIndex}`,
      });
      setClaimed(true);
      toast.success(`+${STORY_AD_XP} XP earned!`);
    } finally { setLoading(false); }
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
      onClick={handleWatch} disabled={loading || claimed}
      className="flex-shrink-0 relative w-[100px] h-[150px] rounded-2xl overflow-hidden group border border-primary/30"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/30 to-primary/20 backdrop-blur-xl" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
      <div className="relative h-full flex flex-col items-center justify-center gap-2 p-2 text-center">
        {loading ? <Loader2 className="w-6 h-6 text-white animate-spin" /> : <Megaphone className="w-6 h-6 text-white" />}
        <span className="text-[10px] font-bold text-white uppercase tracking-wider">{claimed ? "Claimed" : "Sponsored"}</span>
        <span className="text-[10px] text-white/90">+{STORY_AD_XP} XP</span>
      </div>
      <span className="absolute top-1 right-1 text-[8px] uppercase text-white/70 border border-white/30 rounded-full px-1.5">Ad</span>
    </motion.button>
  );
};

export const StoriesBar = () => {
  const [open, setOpen] = useState(false);
  const [viewingStory, setViewingStory] = useState<any>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [uploadPct, setUploadPct] = useState(0);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const { stories, createStoryAsync, isCreating, deleteStory, isDeleting, viewStory } = useStories();
  const { user } = useAuth();
  const isOwnStory = !!viewingStory && user?.id === viewingStory.user_id;

  const previewUrl = useMemo(
    () => (selectedFile ? URL.createObjectURL(selectedFile) : null),
    [selectedFile],
  );
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const isVideoFile = !!selectedFile?.type?.startsWith("video/");

  const handleCreateStory = async () => {
    if (!selectedFile) return;
    setUploadPct(0);
    try {
      await createStoryAsync({
        mediaFile: selectedFile,
        caption,
        onProgress: setUploadPct,
      });
      setOpen(false);
      setSelectedFile(null);
      setCaption("");
      setUploadPct(0);
    } catch {
      // toast handled in hook
    }
  };

  const handleViewStory = (story: any) => {
    setViewingStory(story);
    viewStory(story.id);
  };

  const isViewingVideo = viewingStory?.media_type === "video";

  return (
    <>
      <div className="relative">
        <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <motion.button
            whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.95 }}
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

          {stories.map((story, index) => (
            <Fragment key={story.id}>
              <motion.button
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ scale: 1.05, y: -4 }} whileTap={{ scale: 0.95 }}
                onClick={() => handleViewStory(story)}
                className="flex-shrink-0 relative w-[100px] h-[150px] rounded-2xl overflow-hidden group cursor-pointer"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 backdrop-blur-xl" />
                <div className="absolute inset-0">
                  {story.media_url ? (
                    story.media_type === "video" ? (
                      <video
                        src={`${story.media_url}#t=0.1`}
                        muted playsInline preload="metadata"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <img
                        src={story.media_url} alt=""
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    )
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-primary/40 to-accent/40" />
                  )}
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute top-2 left-2">
                  <div className="w-9 h-9 rounded-full p-[2px] bg-gradient-to-br from-primary via-accent to-primary">
                    <Avatar className="w-full h-full border-2 border-background">
                      <AvatarImage src={story.profiles?.avatar_url || undefined} />
                      <AvatarFallback className="text-[10px] bg-accent">{story.profiles?.full_name?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                  </div>
                </div>

                {story.media_type === 'video' && (
                  <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                    <Play className="w-3 h-3 text-white fill-white" />
                  </div>
                )}

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
        </div>
      </div>

      {/* Create Story Dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!isCreating) setOpen(v); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="w-5 h-5 text-primary" /> Create Story
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {!selectedFile && (
              <div className="border-2 border-dashed border-primary/30 rounded-xl p-6 text-center hover:border-primary/60 transition-colors cursor-pointer">
                <Input
                  type="file" accept="image/*,video/*"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="hidden" id="story-file"
                />
                <label htmlFor="story-file" className="cursor-pointer space-y-2 block">
                  <div className="flex justify-center gap-3">
                    <Camera className="w-8 h-8 text-primary/60" />
                    <Video className="w-8 h-8 text-accent/60" />
                  </div>
                  <p className="text-sm text-muted-foreground">Tap to add photo or video</p>
                </label>
              </div>
            )}

            {selectedFile && previewUrl && (
              <div className="relative rounded-xl overflow-hidden border bg-black aspect-[9/16] max-h-[50vh] mx-auto">
                {isVideoFile ? (
                  <video src={previewUrl} controls playsInline className="w-full h-full object-contain" />
                ) : (
                  <img src={previewUrl} alt="" className="w-full h-full object-contain" />
                )}
                {!isCreating && (
                  <button
                    onClick={() => setSelectedFile(null)}
                    className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center text-white"
                    aria-label="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
                <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[11px] text-white/90 drop-shadow">
                  <span className="truncate max-w-[60%]">{selectedFile.name}</span>
                  <span>{(selectedFile.size / (1024 * 1024)).toFixed(1)} MB</span>
                </div>
              </div>
            )}

            <Textarea
              placeholder="Add a caption..."
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="resize-none"
              disabled={isCreating}
            />

            {isCreating && (
              <div className="space-y-1">
                <Progress value={uploadPct} />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Uploading…</span>
                  <span>{uploadPct}%</span>
                </div>
              </div>
            )}

            <Button onClick={handleCreateStory} disabled={!selectedFile || isCreating} className="w-full">
              {isCreating ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Uploading {uploadPct}%</> : "Share Story"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Fullscreen Story Viewer */}
      <AnimatePresence>
        {viewingStory && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
            onClick={() => setViewingStory(null)}
          >
            <button
              className="absolute top-4 right-4 z-20 text-white/80 hover:text-white text-2xl"
              onClick={(e) => { e.stopPropagation(); setViewingStory(null); }}
            >✕</button>

            {/* Progress bar — only for images (videos play own duration) */}
            {!isViewingVideo && (
              <div className="absolute top-2 left-4 right-4 h-1 bg-white/20 rounded-full overflow-hidden z-10">
                <motion.div
                  className="h-full bg-white rounded-full"
                  initial={{ width: "0%" }} animate={{ width: "100%" }}
                  transition={{ duration: 5, ease: "linear" }}
                  onAnimationComplete={() => setViewingStory(null)}
                />
              </div>
            )}

            <div className="absolute top-6 left-4 flex items-center gap-3 z-20">
              <Avatar className="w-8 h-8 ring-2 ring-white/30">
                <AvatarImage src={viewingStory.profiles?.avatar_url || undefined} />
                <AvatarFallback>{viewingStory.profiles?.full_name?.[0]}</AvatarFallback>
              </Avatar>
              <span className="text-white text-sm font-medium">{viewingStory.profiles?.full_name || "User"}</span>
            </div>

            {viewingStory.media_url && (
              isViewingVideo ? (
                <video
                  src={viewingStory.media_url}
                  autoPlay controls playsInline
                  className="max-w-full max-h-full"
                  onClick={(e) => e.stopPropagation()}
                  onEnded={() => setViewingStory(null)}
                />
              ) : (
                <img
                  src={viewingStory.media_url} alt=""
                  className="max-w-full max-h-full object-contain"
                  onClick={(e) => e.stopPropagation()}
                />
              )
            )}

            {viewingStory.caption && (
              <div className="absolute bottom-20 left-4 right-4 text-white text-center text-lg font-medium drop-shadow-lg z-10">
                {viewingStory.caption}
              </div>
            )}

            {isOwnStory && (
              <>
                <button
                  className="absolute bottom-4 right-4 z-20 w-12 h-12 rounded-full bg-red-600/90 hover:bg-red-600 flex items-center justify-center text-white shadow-lg"
                  onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
                  aria-label="Delete story"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div
                  className="absolute bottom-4 left-4 right-20 max-w-md z-20"
                  onClick={(e) => e.stopPropagation()}
                >
                  <StoryAnalyticsPanel storyId={viewingStory.id} />
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this story?</AlertDialogTitle>
            <AlertDialogDescription>This will permanently remove your story.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              disabled={isDeleting}
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (!viewingStory) return;
                deleteStory(viewingStory, {
                  onSuccess: () => { setConfirmDelete(false); setViewingStory(null); },
                });
              }}
            >
              {isDeleting ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
