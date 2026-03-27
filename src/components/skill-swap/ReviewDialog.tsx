import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface ReviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  conversationId: string;
  reviewedUserId: string;
  reviewedUserName: string;
  onReviewSubmitted: () => void;
}

export const ReviewDialog = ({
  open, onOpenChange, conversationId, reviewedUserId, reviewedUserName, onReviewSubmitted,
}: ReviewDialogProps) => {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) { toast.error("Please select a rating"); return; }
    setSubmitting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { toast.error("Please sign in first"); return; }
      const { error } = await supabase.from('skill_swap_reviews').insert([{
        reviewer_id: session.user.id, reviewed_user_id: reviewedUserId,
        conversation_id: conversationId, rating, comment: comment.trim() || null,
      }]);
      if (error) throw error;
      toast.success("Review submitted successfully!");
      onReviewSubmitted(); onOpenChange(false); setRating(0); setComment("");
    } catch (error: any) {
      console.error('Error submitting review:', error);
      if (error.code === '23505') toast.error("You have already reviewed this exchange");
      else toast.error("Failed to submit review");
    } finally { setSubmitting(false); }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <DialogTitle className="text-xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" /> Rate Your Exchange
          </DialogTitle>
          <DialogDescription className="text-sm">
            How was your skill exchange experience with {reviewedUserName}?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="flex flex-col items-center gap-3">
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button key={star} onClick={() => setRating(star)}
                  onMouseEnter={() => setHoveredRating(star)} onMouseLeave={() => setHoveredRating(0)}
                  className="transition-transform hover:scale-110 active:scale-95">
                  <Star className={`w-8 h-8 ${star <= (hoveredRating || rating) ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground/30'}`} />
                </button>
              ))}
            </div>
            {rating > 0 && (
              <span className="text-xs text-muted-foreground font-medium">
                {["Poor", "Fair", "Good", "Very Good", "Excellent"][rating - 1]}
              </span>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold mb-1.5 block">Share your experience (optional)</label>
            <Textarea value={comment} onChange={(e) => setComment(e.target.value)}
              placeholder="What did you learn? How was the teaching style?" rows={4} className="bg-muted/10 border-border/50" />
          </div>

          <div className="flex gap-3">
            <Button onClick={handleSubmit} disabled={submitting || rating === 0} className="flex-1">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
