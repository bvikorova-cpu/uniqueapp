import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useSellerReviews } from "@/hooks/useSellerReviews";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  sellerId: string;
  sellerName?: string;
  onSubmitted?: () => void;
}

export default function LeaveReviewDialog({ open, onOpenChange, sellerId, sellerName, onSubmitted }: Props) {
  const { submitReview } = useSellerReviews(sellerId);
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      submitReview({ rating, comment: comment.trim() || undefined });
      onSubmitted?.();
      onOpenChange(false);
      setComment("");
      setRating(5);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Rate {sellerName || "this provider"}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-1 justify-center py-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                type="button"
                onMouseEnter={() => setHover(n)}
                onMouseLeave={() => setHover(0)}
                onClick={() => setRating(n)}
                className="p-1"
                aria-label={`${n} stars`}
              >
                <Star
                  className={`h-8 w-8 transition ${
                    (hover || rating) >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share details of your experience (optional)…"
            rows={4}
            maxLength={1000}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting ? "Submitting…" : "Submit review"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
