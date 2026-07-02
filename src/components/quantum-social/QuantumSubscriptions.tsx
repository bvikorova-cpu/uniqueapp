import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Zap, Check, X, ArrowLeft, Settings } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Subscription {
  id: string;
  subscription_type: string;
  price: number;
  status: string;
  started_at: string;
  expires_at: string | null;
}

const QuantumSubscriptions = ({ onBack }: { onBack: () => void }) => {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchSubscriptions(); }, []);

  const fetchSubscriptions = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("quantum_subscriptions").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setSubscriptions(data || []);
    setLoading(false);
  };

  const cancelSubscription = async (subscriptionId: string) => {
    const { error } = await supabase.from("quantum_subscriptions").update({ status: "cancelled" }).eq("id", subscriptionId);
    if (!error) { toast({ title: "Success", description: "Subscription cancelled" }); fetchSubscriptions(); }
  };

  const plans = [
    { type: "quantum_profiles", name: "Quantum Profiles", price: "€12.99/month", features: ["3 reality versions", "Personalized content for each viewer", "Multiple personality tones"], color: "cyan" },
    { type: "observer_mode", name: "Observer Mode", price: "€19.99/month", features: ["See all quantum versions", "Discover different realities", "Access observation history"], color: "blue" },
    { type: "quantum_entanglement", name: "Quantum Entanglement", price: "€9.99/month", features: ["Connect with someone", "Shared reality experience", "Always see same versions"], color: "emerald" },
  ];

  const openCustomerPortal = async () => {
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Portal error", description: e.message, variant: "destructive" });
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Quantum Subscriptions'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Quantum Subscriptions panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Zap className="h-5 w-5 text-pink-400" />
            Subscriptions
          </h2>
        </div>
        {subscriptions.some(s => s.status === "active") && (
          <Button variant="outline" size="sm" onClick={openCustomerPortal}>
            <Settings className="h-4 w-4 mr-2" />Manage in Stripe
          </Button>
        )}
      </div>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {plans.map((plan, i) => (
          <motion.div
            key={plan.type}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className={`rounded-xl border border-${plan.color}-500/20 bg-gradient-to-br from-${plan.color}-500/5 to-transparent p-5 space-y-3`}
          >
            <h3 className="font-semibold">{plan.name}</h3>
            <Badge variant="outline" className={`text-[10px] border-${plan.color}-500/30 text-${plan.color}-400`}>{plan.price}</Badge>
            <div className="space-y-2">
              {plan.features.map(f => (
                <div key={f} className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-400 mt-0.5" />
                  <span className="text-xs">{f}</span>
                </div>
              ))}
            </div>
            <Button className={`w-full bg-${plan.color}-600 hover:bg-${plan.color}-700`} size="sm" onClick={async () => {
              try {
                const { data, error } = await supabase.functions.invoke("create-checkout", { body: { product: plan.type, productName: plan.name } });
                if (error) throw error;
                if (data?.url) window.open(data.url, "_blank");
              } catch (e: any) {
                toast({ title: "Checkout failed", description: e.message, variant: "destructive" });
              }
            }}>
              <Zap className="h-4 w-4 mr-2" />Subscribe
            </Button>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-white/2 p-5">
        <h3 className="font-semibold mb-4">Active Subscriptions</h3>
        {loading ? (
          <p className="text-muted-foreground text-sm">Loading...</p>
        ) : subscriptions.length === 0 ? (
          <p className="text-muted-foreground text-sm">No active subscriptions</p>
        ) : (
          <div className="space-y-3">
            {subscriptions.map((sub) => (
              <div key={sub.id} className="rounded-xl border border-white/10 bg-white/2 p-4 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-sm capitalize">{sub.subscription_type.replace(/_/g, ' ')}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant={sub.status === "active" ? "default" : "secondary"} className="text-[10px] capitalize">{sub.status}</Badge>
                    <span className="text-xs text-muted-foreground">€{sub.price.toFixed(2)}/month</span>
                  </div>
                  {sub.expires_at && <p className="text-xs text-muted-foreground mt-1">Expires: {new Date(sub.expires_at).toLocaleDateString()}</p>}
                </div>
                {sub.status === "active" && (
                  <Button variant="destructive" size="sm" onClick={() => cancelSubscription(sub.id)}>
                    <X className="h-4 w-4 mr-1" />Cancel
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
    </>
  );
};

export default QuantumSubscriptions;
