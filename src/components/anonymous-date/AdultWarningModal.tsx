import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex justify-center mb-4">
            <div className="bg-red-100 p-4 rounded-full">
              <AlertTriangle className="h-12 w-12 text-red-600" />
            </div>
          </div>
          <DialogTitle className="text-center text-2xl">
            Adult Content Warning
          </DialogTitle>
          <DialogDescription className="text-center space-y-4 pt-4">
            <p className="text-base font-semibold">
              This section is for adults only (18+)
            </p>
            <p className="text-sm">
              Anonymous Date is a dating platform designed exclusively for adults aged 18 and over.
              By continuing, you confirm that:
            </p>
            <ul className="text-sm text-left space-y-2 pl-6">
              <li>• You are at least 18 years old</li>
              <li>• You understand this is an anonymous dating platform</li>
              <li>• You agree to respectful and appropriate communication</li>
              <li>• You accept the platform's terms and conditions</li>
            </ul>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2 sm:gap-0">
          <Button
            variant="outline"
            onClick={onDecline}
            className="w-full sm:w-auto"
          >
            I'm Under 18 / Decline
          </Button>
          <Button
            onClick={onAccept}
            className="w-full sm:w-auto bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
          >
            I'm 18+ / Accept & Continue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
