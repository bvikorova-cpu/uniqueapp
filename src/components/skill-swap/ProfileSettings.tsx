import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { X, Plus, ArrowLeft, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { FloatingParticles } from "@/components/wellness/FloatingParticles";

export const ProfileSettings = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "", bio: "", location: "", skills_offered: [] as string[], skills_wanted: [] as string[],
  });
  const [newSkillOffered, setNewSkillOffered] = useState("");
  const [newSkillWanted, setNewSkillWanted] = useState("");

  useEffect(() => { loadProfile(); }, []);

  const loadProfile = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      const { data, error } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (error) throw error;
      setProfile({ full_name: data.full_name || "", bio: data.bio || "", location: data.location || "", skills_offered: data.skills_offered || [], skills_wanted: data.skills_wanted || [] });
    } catch (error) { console.error('Error loading profile:', error); toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate('/auth'); return; }
      const { error } = await supabase.from('profiles').update({
        full_name: profile.full_name, bio: profile.bio, location: profile.location, skills_offered: profile.skills_offered, skills_wanted: profile.skills_wanted,
      }).eq('id', session.user.id);
      if (error) throw error;
      toast.success('Profile updated successfully!');
      navigate(`/skill-swap/profile/${session.user.id}`);
    } catch (error) { console.error('Error saving profile:', error); toast.error('Failed to save profile'); }
    finally { setSaving(false); }
  };

  const addSkillOffered = () => {
    if (newSkillOffered.trim() && !profile.skills_offered.includes(newSkillOffered.trim())) {
      setProfile({ ...profile, skills_offered: [...profile.skills_offered, newSkillOffered.trim()] });
      setNewSkillOffered("");
    }
  };
  const removeSkillOffered = (skill: string) => setProfile({ ...profile, skills_offered: profile.skills_offered.filter(s => s !== skill) });
  const addSkillWanted = () => {
    if (newSkillWanted.trim() && !profile.skills_wanted.includes(newSkillWanted.trim())) {
      setProfile({ ...profile, skills_wanted: [...profile.skills_wanted, newSkillWanted.trim()] });
      setNewSkillWanted("");
    }
  };
  const removeSkillWanted = (skill: string) => setProfile({ ...profile, skills_wanted: profile.skills_wanted.filter(s => s !== skill) });

  if (loading) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <FloatingParticles />
      <div className="container mx-auto px-4 py-6 sm:py-10 max-w-3xl relative z-10">
        <Button variant="ghost" size="sm" onClick={() => navigate('/skill-swap')} className="mb-6 gap-2">
          <ArrowLeft className="w-4 h-4" /> Back
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="overflow-hidden bg-card/80 backdrop-blur-xl border-border/50">
            <div className="h-1.5 bg-gradient-to-r from-primary via-accent to-primary" />
            <div className="p-5 sm:p-8 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <h1 className="text-xl sm:text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">
                    Edit Profile
                  </h1>
                </div>
                <p className="text-sm text-muted-foreground">Update your profile to attract better skill matches</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-semibold block mb-1.5">Full Name</label>
                  <Input value={profile.full_name} onChange={(e) => setProfile({ ...profile, full_name: e.target.value })} placeholder="Your name" className="bg-muted/10 border-border/50" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5">Location</label>
                  <Input value={profile.location} onChange={(e) => setProfile({ ...profile, location: e.target.value })} placeholder="City, Country" className="bg-muted/10 border-border/50" />
                </div>
                <div>
                  <label className="text-sm font-semibold block mb-1.5">Bio</label>
                  <Textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} placeholder="Tell others about yourself..." rows={4} className="bg-muted/10 border-border/50" />
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1.5">Skills I Can Teach</label>
                  <div className="flex gap-2 mb-2">
                    <Input value={newSkillOffered} onChange={(e) => setNewSkillOffered(e.target.value)} placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && addSkillOffered()} className="bg-muted/10 border-border/50" />
                    <Button onClick={addSkillOffered} size="icon" className="flex-shrink-0"><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills_offered.map((skill, index) => (
                      <Badge key={index} variant="secondary" className="pr-1 text-xs bg-primary/10 text-primary border-primary/20">
                        {skill}
                        <button onClick={() => removeSkillOffered(skill)} className="ml-1.5 hover:bg-destructive/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-semibold block mb-1.5">Skills I Want to Learn</label>
                  <div className="flex gap-2 mb-2">
                    <Input value={newSkillWanted} onChange={(e) => setNewSkillWanted(e.target.value)} placeholder="Add a skill..."
                      onKeyPress={(e) => e.key === 'Enter' && addSkillWanted()} className="bg-muted/10 border-border/50" />
                    <Button onClick={addSkillWanted} size="icon" className="flex-shrink-0"><Plus className="w-4 h-4" /></Button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills_wanted.map((skill, index) => (
                      <Badge key={index} variant="outline" className="pr-1 text-xs">
                        {skill}
                        <button onClick={() => removeSkillWanted(skill)} className="ml-1.5 hover:bg-destructive/20 rounded-full p-0.5"><X className="w-3 h-3" /></button>
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button onClick={handleSave} disabled={saving} className="flex-1">
                  {saving ? 'Saving...' : <><Sparkles className="mr-2 h-4 w-4" /> Save Changes</>}
                </Button>
                <Button variant="outline" onClick={() => navigate('/skill-swap')}>Cancel</Button>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
