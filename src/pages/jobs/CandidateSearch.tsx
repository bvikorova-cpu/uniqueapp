import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Loader2, Users, MapPin, Briefcase, ShieldCheck } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import { HowItWorksButton } from "@/components/common/HowItWorksButton";

const HOW_STEPS_CANDIDATESEARCH = [
  { title: "Filter", desc: "Skills, seniority, location, availability, salary expectation, remote-ok." },
  { title: "Open a profile", desc: "See public profile, badges, video resume and past experience." },
  { title: "Reach out", desc: "Message directly (uses employer credits) or invite them to apply to a role." },
];

export default function CandidateSearch() {
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);
  const [q, setQ] = useState("");
  const [skills, setSkills] = useState("");
  const [remoteOnly, setRemoteOnly] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }
    const { data: v } = await supabase.from("employer_verifications").select("verification_status").eq("employer_id", user.id).maybeSingle();
    const isV = v?.verification_status === "approved";
    setVerified(isV);
    if (!isV) { setLoading(false); return; }

    let qb = (supabase as any).from("candidate_search_profiles").select("*").eq("is_searchable", true);
    if (skills.trim()) {
      const arr = skills.split(",").map(s => s.trim()).filter(Boolean);
      if (arr.length) qb = qb.overlaps("skills", arr);
    }
    if (remoteOnly) qb = qb.eq("remote_ok", true);
    const { data } = await qb.limit(60);
    let list = data ?? [];
    if (q.trim()) {
      const term = q.toLowerCase();
      list = list.filter((c: any) =>
        (c.headline || "").toLowerCase().includes(term) ||
        (c.bio || "").toLowerCase().includes(term) ||
        (c.desired_role || "").toLowerCase().includes(term));
    }
    // Enrich with profile names
    const ids = list.map((c: any) => c.user_id);
    if (ids.length) {
      const { data: profs } = await (supabase as any).from("profiles_public").select("id, full_name, avatar_url").in("id", ids);
      const map = Object.fromEntries((profs ?? []).map((p: any) => [p.id, p]));
      list = list.map((c: any) => ({ ...c, profile: map[c.user_id] }));
    }
    setCandidates(list);
    setLoading(false);
  };

  useEffect(() => { load();   }, []);

  if (!loading && !verified) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
      <div className="flex justify-end mb-2 max-w-6xl mx-auto px-4">
        <HowItWorksButton title="Candidate Search" intro="Search Unique's talent pool as an employer." steps={HOW_STEPS_CANDIDATESEARCH} variant="compact" />
      </div>
        <ShieldCheck className="h-16 w-16 mx-auto text-amber-500" />
        <h1 className="text-2xl font-black">Employer verification required</h1>
        <p className="text-muted-foreground">Only verified employers can search the candidate database.</p>
        <Button onClick={() => navigate("/employer-verification")}>Verify my company</Button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pt-6 pb-8 space-y-6">
      <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-cyan-500/15 via-primary/10 to-blue-500/5 border border-cyan-500/20 p-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-500 shadow-xl"><Users className="h-7 w-7 text-white" /></div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black">Candidate Search</h1>
            <p className="text-sm text-muted-foreground">Find candidates open to offers</p>
          </div>
        </div>
      </motion.div>

      <Card><CardContent className="p-4 grid grid-cols-1 md:grid-cols-4 gap-2">
        <Input placeholder="Search headline / bio / role…" value={q} onChange={e => setQ(e.target.value)} />
        <Input placeholder="Skills (comma)" value={skills} onChange={e => setSkills(e.target.value)} />
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={remoteOnly} onChange={e => setRemoteOnly(e.target.checked)} /> Remote only
        </label>
        <Button onClick={load}><Search className="h-4 w-4 mr-1" /> Search</Button>
      </CardContent></Card>

      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : candidates.length === 0 ? (
        <Card className="border-dashed border-2"><CardContent className="py-16 text-center">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">No candidates match your filters.</p>
        </CardContent></Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {candidates.map(c => (
            <Card key={c.id} className="hover:border-primary/40">
              <CardContent className="p-4 space-y-2">
                <div className="flex items-center gap-2">
                  {c.profile?.avatar_url && <img src={c.profile.avatar_url} alt="" className="h-10 w-10 rounded-full" />}
                  <div>
                    <h3 className="font-bold text-sm">{c.profile?.full_name || "Candidate"}</h3>
                    <p className="text-xs text-muted-foreground">{c.headline || "—"}</p>
                  </div>
                </div>
                {c.bio && <p className="text-xs line-clamp-3">{c.bio}</p>}
                <div className="flex flex-wrap gap-1">
                  {(c.skills || []).slice(0, 6).map((s: string) => <Badge key={s} variant="secondary" className="text-[10px]">{s}</Badge>)}
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  {c.desired_role && <span className="flex items-center gap-1"><Briefcase className="h-3 w-3" />{c.desired_role}</span>}
                  {c.desired_location && <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{c.desired_location}</span>}
                  {c.remote_ok && <Badge variant="outline" className="text-[10px]">Remote</Badge>}
                  {c.years_experience != null && <span>{c.years_experience}y exp</span>}
                </div>
                <Button size="sm" className="w-full" onClick={() => navigate(`/profile/${c.user_id}`)}>View profile</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
