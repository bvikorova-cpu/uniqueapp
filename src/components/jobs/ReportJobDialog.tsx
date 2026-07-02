import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
const REASONS = [
  { value: "scam", label: "Scam / fake offer" },
  { value: "spam", label: "Spam / duplicate" },
  { value: "offensive", label: "Offensive / discriminatory" },
  { value: "illegal", label: "Illegal activity" },
  { value: "duplicate", label: "Duplicate listing" },
  { value: "other", label: "Other" },
];

interface Props {
  jobId: string;
  jobTitle: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReportJobDialog({ jobId, jobTitle, open, onOpenChange }: Props) {
  const { toast } = useToast();
  const [reason, setReason] = useState("scam");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Login required", description: "You must be logged in to report.", variant: "destructive" });
        return;
      }
      const { error } = await supabase.from("job_reports").insert({
        job_id: jobId,
        reporter_id: user.id,
        reason,
        details: details.trim().slice(0, 2000) || null,
      });
      if (error) {
        if (/duplicate|unique/i.test(error.message)) {
          toast({ title: "Already reported", description: "You already reported this listing." });
        } else {
          throw error;
        }
      } else {
        toast({ title: "Report submitted", description: "Our team will review this listing." });
      }
      onOpenChange(false);
      setDetails("");
    } catch (e: any) {
      toast({ title: "Failed", description: e?.message || "Could not submit report.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Report Job Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Flag className="h-5 w-5 text-destructive" /> Report job
          </DialogTitle>
          <DialogDescription>
            Report "<span className="font-semibold">{jobTitle}</span>" to our trust & safety team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label className="mb-2 block">Reason</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {REASONS.map((r) => (
                <div key={r.value} className="flex items-center gap-2">
                  <RadioGroupItem value={r.value} id={`r-${r.value}`} />
                  <Label htmlFor={`r-${r.value}`} className="font-normal cursor-pointer">{r.label}</Label>
                </div>
              ))}
            </RadioGroup>
          </div>
          <div>
            <Label htmlFor="report-details">Details (optional)</Label>
            <Textarea
              id="report-details"
              value={details}
              onChange={(e) => setDetails(e.target.value.slice(0, 2000))}
              placeholder="Add context…"
              rows={4}
              maxLength={2000}
            />
          </div>
          <Button onClick={submit} disabled={submitting} className="w-full" variant="destructive">
            {submitting ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Submitting…</> : "Submit report"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
    );
}
