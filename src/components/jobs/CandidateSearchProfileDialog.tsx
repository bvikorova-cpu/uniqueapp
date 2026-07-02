import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
export default function CandidateSearchProfileDialog() {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<any>({
    headline: "", bio: "", skills: "", years_experience: 0,
    desired_role: "", desired_location: "", desired_salary_min: 0,
    remote_ok: true, is_searchable: true, is_open_to_offers: true,
  });

  const load = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data } = await (supabase as any).from("candidate_search_profiles").select("*").eq("user_id", user.id).maybeSingle();
    if (data) setProfile({ ...data, skills: (data.skills || []).join(", ") });
  };

  useEffect(() => { if (open) load(); }, [open]);

  const save = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return toast.error("Sign in required");
    const payload = {
      user_id: user.id,
      headline: profile.headline,
      bio: profile.bio,
      skills: (profile.skills || "").split(",").map((s: string) => s.trim()).filter(Boolean),
      years_experience: Number(profile.years_experience) || 0,
      desired_role: profile.desired_role,
      desired_location: profile.desired_location,
      desired_salary_min: Number(profile.desired_salary_min) || 0,
      remote_ok: !!profile.remote_ok,
      is_searchable: !!profile.is_searchable,
      is_open_to_offers: !!profile.is_open_to_offers,
      updated_at: new Date().toISOString(),
    };
    const { error } = await (supabase as any).from("candidate_search_profiles").upsert(payload, { onConflict: "user_id" });
    if (error) return toast.error(error.message);
    toast.success("Profile saved — recruiters can now find you");
    setOpen(false);
  };

  return (
    <>
      <FloatingHowItWorks title="How Candidate Search Profile Dialog works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="text-xs"><UserCheck className="h-3.5 w-3.5 mr-1" /> Recruit me</Button>
      </DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader><DialogTitle>Be discoverable to recruiters</DialogTitle></DialogHeader>
        <div className="space-y-2 max-h-[70vh] overflow-y-auto">
          <Input placeholder="Headline (e.g. Senior React Engineer)" value={profile.headline} onChange={e => setProfile({ ...profile, headline: e.target.value })} />
          <Textarea placeholder="Short bio" value={profile.bio} onChange={e => setProfile({ ...profile, bio: e.target.value })} />
          <Input placeholder="Skills (comma)" value={profile.skills} onChange={e => setProfile({ ...profile, skills: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <Input type="number" placeholder="Years experience" value={profile.years_experience} onChange={e => setProfile({ ...profile, years_experience: e.target.value })} />
            <Input type="number" placeholder="Min salary (€)" value={profile.desired_salary_min} onChange={e => setProfile({ ...profile, desired_salary_min: e.target.value })} />
          </div>
          <Input placeholder="Desired role" value={profile.desired_role} onChange={e => setProfile({ ...profile, desired_role: e.target.value })} />
          <Input placeholder="Desired location" value={profile.desired_location} onChange={e => setProfile({ ...profile, desired_location: e.target.value })} />
          <label className="flex items-center justify-between py-1"><span className="text-sm">Open to remote</span><Switch checked={profile.remote_ok} onCheckedChange={v => setProfile({ ...profile, remote_ok: v })} /></label>
          <label className="flex items-center justify-between py-1"><span className="text-sm">Open to offers</span><Switch checked={profile.is_open_to_offers} onCheckedChange={v => setProfile({ ...profile, is_open_to_offers: v })} /></label>
          <label className="flex items-center justify-between py-1"><span className="text-sm">Searchable by employers</span><Switch checked={profile.is_searchable} onCheckedChange={v => setProfile({ ...profile, is_searchable: v })} /></label>
          <Button className="w-full" onClick={save}>Save</Button>
        </div>
      </DialogContent>
    </Dialog>
    </>
    );
}
