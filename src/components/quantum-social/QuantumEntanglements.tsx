import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Link as LinkIcon, Zap, ArrowLeft, Lock, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useQuantumAccess } from "@/hooks/useQuantumAccess";

interface Entanglement {
  id: string;
  user_id_1: string;
  user_id_2: string;
  entanglement_strength: number;
  shared_reality: boolean;
  created_at: string;
  expires_at: string;
}

const QuantumEntanglements = ({ onBack }: { onBack: () => void }) => {
  const [entanglements, setEntanglements] = useState<Entanglement[]>([]);
  const [targetUserId, setTargetUserId] = useState("");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchEntanglements(); }, []);

  const fetchEntanglements = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("quantum_entanglements").select("*").or(`user_id_1.eq.${user.id},user_id_2.eq.${user.id}`).order("created_at", { ascending: false });
    setEntanglements(data || []);
    setLoading(false);
  };

  const createEntanglement = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Authentication Required", variant: "destructive" }); return; }
    if (!targetUserId) { toast({ title: "Missing Information", description: "Please enter a user ID", variant: "destructive" }); return; }

    try {
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          product: "quantum_entanglement",
          productName: "Quantum Entanglement",
          metadata: { target_user_id: targetUserId },
        },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (e: any) {
      toast({ title: "Checkout failed", description: e.message, variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Users className="h-5 w-5 text-emerald-400" />
            Quantum Entanglements
          </h2>
        </div>
        <Badge variant="outline" className="border-emerald-500/30 text-emerald-400">€9.99/month each</Badge>
      </div>

      <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-5 space-y-4">
        <div className="flex items-center gap-2">
          <LinkIcon className="h-5 w-5 text-emerald-400" />
          <h3 className="font-semibold">Create New Entanglement</h3>
        </div>
        <p className="text-xs text-muted-foreground">Connect with someone — you'll always see each other's same reality version</p>
        <div className="flex gap-2">
          <Input placeholder="Enter user ID to entangle with" value={targetUserId} onChange={(e) => setTargetUserId(e.target.value)} className="border-emerald-500/20" />
          <Button onClick={createEntanglement} className="bg-emerald-600 hover:bg-emerald-700">
            <Zap className="h-4 w-4 mr-2" />Entangle (€9.99)
          </Button>
        </div>
      </div>

      <div className="space-y-3">
        <h3 className="font-semibold">Active Entanglements</h3>
        {loading ? (
          <p className="text-muted-foreground">Loading entanglements...</p>
        ) : entanglements.length === 0 ? (
          <p className="text-muted-foreground">No entanglements yet. Create your first quantum connection!</p>
        ) : (
          entanglements.map((ent, i) => (
            <motion.div
              key={ent.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="rounded-xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 p-4"
            >
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-400" />
                <span className="font-semibold text-sm">Entanglement #{ent.id.slice(0, 8)}</span>
              </div>
              <div className="flex items-center gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] border-emerald-500/30 text-emerald-400">
                  Strength: {(ent.entanglement_strength * 100).toFixed(0)}%
                </Badge>
                {ent.shared_reality && <Badge variant="outline" className="text-[10px] border-cyan-500/30 text-cyan-400">Shared Reality</Badge>}
              </div>
              <p className="text-xs text-muted-foreground mt-2">Expires: {new Date(ent.expires_at).toLocaleDateString()}</p>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default QuantumEntanglements;
