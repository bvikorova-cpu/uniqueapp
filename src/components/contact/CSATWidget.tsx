import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  userId: string;
  ticketId?: string;
  channel?: string;
  onSubmitted?: () => void;
}

export const CSATWidget = ({ userId, ticketId, channel = "live_chat", onSubmitted }: Props) => {
  const [rating, setRating] = useState<number>(0);
  const [hover, setHover] = useState<number>(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!rating) return;
    setBusy(true);
    const { error } = await supabase.from("csat_ratings").insert({
      user_id: userId,
      ticket_id: ticketId || null,
      channel,
      rating,
      comment: comment.trim() || null,
    });
    setBusy(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setSubmitted(true);
    toast.success("Thanks for your feedback!");
    onSubmitted?.();
  };

  if (submitted) {
    return (
    <>
      <FloatingHowItWorks title={"C S A T Widget - How it works"} steps={[{ title: 'Open', desc: 'Access the C S A T Widget section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in C S A T Widget.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-emerald-500/10 border-emerald-500/30">
        <CardContent className="p-3 text-xs text-emerald-300 text-center">
          ⭐ Thanks for rating your experience!
        </CardContent>
      </Card>
    </>
  );
  }

  return (
    <Card className="bg-muted/30 border-border/40">
      <CardContent className="p-3 space-y-2">
        <p className="text-xs font-medium">How was this conversation?</p>
        <div className="flex gap-1 justify-center">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              onMouseEnter={() => setHover(n)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(n)}
              className="transition-transform hover:scale-110"
              aria-label={`${n} stars`}
            >
              <Star
                className={`w-6 h-6 ${
                  (hover || rating) >= n ? "fill-amber-400 text-amber-400" : "text-muted-foreground"
                }`}
              />
            </button>
          ))}
        </div>
        {rating > 0 && (
          <>
            <Textarea
              placeholder="Anything we could improve? (optional)"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              maxLength={500}
              className="text-xs min-h-16"
            />
            <Button size="sm" onClick={submit} disabled={busy} className="w-full">
              Submit
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
};
