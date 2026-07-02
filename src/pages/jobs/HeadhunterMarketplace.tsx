import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { UserSearch, Loader2, ArrowLeft, Star, Briefcase, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_HEADHUNTERMARKETPLACE = [
  { title: "Post a mandate", desc: "Describe the role, budget and success fee (% of first-year salary)." },
  { title: "Recruiters submit candidates", desc: "Vetted headhunters apply to your mandate and start sourcing." },
  { title: "Interview & hire", desc: "Communicate in-app. Fee is paid only when the candidate is hired and stays past the guarantee period." },
];

export default function HeadhunterMarketplace() {
  const navigate = useNavigate();
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [specialties, setSpecialties] = useState("");
  const [feePercent, setFeePercent] = useState(15);

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from("headhunter_profiles")
      .select("*").eq("is_active", true).order("rating", { ascending: false });
    setList(data ?? []);
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: mine } = await (supabase as any).from("headhunter_profiles")
        .select("*").eq("user_id", user.id).maybeSingle();
      setMyProfile(mine);
    }
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const saveProfile = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !displayName.trim()) return toast.error("Display name required");
    const payload = {
      user_id: user.id,
      display_name: displayName,
      bio,
      specialties: specialties.split(",").map(s => s.trim()).filter(Boolean),
      fee_percent: feePercent,
    };
    const { error } = await (supabase as any).from("headhunter_profiles").upsert(payload, { onConflict: "user_id" });
    if (error) return toast.error(error.message);
    toast.success("Profile saved");
    setShowForm(false);
    load();
  };

  const engage = async (h: any) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Login required");
    if (user.id === h.user_id) return toast.error("Can't engage yourself");
    const { error } = await (supabase as any).from("headhunter_engagements").insert({
      employer_id: user.id, headhunter_id: h.user_id, fee_percent: h.fee_percent,
    });
    if (error) return toast.error(error.message);
    toast.success("Request sent to headhunter");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Headhunter Marketplace" intro="Hire independent recruiters on a success-fee basis." steps={HOW_STEPS_HEADHUNTERMARKETPLACE} variant="compact" />
      </div>
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-500/15 via-primary/10 to-rose-500/5 border border-amber-500/20 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft className="h-4 w-4" /></Button>
          <div className="p-4 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 shadow-xl"><UserSearch className="h-7 w-7 text-white" /></div>
          <div className="flex-1">
            <h1 className="text-2xl sm:text-3xl font-black">Headhunter Marketplace</h1>
            <p className="text-sm text-muted-foreground">Hire elite recruiters to source top talent.</p>
          </div>
          <Button onClick={() => { setShowForm(s => !s); if (myProfile) { setDisplayName(myProfile.display_name); setBio(myProfile.bio || ""); setSpecialties((myProfile.specialties || []).join(", ")); setFeePercent(myProfile.fee_percent); } }}>
            <Plus className="h-4 w-4 mr-1" /> {myProfile ? "Edit profile" : "Become headhunter"}
          </Button>
        </div>
      </motion.div>

      {showForm && (
        <Card><CardContent className="p-4 space-y-2">
          <h3 className="font-semibold">Headhunter profile</h3>
          <Input placeholder="Display name *" value={displayName} onChange={e => setDisplayName(e.target.value)} />
          <Textarea rows={3} placeholder="Bio" value={bio} onChange={e => setBio(e.target.value)} />
          <Input placeholder="Specialties (comma-separated)" value={specialties} onChange={e => setSpecialties(e.target.value)} />
          <Input type="number" min={1} max={50} step={0.5} value={feePercent} onChange={e => setFeePercent(parseFloat(e.target.value || "15"))} placeholder="Fee %" />
          <Button onClick={saveProfile}>Save</Button>
        </CardContent></Card>
      )}

      {loading ? (
        <div className="flex justify-center py-10"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : list.length === 0 ? (
        <Card className="border-dashed border-2"><CardContent className="py-10 text-center text-muted-foreground">No headhunters yet. Be the first!</CardContent></Card>
      ) : (
        <div className="grid sm:grid-cols-2 gap-3">
          {list.map(h => (
            <Card key={h.id}><CardContent className="p-4 space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="font-bold">{h.display_name}</h4>
                <Badge variant="secondary"><Star className="h-3 w-3 mr-1" /> {Number(h.rating).toFixed(1)}</Badge>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{h.bio}</p>
              <div className="flex flex-wrap gap-1">
                {(h.specialties || []).map((s: string, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">{s}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" /> {h.placements_count} placements</span>
                <span className="font-semibold">{h.fee_percent}% fee</span>
              </div>
              <Button size="sm" className="w-full" onClick={() => engage(h)}>Engage</Button>
            </CardContent></Card>
          ))}
        </div>
      )}
    </div>
  );
}
