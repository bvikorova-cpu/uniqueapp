import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  itemId: string;
  itemTitle: string;
  reporterId: string;
}

const REASONS = [
  { id: "scam", label: "Scam / fraud" },
  { id: "prohibited", label: "Prohibited / illegal item" },
  { id: "offensive", label: "Offensive content" },
  { id: "duplicate", label: "Duplicate listing" },
  { id: "wrong_category", label: "Wrong category" },
  { id: "other", label: "Other" },
];

export const ReportListingDialog = ({ open, onOpenChange, itemId, itemTitle, reporterId }: Props) => {
  const { toast } = useToast();
  const [reason, setReason] = useState("scam");
  const [details, setDetails] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    const { error } = await supabase.from("bazaar_item_reports" as any).insert({
      item_id: itemId,
      reporter_id: reporterId,
      reason,
      details: details.trim() || null,
    });
    setSubmitting(false);
    if (error) {
      toast({ title: "Could not report", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Report submitted", description: "Our team will review the listing." });
    setDetails("");
    onOpenChange(false);
  };

  return (
    <>
      <FloatingHowItWorks title="How Report Listing Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Flag className="h-4 w-4" /> Report listing</DialogTitle>
          <DialogDescription className="truncate">{itemTitle}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div>
            <label className="text-xs font-semibold mb-1 block">Reason</label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REASONS.map((r) => <SelectItem key={r.id} value={r.id}>{r.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Optional details (links, screenshots URL, context)..."
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="min-h-24"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={submit} disabled={submitting} variant="destructive">
            {submitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Submit report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
    );
};

export default ReportListingDialog;
