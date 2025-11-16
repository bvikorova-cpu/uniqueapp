import { PropertyDashboard } from "@/components/property/PropertyDashboard";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export default function MyProperties() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const payment = searchParams.get('payment');
    const propertyId = searchParams.get('property_id');
    const sessionId = searchParams.get('session_id');

    if (payment === 'success' && propertyId && sessionId) {
      // Verify payment and start campaign
      const verifyPayment = async () => {
        try {
          const { error } = await supabase.functions.invoke('verify-lead-boost-payment', {
            body: { 
              sessionId,
              propertyId 
            }
          });

          if (error) throw error;

          toast({
            title: "Lead Boost Activated!",
            description: "Your property is being promoted to 1000+ potential buyers via email.",
          });

          // Clear URL parameters
          window.history.replaceState({}, '', '/my-properties');
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast({
            variant: "destructive",
            title: "Verification Error",
            description: "Payment received but campaign failed to start. Please contact support.",
          });
        }
      };

      verifyPayment();
    } else if (payment === 'cancelled') {
      toast({
        variant: "destructive",
        title: "Payment Cancelled",
        description: "Your Lead Boost purchase was cancelled.",
      });
      
      // Clear URL parameters
      window.history.replaceState({}, '', '/my-properties');
    }
  }, [searchParams, toast]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Properties</h1>
        <p className="text-muted-foreground">
          Manage your property listings and add virtual tours
        </p>
      </div>

      <PropertyDashboard />
    </div>
  );
}
