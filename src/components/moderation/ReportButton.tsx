import { useState } from "react";
import { Flag, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ReportButtonProps {
  contentId: string;
  contentType: "post" | "comment" | "message" | "profile" | "image" | "video";
  reportedUserId: string;
  variant?: "ghost" | "outline" | "default";
  size?: "sm" | "default" | "icon";
}

const violationTypes = [
  { value: "spam", label: "Spam" },
  { value: "harassment", label: "Harassment / Bullying" },
  { value: "hate_speech", label: "Hate Speech" },
  { value: "violence", label: "Violence / Threats" },
  { value: "adult_content", label: "Adult Content" },
  { value: "misinformation", label: "Misinformation" },
  { value: "scam", label: "Scam / Fraud" },
  { value: "copyright", label: "Copyright Violation" },
  { value: "impersonation", label: "Impersonation" },
  { value: "other", label: "Other" },
];

export const ReportButton = ({
  contentId,
  contentType,
  reportedUserId,
  variant = "ghost",
  size = "icon",
}: ReportButtonProps) => {
  const [open, setOpen] = useState(false);
  const [violationType, setViolationType] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!violationType) {
      toast({
        title: "Error",
        description: "Please select a reason for reporting.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to report content.",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("content_reports").insert({
        reporter_id: user.id,
        reported_user_id: reportedUserId,
        content_id: contentId,
        content_type: contentType,
        violation_type: violationType as any,
        description: description || null,
      });

      if (error) throw error;

      toast({
        title: "Report Submitted",
        description: "Thank you for helping keep our community safe.",
      });
      
      setOpen(false);
      setViolationType("");
      setDescription("");
    } catch (error: any) {
      console.error("Error submitting report:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit report.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Report Button - How it works"} steps={[{ title: 'Open', desc: 'Access the Report Button section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Report Button.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="text-muted-foreground hover:text-destructive">
          <Flag className="h-4 w-4" />
          {size !== "icon" && <span className="ml-2">Report</span>}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Report Content</DialogTitle>
          <DialogDescription>
            Help us understand what's wrong with this content. Your report is anonymous.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="reason">Reason for reporting</Label>
            <Select value={violationType} onValueChange={setViolationType}>
              <SelectTrigger>
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {violationTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Additional details (optional)</Label>
            <Textarea
              id="description"
              placeholder="Provide any additional context..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Submit Report
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
    </>
  );
};
