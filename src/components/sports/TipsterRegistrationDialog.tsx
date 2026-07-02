import { useState, useEffect } from "react";
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
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

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
  const [hasPaid, setHasPaid] = useState(false);
  const [checkingSubscription, setCheckingSubscription] = useState(false);
  const [formData, setFormData] = useState({
    displayName: "",
    sport: "",
    bio: "",
    tipPrice: "5",
  });

  // Check if user has active tipster subscription on dialog open
  const checkSubscription = async () => {
    setCheckingSubscription(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.functions.invoke("check-tipster-subscription");
      if (error) throw error;

      if (data?.has_tipster_subscription) {
        setHasPaid(true);
      }
    } catch (error) {
      console.error("Error checking subscription:", error);
    } finally {
      setCheckingSubscription(false);
    }
  };

  // Check subscription when dialog opens
  useEffect(() => {
    if (open) {
      checkSubscription();
    }
  }, [open]);

  const handlePayment = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to become a tipster",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user already has subscription
      const { data: subData } = await supabase.functions.invoke("check-tipster-subscription");
      if (subData?.has_tipster_subscription) {
        setHasPaid(true);
        toast({
          title: "Subscription active",
          description: "Please fill in your tipster details",
        });
        return;
      }

      // Create checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        "create-tipster-checkout"
      );

      if (checkoutError) throw checkoutError;

      toast({
        title: "Redirecting to payment...",
        description: "Pay 19.99 EUR to become a tipster",
      });

      // Redirect to Stripe checkout
      window.open(checkoutData.url, "_blank");
      
      // Start checking for successful payment
      const checkInterval = setInterval(async () => {
        const { data } = await supabase.functions.invoke("check-tipster-subscription");
        if (data?.has_tipster_subscription) {
          clearInterval(checkInterval);
          setHasPaid(true);
          toast({
            title: "Payment successful!",
            description: "Now fill in your tipster details",
          });
        }
      }, 3000);

      // Clear interval after 5 minutes
      setTimeout(() => clearInterval(checkInterval), 300000);
      
    } catch (error) {
      console.error("Error creating checkout:", error);
      toast({
        title: "Error",
        description: "Failed to create payment session. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication required",
          description: "Please sign in to become a tipster",
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

      // Create active tipster profile (no approval needed since they paid)
      const { error: insertError } = await supabase.from("sports_tipsters").insert({
        user_id: user.id,
        display_name: formData.displayName,
        sport_specialization: formData.sport,
        bio: formData.bio || null,
        tip_price: parseFloat(formData.tipPrice),
        status: "active",
        subscription_price: 19.99,
      });

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: "You are now a tipster. Start creating and selling tips!",
      });

      onOpenChange(false);
      navigate("/sports-predictor");
      
      setFormData({
        displayName: "",
        sport: "",
        bio: "",
        tipPrice: "5",
      });
      setHasPaid(false);
    } catch (error) {
      console.error("Error creating tipster profile:", error);
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <><FloatingHowItWorks title="TipsterRegistrationDialog — How it works" steps={[{title:"Open this section",desc:"Access TipsterRegistrationDialog from the menu."},{title:"Explore features",desc:"Browse cards, filters, matches, tools and options."},{title:"Play & interact",desc:"Start matches, buy items, join tournaments (some actions cost credits or EUR)."},{title:"Track progress",desc:"Check leaderboards, trophies and stats over time."}]} />
<Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Become a Professional Tipster</DialogTitle>
          <DialogDescription>
            {!hasPaid 
              ? "First, subscribe to start your tipster journey" 
              : "Complete your tipster profile"}
          </DialogDescription>
        </DialogHeader>

        {checkingSubscription ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !hasPaid ? (
          <div className="space-y-4">
            <div className="bg-muted p-4 rounded-lg space-y-2">
              <p className="font-semibold text-lg">Tipster Subscription</p>
              <p className="text-2xl font-bold text-primary">19.99 EUR/month</p>
              <div className="space-y-1 text-sm mt-4">
                <p>✓ Publish unlimited tips</p>
                <p>✓ Set your own tip prices (5-30 EUR)</p>
                <p>✓ Earn 75% per tip sold</p>
                <p>✓ Platform fee: 25%</p>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button 
                onClick={handlePayment} 
                disabled={loading} 
                className="flex-1"
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Pay & Continue
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name *</Label>
              <Input
                id="displayName"
                value={formData.displayName}
                onChange={(e) =>
                  setFormData({ ...formData, displayName: e.target.value })
                }
                placeholder="Your professional name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sport">Sport Specialization *</Label>
              <Select
                value={formData.sport}
                onValueChange={(value) =>
                  setFormData({ ...formData, sport: value })
                }
                required
              >
                <SelectTrigger id="sport">
                  <SelectValue placeholder="Select your main sport" />
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
              <Label htmlFor="bio">Professional Bio (Optional)</Label>
              <Textarea
                id="bio"
                value={formData.bio}
                onChange={(e) =>
                  setFormData({ ...formData, bio: e.target.value })
                }
                placeholder="Tell users about your expertise and track record..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="tipPrice">Tip Price (EUR) *</Label>
              <Select
                value={formData.tipPrice}
                onValueChange={(value) =>
                  setFormData({ ...formData, tipPrice: value })
                }
                required
              >
                <SelectTrigger id="tipPrice">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 EUR</SelectItem>
                  <SelectItem value="10">10 EUR</SelectItem>
                  <SelectItem value="15">15 EUR</SelectItem>
                  <SelectItem value="20">20 EUR</SelectItem>
                  <SelectItem value="25">25 EUR</SelectItem>
                  <SelectItem value="30">30 EUR</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setHasPaid(false);
                  onOpenChange(false);
                }}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading} className="flex-1">
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Complete Registration
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  </>
  );
}
