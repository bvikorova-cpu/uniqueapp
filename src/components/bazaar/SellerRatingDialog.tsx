import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  orderId: string;
  sellerId: string;
  buyerId: string;
  onSubmitted?: () => void;
}

export const SellerRatingDialog = ({ open, onOpenChange, orderId, sellerId, buyerId, onSubmitted }: Props) => {
  const { toast } = useToast();
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [existingId, setExistingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      const { data } = await supabase
        .from("bazaar_seller_ratings")
        .select("id, rating, comment")
        .eq("order_id", orderId)
        .eq("buyer_id", buyerId)
        .maybeSingle();
      if (data) {
        setExistingId(data.id);
        setRating(data.rating);
        setComment(data.comment ?? "");
      } else {
        setExistingId(null);
      }
    })();
  }, [open, orderId, buyerId]);

  const submit = async () => {
    setSubmitting(true);
    const payload = { order_id: orderId, seller_id: sellerId, buyer_id: buyerId, rating, comment: comment.trim() || null };
    const { error } = existingId
      ? await supabase.from("bazaar_seller_ratings").update(payload).eq("id", existingId)
      : await supabase.from("bazaar_seller_ratings").insert(payload);
    setSubmitting(false);
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Thanks!", description: "Your rating was saved." });
    onSubmitted?.();
    onOpenChange(false);
  };

  return (
    <>
      <FloatingHowItWorks title="How Seller Rating Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{existingId ? "Update your rating" : "Rate the seller"}</DialogTitle>
        </DialogHeader>
        <div className="flex justify-center gap-1 py-2">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              aria-label={`${n} star${n > 1 ? "s" : ""}`}
            >
              <Star
                className={cn(
                  "h-9 w-9 transition",
                  (hover || rating) >= n ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground",
                )}
              />
            </button>
          ))}
        </div>
        <Textarea
          placeholder="Optional: leave a short comment about your experience"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          maxLength={500}
        />
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={submitting}>Cancel</Button>
          <Button onClick={submit} disabled={submitting}>
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {existingId ? "Update" : "Submit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
    );
};

export default SellerRatingDialog;
