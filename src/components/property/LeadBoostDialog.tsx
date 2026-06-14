import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, TrendingUp, Mail, Users } from "lucide-react";

interface LeadBoostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function LeadBoostDialog({ open, onOpenChange }: LeadBoostDialogProps) {
  const [selectedProperty, setSelectedProperty] = useState<string>("");
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Load user's properties when dialog opens
  const loadProperties = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('properties')
        .select('id, title, status')
        .eq('user_id', user.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error loading properties:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    if (!selectedProperty) return;

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          variant: "destructive",
          title: "Authentication required",
          description: "Please sign in to purchase lead boost.",
        });
        return;
      }

      // Edge function creates the pending purchase record + Stripe session atomically
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        'create-lead-boost-payment',
        {
          body: { propertyId: selectedProperty }
        }
      );

      if (checkoutError) throw checkoutError;

      if (checkoutData?.url) {
        toast({
          title: "Redirecting to Payment",
          description: "Complete your payment to activate Lead Boost.",
        });
        onOpenChange(false);
        window.location.href = checkoutData.url;
      } else {
        throw new Error("No checkout URL received");
      }

    } catch (error) {
      console.error('Error purchasing lead boost:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process purchase. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(newOpen) => {
      if (newOpen) loadProperties();
      onOpenChange(newOpen);
    }}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lead Boost - €19
          </DialogTitle>
          <DialogDescription>
            Promote your property to 1000+ potential buyers via email
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-primary" />
              <span>Email campaign to qualified buyers</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-primary" />
              <span>1000+ potential buyers in our network</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Increase visibility by up to 300%</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="property">Select Property</Label>
              <Select value={selectedProperty} onValueChange={setSelectedProperty}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a property to boost" />
                </SelectTrigger>
                <SelectContent>
                  {properties.map((property) => (
                    <SelectItem key={property.id} value={property.id}>
                      {property.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {properties.length === 0 && (
                <p className="text-xs text-muted-foreground">
                  You need to have at least one active property listing to use Lead Boost
                </p>
              )}
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={loading || !selectedProperty || properties.length === 0}
              >
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Purchase Lead Boost - €19
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
