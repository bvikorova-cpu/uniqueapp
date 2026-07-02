import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Shield, Eye, EyeOff, CheckCheck, AlertTriangle, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  incognito: boolean;
  readReceipts: boolean;
  onTogglePrivacy: (patch: { incognito?: boolean; read_receipts_enabled?: boolean }) => Promise<void>;
  onOpenBlocked: () => void;
}

export const SafetyCenter = ({ open, onOpenChange, incognito, readReceipts, onTogglePrivacy, onOpenBlocked }: Props) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <FloatingHowItWorks
        title={"Safety Center"}
        intro={"Here's how to use this feature."}
        steps={[
          { title: "Open the tool", desc: "Access it from its parent module in the menu." },
          { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
          { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
          { title: "Review history", desc: "Come back anytime to continue where you left off." },
        ]}
      />

      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Shield className="h-5 w-5 text-primary" /> Safety Center</DialogTitle>
          <DialogDescription>Control your privacy and safety on Dating</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 mt-2">
          <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30">
            <div className="space-y-1">
              <Label className="flex items-center gap-2 text-sm font-medium">
                {incognito ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} Incognito mode
              </Label>
              <p className="text-xs text-muted-foreground">Hide your profile from the swipe deck. Only people you like will see you.</p>
            </div>
            <Switch checked={incognito} onCheckedChange={(v) => onTogglePrivacy({ incognito: v })} />
          </div>

          <div className="flex items-start justify-between gap-3 p-3 rounded-lg border border-border bg-muted/30">
            <div className="space-y-1">
              <Label className="flex items-center gap-2 text-sm font-medium">
                <CheckCheck className="h-4 w-4" /> Read receipts
              </Label>
              <p className="text-xs text-muted-foreground">Let your matches see when you've read their messages.</p>
            </div>
            <Switch checked={readReceipts} onCheckedChange={(v) => onTogglePrivacy({ read_receipts_enabled: v })} />
          </div>

          <Button variant="outline" className="w-full justify-start gap-2" onClick={onOpenBlocked}>
            <Lock className="h-4 w-4" /> Manage blocked users
          </Button>

          <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
            <div className="flex items-center gap-2 text-sm font-medium text-amber-500"><AlertTriangle className="h-4 w-4" /> Safety tips</div>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
              <li>Never share financial info, passwords or codes.</li>
              <li>Meet first in a public place. Tell a friend where you'll be.</li>
              <li>Report and block anyone who pressures or threatens you.</li>
              <li>AI moderation scans messages for harassment in real-time.</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
