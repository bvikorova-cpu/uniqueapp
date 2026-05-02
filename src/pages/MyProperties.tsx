import { PropertyDashboard } from "@/components/property/PropertyDashboard";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Building2 } from "lucide-react";
import { motion } from "framer-motion";

export default function MyProperties() {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const payment = searchParams.get('payment');
    const propertyId = searchParams.get('property_id');
    const sessionId = searchParams.get('session_id');

    if (payment === 'success' && propertyId && sessionId) {
      const verifyPayment = async () => {
        try {
          const { error } = await supabase.functions.invoke('verify-lead-boost-payment', {
            body: { sessionId, propertyId }
          });
          if (error) throw error;
          toast({ title: "Lead Boost Activated!", description: "Your property is being promoted to 1000+ potential buyers via email." });
          window.history.replaceState({}, '', '/my-properties');
        } catch (error) {
          console.error('Error verifying payment:', error);
          toast({ variant: "destructive", title: "Verification Error", description: "Payment received but campaign failed to start. Please contact support." });
        }
      };
      verifyPayment();
    } else if (payment === 'cancelled' || payment === 'canceled') {
      toast({ variant: "destructive", title: "Payment Cancelled", description: "Your Lead Boost purchase was cancelled." });
      window.history.replaceState({}, '', '/my-properties');
    }
  }, [searchParams, toast]);

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-24">
        <Button variant="ghost" onClick={() => navigate("/property-marketplace")} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Marketplace
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Mini Hero */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-sky-600 to-blue-700 p-6 mb-8">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl" />
            <div className="relative z-10 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">My Properties</h1>
                <p className="text-white/70 text-sm">Manage your property listings and add virtual tours</p>
              </div>
            </div>
          </div>
        </motion.div>

        <PropertyDashboard />
      </div>
    </div>
  );
}
