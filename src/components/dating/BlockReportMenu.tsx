import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { MoreVertical, Shield, Flag, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  targetUserId: string;
  targetName: string;
  onBlocked?: () => void;
}

const REASONS = [
  "Inappropriate photos",
  "Harassment / abusive behavior",
  "Fake profile / scam",
  "Underage",
  "Spam / advertising",
  "Other",
];

export const BlockReportMenu = ({ targetUserId, targetName, onBlocked }: Props) => {
  const { toast } = useToast();
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reason, setReason] = useState(REASONS[0]);
  const [details, setDetails] = useState("");
  const [busy, setBusy] = useState(false);

  const submitReport = async () => {
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    const { error } = await supabase.from("dating_reports").insert({
      reporter_id: user.id, reported_id: targetUserId, reason, details: details || null,
    });
    setBusy(false);
    if (error) { toast({ title: "Report failed", description: error.message, variant: "destructive" }); return; }
    toast({ title: "Report submitted", description: "Our team will review within 24h." });
    setReportOpen(false);
    setDetails("");
  };

  const confirmBlock = async () => {
    setBusy(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setBusy(false); return; }
    const { error } = await supabase.from("dating_blocks").insert({
      blocker_id: user.id, blocked_id: targetUserId,
    });
    setBusy(false);
    if (error && !error.message.includes("duplicate")) {
      toast({ title: "Block failed", description: error.message, variant: "destructive" }); return;
    }
    toast({ title: `${targetName} blocked`, description: "They won't see your profile anymore." });
    setBlockOpen(false);
    onBlocked?.();
  };

  return (
    <>
      <FloatingHowItWorks
        title={"Block Report Menu"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-9 w-9"><MoreVertical className="h-5 w-5" /></Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setReportOpen(true)} className="text-amber-600">
            <Flag className="w-4 h-4 mr-2" />Report
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setBlockOpen(true)} className="text-destructive">
            <Shield className="w-4 h-4 mr-2" />Block user
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Report {targetName}</DialogTitle>
            <DialogDescription>Reports are reviewed by our moderation team.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {REASONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
              </SelectContent>
            </Select>
            <Textarea placeholder="Additional details (optional)" value={details}
              onChange={e => setDetails(e.target.value)} className="min-h-24" maxLength={500} />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setReportOpen(false)}>Cancel</Button>
            <Button onClick={submitReport} disabled={busy} variant="destructive">
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Submit Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={blockOpen} onOpenChange={setBlockOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Block {targetName}?</DialogTitle>
            <DialogDescription>
              They won't be able to see your profile or message you. You can unblock them later from Settings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBlockOpen(false)}>Cancel</Button>
            <Button onClick={confirmBlock} disabled={busy} variant="destructive">
              {busy && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Block
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
