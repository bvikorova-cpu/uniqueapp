import { useState } from "react";
import { AlertTriangle, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  onAccept: (dob: string) => void;
  onDecline: () => void;
}

const MIN_AGE = 16;

function calcAge(iso: string): number {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return -1;
  const now = new Date();
  let age = now.getFullYear() - d.getFullYear();
  const m = now.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < d.getDate())) age--;
  return age;
}

export function AdultWarningModal({ open, onAccept, onDecline }: AdultWarningModalProps) {
  const [dob, setDob] = useState("");
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().slice(0, 10);

  const handleAccept = () => {
    if (!dob) {
      setError("Please enter your date of birth.");
      return;
    }
    const age = calcAge(dob);
    if (age < 0) {
      setError("Invalid date.");
      return;
    }
    if (age < MIN_AGE) {
      setError(`You must be at least ${MIN_AGE} years old to use Anonymous Date.`);
      return;
    }
    setError(null);
    onAccept(dob);
  };

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
            <span className="block text-base font-semibold text-foreground">
              This section is for users aged {MIN_AGE} and over ({MIN_AGE}+)
            </span>
            <span className="block text-sm text-muted-foreground">
              Anonymous Date is a dating platform designed exclusively for users
              aged {MIN_AGE} and over. Please verify your date of birth to continue.
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-2">
          <Label htmlFor="anon-dob" className="text-sm font-semibold">
            Date of birth
          </Label>
          <Input
            id="anon-dob"
            type="date"
            value={dob}
            max={today}
            onChange={(e) => {
              setDob(e.target.value);
              setError(null);
            }}
            className="bg-muted/10 border-border/50"
          />
          {error && (
            <p className="text-xs text-destructive font-medium">{error}</p>
          )}
          <div className="text-xs text-muted-foreground space-y-1 pt-2">
            {[
              `You confirm you are at least ${MIN_AGE} years old`,
              "You agree to respectful, anonymous communication",
              "You accept the platform's terms and conditions",
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 p-2 rounded-lg bg-muted/20 border border-border/30">
                <Shield className="h-3.5 w-3.5 text-primary flex-shrink-0" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-2 mt-2">
          <Button variant="outline" onClick={onDecline} className="w-full sm:w-auto">
            Decline
          </Button>
          <Button onClick={handleAccept} className="w-full sm:w-auto" disabled={!dob}>
            Verify & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
