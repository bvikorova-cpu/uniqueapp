import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface TipsterRegistrationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SPORTS = [
  "Football/Soccer",
  "Basketball",
  "Tennis",
  "Ice Hockey",
  "American Football",
  "Baseball",
  "Volleyball",
  "Handball",
  "Cricket",
  "Rugby",
  "Mixed Sports"
];

export function TipsterRegistrationDialog({
  open,
  onOpenChange,
}: TipsterRegistrationDialogProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    sport: "",
    bio: "",
    tipPrice: "5",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to apply as a tipster",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user is already a tipster
      const { data: existingTipster } = await supabase
        .from("sports_tipsters")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingTipster) {
        toast({
          title: "Already registered",
          description: "You are already registered as a tipster",
        });
        onOpenChange(false);
        return;
      }

      // Create tipster profile
      const { error } = await supabase.from("sports_tipsters").insert({
        user_id: user.id,
        display_name: formData.displayName,
        sport_specialization: formData.sport,
        bio: formData.bio || null,
        tip_price: parseFloat(formData.tipPrice),
        status: "pending",
        subscription_price: 19.99, // Default subscription price
      });

      if (error) throw error;

      toast({
        title: "Application submitted!",
        description: "Your tipster application has been submitted for review. You'll be notified once approved.",
      });

      onOpenChange(false);
      setFormData({
        displayName: "",
        sport: "",
        bio: "",
        tipPrice: "5",
      });
    } catch (error) {
      console.error("Error submitting tipster application:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Apply as Professional Tipster</DialogTitle>
          <DialogDescription>
            Join our platform and share your expertise with subscribers. Fill out the form below to apply.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="displayName">
              Display Name <span className="text-destructive">*</span>
            </Label>
            <Input
              id="displayName"
              placeholder="Your professional name"
              value={formData.displayName}
              onChange={(e) =>
                setFormData({ ...formData, displayName: e.target.value })
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sport">
              Sport Specialization <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.sport}
              onValueChange={(value) =>
                setFormData({ ...formData, sport: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your sport" />
              </SelectTrigger>
              <SelectContent>
                {SPORTS.map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio / Experience</Label>
            <Textarea
              id="bio"
              placeholder="Tell us about your experience, expertise, and why you'd be a great tipster..."
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tipPrice">
              Price per Tip (€) <span className="text-destructive">*</span>
            </Label>
            <Select
              value={formData.tipPrice}
              onValueChange={(value) =>
                setFormData({ ...formData, tipPrice: value })
              }
              required
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 5, 7, 10, 15, 20, 25, 30, 40, 50].map((price) => (
                  <SelectItem key={price} value={price.toString()}>
                    €{price}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              You'll earn 75% of each tip sold
            </p>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h4 className="font-semibold mb-2">What happens next?</h4>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>• Your application will be reviewed by our team</li>
              <li>• We'll verify your experience and credentials</li>
              <li>• Once approved, you can start publishing predictions</li>
              <li>• You'll earn 75% from every tip sold</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
