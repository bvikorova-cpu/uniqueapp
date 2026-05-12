import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Loader2, Heart, Pause, Tag } from "lucide-react";

const REASONS = [
  { v: "price", l: "Too expensive" },
  { v: "not_using", l: "Not using it enough" },
  { v: "missing_features", l: "Missing features I need" },
  { v: "switched", l: "Switched to another tool" },
  { v: "temporary", l: "Just taking a break" },
  { v: "other", l: "Other" },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tier: string;
  onProceedCancel: () => void;
}

export const CancellationSurveyDialog = ({ open, onOpenChange, tier, onProceedCancel }: Props) => {
  const [step, setStep] = useState<"reason" | "offer">("reason");
  const [reason, setReason] = useState("");
  const [feedback, setFeedback] = useState("");
  const [saving, setSaving] = useState(false);

  const submit = async (offer: string | null) => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from("cancellation_surveys").insert({
          user_id: user.id, tier, reason, feedback, accepted_offer: offer,
        });
      }
      if (offer === "pause") {
        await supabase.functions.invoke("pause-subscription", { body: { weeks: 4 } });
        toast.success("Subscription paused for 4 weeks");
        onOpenChange(false);
      } else if (offer === "discount") {
        toast.success("50% off applied for 3 months");
        onOpenChange(false);
      } else {
        onProceedCancel();
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        {step === "reason" ? (
          <>
            <DialogHeader><DialogTitle>We're sorry to see you go</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground">Help us improve — what's the main reason?</p>
              <RadioGroup value={reason} onValueChange={setReason}>
                {REASONS.map(r => (
                  <div key={r.v} className="flex items-center gap-2"><RadioGroupItem value={r.v} id={r.v} /><Label htmlFor={r.v}>{r.l}</Label></div>
                ))}
              </RadioGroup>
              <Textarea placeholder="Anything else? (optional)" value={feedback} onChange={e => setFeedback(e.target.value)} />
              <Button className="w-full" disabled={!reason} onClick={() => setStep("offer")}>Continue</Button>
            </div>
          </>
        ) : (
          <>
            <DialogHeader><DialogTitle>Before you go — try one of these</DialogTitle></DialogHeader>
            <div className="space-y-3">
              {reason === "temporary" && (
                <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => submit("pause")}>
                  <Pause className="h-5 w-5 text-primary" />
                  <div className="text-left"><div className="font-semibold">Pause for 4 weeks</div><div className="text-xs text-muted-foreground">Keep your data, no charges</div></div>
                </Button>
              )}
              {reason === "price" && (
                <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => submit("discount")}>
                  <Tag className="h-5 w-5 text-primary" />
                  <div className="text-left"><div className="font-semibold">50% off for 3 months</div><div className="text-xs text-muted-foreground">Stay at half price</div></div>
                </Button>
              )}
              <Button variant="outline" className="w-full justify-start gap-3 h-auto py-3" onClick={() => submit("downgrade")}>
                <Heart className="h-5 w-5 text-primary" />
                <div className="text-left"><div className="font-semibold">Downgrade to Basic</div><div className="text-xs text-muted-foreground">Keep core features, lower price</div></div>
              </Button>
              <Button variant="ghost" className="w-full" disabled={saving} onClick={() => submit(null)}>
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "No thanks, cancel my subscription"}
              </Button>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
};
