import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Flag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  targetType: "comment" | "submission" | "user";
  targetId: string;
  reporterId: string | null;
  size?: "sm" | "icon";
  className?: string;
}

const REASONS = ["spam", "harassment", "hate_speech", "sexual_content", "underage", "violence", "other"];

const ReportButton = ({ targetType, targetId, reporterId, size = "icon", className }: Props) => {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!reporterId) { toast.error("Sign in to report"); return; }
    setBusy(true);
    try {
      const { error } = await (supabase as any).from("talent_reports").insert({
        reporter_id: reporterId, target_type: targetType, target_id: targetId, reason, details: details.trim() || null,
      });
      if (error) throw error;
      toast.success("Report submitted. Thanks for helping keep Megatalent safe.");
      setOpen(false); setDetails(""); setReason("spam");
    } catch (e: any) { toast.error(e?.message || "Couldn't submit report"); }
    finally { setBusy(false); }
  };

  return (
    <>
      <FloatingHowItWorks title={"Report Button - How it works"} steps={[{ title: 'Open', desc: 'Access the Report Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Report Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size={size === "icon" ? "icon" : "sm"} className={className} title="Report" aria-label="Report">
          <Flag className="h-3.5 w-3.5" />
          {size === "sm" && <span className="ml-1 text-xs">Report</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader><DialogTitle className="text-base">Report {targetType}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
            <SelectContent className="bg-background z-50">
              {REASONS.map(r => <SelectItem key={r} value={r}>{r.replace("_", " ")}</SelectItem>)}
            </SelectContent>
          </Select>
          <Textarea value={details} onChange={e => setDetails(e.target.value.slice(0, 500))}
            placeholder="Optional details (max 500 chars)" className="min-h-[80px] text-sm" />
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" size="sm" onClick={() => setOpen(false)} disabled={busy}>Cancel</Button>
            <Button size="sm" onClick={submit} disabled={busy} className="gap-1">
              {busy && <Loader2 className="h-3.5 w-3.5 animate-spin" />} Submit report
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
    </>
  );
};

export default ReportButton;
