import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Atom, Settings, ArrowLeft } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface QuantumProfileData {
  quantum_mode: string;
  reality_versions: number;
  observer_mode_active: boolean;
  is_premium: boolean;
}

const QuantumProfile = ({ onBack }: { onBack: () => void }) => {
  const [profile, setProfile] = useState<QuantumProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await supabase.from("quantum_profiles").select("*").eq("user_id", user.id).single();
    if (data) setProfile(data);
    setLoading(false);
  };

  const createProfile = async (mode: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const versions = mode === "triple" ? 3 : mode === "unlimited" ? 5 : 1;
    const { error } = await supabase.from("quantum_profiles").insert([{ user_id: user.id, quantum_mode: mode, reality_versions: versions }]);
    if (!error) { toast({ title: "Success", description: "Quantum profile created" }); fetchProfile(); }
  };

  const updateMode = async (mode: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const versions = mode === "triple" ? 3 : mode === "unlimited" ? 5 : 1;
    const { error } = await supabase.from("quantum_profiles").update({ quantum_mode: mode, reality_versions: versions }).eq("user_id", user.id);
    if (!error) { toast({ title: "Success", description: "Quantum mode updated" }); fetchProfile(); }
  };

  if (loading) return <p className="text-muted-foreground">Loading profile...</p>;

  return (
    <>
      <FloatingHowItWorks
        title='Quantum Profile'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Quantum Profile panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="h-5 w-5" /></Button>
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Settings className="h-5 w-5 text-cyan-400" />
          Quantum Profile
        </h2>
      </div>

      {!profile ? (
        <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
          <h3 className="font-semibold mb-4">Choose Your Quantum Mode</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { mode: "single", label: "Standard", versions: "1 Version", price: "Free", border: "border-white/10" },
              { mode: "triple", label: "Quantum", versions: "3 Versions", price: "€12.99/month", border: "border-cyan-500/30" },
              { mode: "unlimited", label: "Unlimited", versions: "5+ Versions", price: "€24.99/month", border: "border-violet-500/30" },
            ].map(opt => (
              <div key={opt.mode} onClick={() => createProfile(opt.mode)} className={`cursor-pointer rounded-xl border ${opt.border} bg-gradient-to-br from-cyan-500/5 to-violet-500/5 p-4 hover:border-cyan-400/40 transition-all`}>
                <h4 className="font-semibold">{opt.label}</h4>
                <Badge variant="outline" className="text-[10px] mt-1 border-cyan-500/30 text-cyan-400">{opt.versions}</Badge>
                <p className="text-lg font-bold mt-2">{opt.price}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <>
          <div className="rounded-xl border border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-violet-500/5 p-5 space-y-3">
            <div className="flex items-center gap-2 mb-3">
              <Atom className="h-5 w-5 text-cyan-400 animate-spin" style={{ animationDuration: '8s' }} />
              <h3 className="font-semibold">Your Quantum Profile</h3>
            </div>
            {[
              { label: "Current Mode", value: profile.quantum_mode },
              { label: "Reality Versions", value: `${profile.reality_versions} versions` },
              { label: "Observer Mode", value: profile.observer_mode_active ? "Active" : "Inactive" },
              { label: "Premium Status", value: profile.is_premium ? "Premium" : "Standard" },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{item.label}</span>
                <Badge variant="outline" className="capitalize text-[10px] border-cyan-500/30 text-cyan-400">{item.value}</Badge>
              </div>
            ))}
          </div>

          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-5 space-y-3">
            <h3 className="font-semibold">Upgrade Quantum Mode</h3>
            <Select value={profile.quantum_mode} onValueChange={updateMode}>
              <SelectTrigger className="border-violet-500/20"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Standard (Free - 1 Version)</SelectItem>
                <SelectItem value="triple">Quantum (€12.99/mo - 3 Versions)</SelectItem>
                <SelectItem value="unlimited">Unlimited (€24.99/mo - 5+ Versions)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </>
      )}
    </div>
    </>
  );
};

export default QuantumProfile;
