import { AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AdultWarningModalProps {
  open: boolean;
  onAccept: () => void;
  onDecline: () => void;
}

export function AdultWarningModal({ open, onAccept, onDecline }: AdultWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && onDecline()}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-border/50">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 rounded-full bg-destructive/10">
              <AlertTriangle className="h-10 w-10 text-destructive" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl font-black">
            Age Restriction Notice
          </DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-4">
            <p className="text-base font-semibold text-foreground">
              This section is for users aged 16 and over (16+)
            </p>
            <p className="text-sm text-muted-foreground">
              Anonymous Date is a dating platform designed exclusively for users aged 16 and over.
              By continuing, you confirm that:
            </p>
            <div className="text-sm text-left space-y-2">
              {[
                "You are at least 16 years old",
                "You understand this is an anonymous dating platform",
                "You agree to respectful communication",
                "You accept the platform's terms and conditions",
              ].map((item) => (
                <div key={item} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/30">
                  <Shield className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">{item}</span>
                </div>
              ))}
            </div>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2 mt-2">
          <Button variant="outline" onClick={onDecline} className="w-full sm:w-auto">
            I'm Under 16 / Decline
          </Button>
          <Button onClick={onAccept} className="w-full sm:w-auto">
            I'm 16+ / Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
