import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Eye, Sparkles, ArrowLeft, Atom, Loader2, Lock } from "lucide-react";
import { motion } from "framer-motion";
import { useQuantumAccess } from "@/hooks/useQuantumAccess";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

const QuantumObserver = ({ onBack }: { onBack: () => void }) => {
  const access = useQuantumAccess();
  const hasObserverMode = access.observerModeActive;
  const [observations, setObservations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { if (hasObserverMode) fetchObservations(); }, [hasObserverMode]);

  const fetchObservations = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase
      .from("quantum_observations")
      .select(`*, quantum_posts (base_content, versions_count), quantum_post_versions (content, personality_tone)`)
      .eq("observer_id", user.id)
      .order("observed_at", { ascending: false })
      .limit(20);
    setObservations(data || []);
    setLoading(false);
  };

  const activateObserverMode = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Sign in required", variant: "destructive" }); return; }
    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { product: "observer_mode", productName: "Quantum Observer Mode" },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Checkout failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <>
      <FloatingHowItWorks
        title='Quantum Observer'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Quantum Observer panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Eye className="h-5 w-5 text-blue-400" />
            Observer Mode
          </h2>
          <p className="text-xs text-muted-foreground">See all quantum versions of every post</p>
        </div>
      </div>

      {access.loading ? (
        <div className="flex items-center justify-center p-8 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin mr-2" />Checking access…</div>
      ) : !access.userId ? (
        <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-8 text-center space-y-2">
          <Lock className="h-8 w-8 mx-auto text-blue-400" />
          <p className="text-sm text-muted-foreground">Sign in to access Observer Mode</p>
        </div>
      ) : !hasObserverMode ? (
        <div className="rounded-xl border border-blue-500/20 bg-gradient-to-br from-blue-500/5 to-violet-500/5 p-8 text-center space-y-4">
          <Sparkles className="h-12 w-12 mx-auto text-blue-400" />
          <h3 className="text-xl font-bold">Unlock Observer Mode</h3>
          <p className="text-muted-foreground text-sm">See all reality versions — discover how others experience different quantum states</p>
          <p className="text-2xl font-bold text-blue-400">€19.99/month</p>
          <Button onClick={activateObserverMode} disabled={access.loading} className="bg-blue-600 hover:bg-blue-700">
            <Eye className="h-5 w-5 mr-2" />
            Activate Observer Mode
          </Button>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-2">
            <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">Observer Active</Badge>
            <Badge variant="outline" className="text-[10px]">€19.99/month</Badge>
          </div>

          <div className="space-y-3">
            {loading ? (
              <p className="text-muted-foreground">Loading observations...</p>
            ) : observations.length === 0 ? (
              <p className="text-muted-foreground">No observations yet</p>
            ) : (
              observations.map((obs: any, i: number) => (
                <motion.div
                  key={obs.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4"
                >
                  <p className="text-sm font-semibold">{obs.quantum_post_versions?.content || "Post content"}</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="capitalize text-[10px] border-cyan-500/30 text-cyan-400">{obs.quantum_post_versions?.personality_tone}</Badge>
                    <Badge variant="outline" className="text-[10px]">{obs.quantum_posts?.versions_count || 1} versions total</Badge>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      )}
    </div>
    </>
  );
};

export default QuantumObserver;
