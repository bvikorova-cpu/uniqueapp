import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Star, Loader2 } from "lucide-react";

interface Booking {
  id: string;
  customer_id: string;
  provider_id: string;
  scheduled_at: string;
  offering_name: string | null;
}

interface ServiceReviewDialogProps {
  booking: Booking;
  onClose: () => void;
  onSaved?: () => void;
}

export function ServiceReviewDialog({ booking, onClose, onSaved }: ServiceReviewDialogProps) {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (rating < 1 || rating > 5) {
      toast({ title: "Select a rating", variant: "destructive" });
      return;
    }
    setSaving(true);
    const { error } = await supabase.from("service_reviews").insert({
      booking_id: booking.id,
      provider_id: booking.provider_id,
      reviewer_id: booking.customer_id,
      rating,
      comment: comment || null,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Failed to save review", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Review saved", description: "Thank you for your feedback!" });
      onSaved?.();
      onClose();
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Leave a review</DialogTitle>
          <DialogDescription>
            How was your {booking.offering_name ?? "appointment"} on {new Date(booking.scheduled_at).toLocaleDateString()}?
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div>
            <Label className="mb-2 block">Rating</Label>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setRating(n)}
                  className="p-1 focus:outline-none"
                  aria-label={`Rate ${n} stars`}
                >
                  <Star className={`w-7 h-7 ${n <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"}`} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <Label htmlFor="review-comment">Comment (optional)</Label>
            <Textarea
              id="review-comment"
              value={comment}
              onChange={(e) => setComment(e.target.value.slice(0, 500))}
              placeholder="Describe your experience…"
              rows={4}
            />
            <p className="text-xs text-muted-foreground mt-1">{comment.length}/500</p>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose} disabled={saving}>Skip</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save review
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
