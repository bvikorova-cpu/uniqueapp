import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Flag, Shield, Loader2, UserX } from "lucide-react";

const REPORT_REASONS = [
  { value: "harassment", label: "Harassment or bullying" },
  { value: "sexual_content", label: "Unwanted sexual content" },
  { value: "minor", label: "Suspected minor (under 16)" },
  { value: "scam", label: "Scam, spam or solicitation" },
  { value: "hate_speech", label: "Hate speech or discrimination" },
  { value: "threats", label: "Threats or violence" },
  { value: "impersonation", label: "Impersonation or fake identity" },
  { value: "other", label: "Other safety concern" },
];

interface Props {
  blockedByMe: boolean;
  submitting: boolean;
  onReport: (params: { reason: string; details?: string }) => Promise<boolean>;
  onBlock: () => Promise<boolean>;
  onUnblock: () => Promise<boolean>;
  onBlocked?: () => void;
  className?: string;
}

export function ChatSafetyMenu({
  blockedByMe,
  submitting,
  onReport,
  onBlock,
  onUnblock,
  onBlocked,
  className,
}: Props) {
  const [reportOpen, setReportOpen] = useState(false);
  const [blockOpen, setBlockOpen] = useState(false);
  const [reason, setReason] = useState(REPORT_REASONS[0].value);
  const [details, setDetails] = useState("");

  const handleSubmitReport = async () => {
    const ok = await onReport({ reason, details });
    if (ok) {
      setReportOpen(false);
      setDetails("");
      setReason(REPORT_REASONS[0].value);
    }
  };

  const handleConfirmBlock = async () => {
    const ok = await onBlock();
    if (ok) {
      setBlockOpen(false);
      onBlocked?.();
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-100 border border-emerald-400/40 text-[10px] font-semibold uppercase tracking-wide ${className ?? ""}`}
            title="Safety tools"
            aria-label="Open safety menu"
          >
            <Shield className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Safety</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-52">
          <DropdownMenuLabel className="flex items-center gap-2 text-xs">
            <Shield className="h-3.5 w-3.5 text-primary" /> Safety
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => setReportOpen(true)} className="text-sm">
            <Flag className="h-4 w-4 mr-2 text-amber-500" />
            Report this match
          </DropdownMenuItem>
          {blockedByMe ? (
            <DropdownMenuItem onClick={() => onUnblock()} className="text-sm">
              <UserX className="h-4 w-4 mr-2 text-emerald-500" />
              Unblock user
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => setBlockOpen(true)}
              className="text-sm text-destructive focus:text-destructive"
            >
              <UserX className="h-4 w-4 mr-2" />
              Block user
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Report Dialog */}
      <Dialog open={reportOpen} onOpenChange={setReportOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Flag className="h-5 w-5 text-amber-500" />
              Report this match
            </DialogTitle>
            <DialogDescription>
              Your report is confidential. The other person will not be notified.
              Our safety team reviews reports within 24 hours.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide">Reason</Label>
              <RadioGroup value={reason} onValueChange={setReason} className="space-y-1.5">
                {REPORT_REASONS.map((r) => (
                  <div key={r.value} className="flex items-center space-x-2">
                    <RadioGroupItem value={r.value} id={`reason-${r.value}`} />
                    <Label htmlFor={`reason-${r.value}`} className="text-sm font-normal cursor-pointer">
                      {r.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="space-y-2">
              <Label className="text-xs font-bold uppercase tracking-wide">
                Details <span className="text-muted-foreground font-normal">(optional)</span>
              </Label>
              <Textarea
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 1000))}
                placeholder="Add any context that helps our moderators…"
                rows={4}
                maxLength={1000}
              />
              <p className="text-[10px] text-muted-foreground text-right">{details.length}/1000</p>
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="ghost" onClick={() => setReportOpen(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={handleSubmitReport} disabled={submitting} className="gap-2">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Flag className="h-4 w-4" />}
              Submit report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Block confirmation */}
      <AlertDialog open={blockOpen} onOpenChange={setBlockOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <UserX className="h-5 w-5 text-destructive" />
              Block this user?
            </AlertDialogTitle>
            <AlertDialogDescription>
              They will no longer be able to message you. This chat will be locked
              and the match will be hidden from your matches list. You can unblock
              them later from this menu.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmBlock}
              disabled={submitting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Block user
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
