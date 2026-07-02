import { useState } from "react";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { useSellerReviews } from "@/hooks/useSellerReviews";
import { formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  sellerId: string;
}

const StarRow = ({ value, onChange }: { value: number; onChange?: (n: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        disabled={!onChange}
        onClick={() => onChange?.(n)}
        className={cn("transition", onChange && "hover:scale-110")}
      >
        <Star className={cn("h-5 w-5", n <= value ? "fill-amber-400 text-amber-400" : "text-muted-foreground")} />
      </button>
    ))}
  </div>
);

export const SellerReviewsPanel = ({ sellerId }: Props) => {
  const { reviews, avgRating, count, submitReview } = useSellerReviews(sellerId);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const handleSubmit = () => {
    if (!rating) return;
    submitReview({ rating, comment: comment.trim() || undefined });
    setComment("");
  };

  return (
    <>
      <FloatingHowItWorks title="How Seller Reviews Panel works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <div className="space-y-4">
      <Card className="p-4 flex items-center gap-4">
        <div className="text-4xl font-black bg-gradient-to-br from-amber-400 to-pink-500 bg-clip-text text-transparent">
          {avgRating.toFixed(1)}
        </div>
        <div>
          <StarRow value={Math.round(avgRating)} />
          <p className="text-xs text-muted-foreground mt-1">{count} {count === 1 ? "review" : "reviews"}</p>
        </div>
      </Card>

      <Card className="p-4 space-y-3">
        <h4 className="font-semibold">Write a review</h4>
        <StarRow value={rating} onChange={setRating} />
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Share your experience..."
          rows={3}
          maxLength={500}
        />
        <Button onClick={handleSubmit} className="w-full">Submit</Button>
      </Card>

      <div className="space-y-3">
        {reviews.map((r) => (
          <Card key={r.id} className="p-3 space-y-1">
            <div className="flex items-center justify-between">
              <StarRow value={r.rating} />
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(r.created_at), { addSuffix: true })}
              </span>
            </div>
            {r.comment && <p className="text-sm">{r.comment}</p>}
          </Card>
        ))}
        {reviews.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">No reviews yet.</p>
        )}
      </div>
    </div>
    </>
    );
};
