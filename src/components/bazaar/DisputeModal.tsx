import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AlertTriangle, Upload, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface DisputeModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string;
  onDisputeOpened?: () => void;
}

const disputeReasons = [
  { value: "not_received", label: "Item not received" },
  { value: "not_as_described", label: "Item not as described" },
  { value: "damaged", label: "Item arrived damaged" },
  { value: "wrong_item", label: "Wrong item received" },
  { value: "other", label: "Other issue" },
];

export function DisputeModal({ open, onOpenChange, orderId, onDisputeOpened }: DisputeModalProps) {
  const [reason, setReason] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!reason) {
      toast.error("Please select a reason for your dispute");
      return;
    }

    if (!description.trim()) {
      toast.error("Please provide details about your issue");
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("open-dispute", {
        body: {
          orderId,
          reason,
          description: description.trim(),
        },
      });

      if (error) throw error;

      toast.success("Dispute opened successfully", {
        description: "Our team will review your case within 24-48 hours.",
      });
      
      onOpenChange(false);
      onDisputeOpened?.();
    } catch (error) {
      console.error("Error opening dispute:", error);
      toast.error("Failed to open dispute", {
        description: error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Dispute Modal works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-destructive" />
            Open a Dispute
          </DialogTitle>
          <DialogDescription>
            If you have an issue with your order, our team will help resolve it.
            Your funds are protected until the dispute is resolved.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-3">
            <Label>What's the issue?</Label>
            <RadioGroup value={reason} onValueChange={setReason}>
              {disputeReasons.map((item) => (
                <div key={item.value} className="flex items-center space-x-2">
                  <RadioGroupItem value={item.value} id={item.value} />
                  <Label htmlFor={item.value} className="font-normal cursor-pointer">
                    {item.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Describe your issue in detail</Label>
            <Textarea
              id="description"
              placeholder="Please provide as much detail as possible about the problem..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              Include relevant details like dates, communication with seller, etc.
            </p>
          </div>

          <div className="p-3 rounded-lg bg-muted/50">
            <p className="text-sm text-muted-foreground">
              <strong>What happens next:</strong>
            </p>
            <ul className="text-sm text-muted-foreground mt-2 space-y-1">
              <li>• Your payment remains protected</li>
              <li>• We'll notify the seller about the dispute</li>
              <li>• Our team will review within 24-48 hours</li>
              <li>• You may be asked for additional information</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={loading} variant="destructive">
            {loading ? "Opening Dispute..." : "Open Dispute"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
    );
}

export default DisputeModal;
