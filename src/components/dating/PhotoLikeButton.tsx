import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Heart, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  fromUserId: string;
  toUserId: string;
  photoUrl: string;
  promptIndex?: number | null;
}

/**
 * Hinge-style heart button that lets you like a SPECIFIC photo/prompt
 * with an optional short comment. Used as overlay on swipe card.
 */
export const PhotoLikeButton = ({ fromUserId, toUserId, photoUrl, promptIndex = null }: Props) => {
  const { toast } = useToast();
  const [liked, setLiked] = useState(false);
  const [open, setOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("dating_photo_likes")
        .select("id")
        .eq("from_user_id", fromUserId)
        .eq("to_user_id", toUserId)
        .eq("photo_url", photoUrl)
        .maybeSingle();
      setLiked(!!data);
    })();
  }, [fromUserId, toUserId, photoUrl]);

  const handleSend = async () => {
    setSaving(true);
    const { error } = await supabase.from("dating_photo_likes").insert({
      from_user_id: fromUserId,
      to_user_id: toUserId,
      photo_url: photoUrl,
      prompt_index: promptIndex,
      comment: comment.trim().slice(0, 200) || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Couldn't send", description: error.message, variant: "destructive" });
    } else {
      setLiked(true);
      setOpen(false);
      setComment("");
      toast({ title: "Sent ❤️", description: "They'll see this in their likes." });
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title={"Photo Like Button"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <button
        onClick={(e) => { e.stopPropagation(); if (!liked) setOpen(true); }}
        disabled={liked}
        className={`absolute bottom-20 right-3 h-11 w-11 rounded-full backdrop-blur-md flex items-center justify-center shadow-lg transition-all ${
          liked ? "bg-pink-500 text-white" : "bg-white/90 hover:bg-white text-pink-500"
        }`}
        aria-label="Like this photo"
      >
        <Heart className={`h-5 w-5 ${liked ? "fill-current" : ""}`} />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-pink-500" />
              Like this {promptIndex !== null ? "prompt" : "photo"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
              <img src={photoUrl} alt="" className="w-full h-full object-cover" />
            </div>
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment (optional)..."
              maxLength={200}
              className="min-h-20 text-sm"
            />
            <div className="flex justify-between items-center">
              <span className="text-[10px] text-muted-foreground">{comment.length}/200</span>
              <Button onClick={handleSend} disabled={saving} className="gap-1.5">
                {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Heart className="h-3.5 w-3.5" />}
                Send like
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
