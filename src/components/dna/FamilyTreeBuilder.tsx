import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Loader2, GitBranch, Plus, User, MapPin, Calendar, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  era: string;
  location: string;
  isFromDNA: boolean;
}

export const FamilyTreeBuilder = () => {
  const { toast } = useToast();
  const [members, setMembers] = useState<FamilyMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newMember, setNewMember] = useState({ name: "", relation: "", era: "", location: "" });

  useEffect(() => {
    loadFamilyTree();
  }, []);

  const loadFamilyTree = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setLoading(false); return; }

      // Load from ancestral_memories as DNA-discovered ancestors
      const { data: memories } = await supabase
        .from("ancestral_memories")
        .select("id, ancestor_name, ancestor_era, ancestor_location")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: true });

      const dnaMembers: FamilyMember[] = (memories || []).map(m => ({
        id: m.id,
        name: m.ancestor_name || "Unknown",
        relation: "Ancestor (DNA)",
        era: m.ancestor_era || "Unknown",
        location: m.ancestor_location || "Unknown",
        isFromDNA: true,
      }));

      // Load manual entries from localStorage
      const stored = localStorage.getItem(`family-tree-${session.user.id}`);
      const manualMembers: FamilyMember[] = stored ? JSON.parse(stored) : [];

      setMembers([...dnaMembers, ...manualMembers]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const addMember = async () => {
    if (!newMember.name.trim()) {
      toast({ title: "Name Required", description: "Please enter a name", variant: "destructive" });
      return;
    }
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const member: FamilyMember = {
      id: `manual-${Date.now()}`,
      name: newMember.name,
      relation: newMember.relation || "Family Member",
      era: newMember.era || "Present",
      location: newMember.location || "Unknown",
      isFromDNA: false,
    };

    const manualMembers = members.filter(m => !m.isFromDNA);
    const updated = [...manualMembers, member];
    localStorage.setItem(`family-tree-${session.user.id}`, JSON.stringify(updated));

    setMembers([...members.filter(m => m.isFromDNA), ...updated]);
    setNewMember({ name: "", relation: "", era: "", location: "" });
    setShowAdd(false);
    toast({ title: "Member Added", description: `${member.name} added to your family tree` });
  };

  const removeMember = async (id: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const updated = members.filter(m => m.id !== id);
    const manualOnly = updated.filter(m => !m.isFromDNA);
    localStorage.setItem(`family-tree-${session.user.id}`, JSON.stringify(manualOnly));
    setMembers(updated);
    toast({ title: "Removed", description: "Family member removed" });
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  const dnaMembers = members.filter(m => m.isFromDNA);
  const manualMembers = members.filter(m => !m.isFromDNA);

  return (
    <>
      <FloatingHowItWorks
        title='Family Tree Builder'
        steps={[
          { title: 'Open the tool', desc: 'Launch the Family Tree Builder panel from this page.' },
          { title: 'Provide inputs', desc: 'Fill in required fields or select the options you want to explore.' },
          { title: 'Run the action', desc: 'Tap the primary action button to generate or process.' },
          { title: 'Review the result', desc: 'Read the output, save, share or refine as you like.' }
        ]}
      />
    <div className="space-y-6">
      <Card className="p-5 bg-gradient-to-br from-lime-500/10 to-green-500/10 border-lime-500/20">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <GitBranch className="w-5 h-5 text-lime-500" />
              <span className="font-black text-sm">Family Tree Builder</span>
            </div>
            <p className="text-xs text-muted-foreground">{members.length} members discovered</p>
          </div>
          <Button size="sm" onClick={() => setShowAdd(!showAdd)} className="gap-1">
            <Plus className="w-3.5 h-3.5" /> Add Member
          </Button>
        </div>
      </Card>

      {/* Add Form */}
      {showAdd && (
        <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }}>
          <Card className="p-4 bg-card/80 backdrop-blur-xl border-primary/20">
            <h3 className="font-bold text-sm mb-3">Add Family Member</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <Input placeholder="Name *" value={newMember.name} onChange={e => setNewMember({ ...newMember, name: e.target.value })} className="text-sm" />
              <Input placeholder="Relation (e.g., Father)" value={newMember.relation} onChange={e => setNewMember({ ...newMember, relation: e.target.value })} className="text-sm" />
              <Input placeholder="Era / Year" value={newMember.era} onChange={e => setNewMember({ ...newMember, era: e.target.value })} className="text-sm" />
              <Input placeholder="Location" value={newMember.location} onChange={e => setNewMember({ ...newMember, location: e.target.value })} className="text-sm" />
            </div>
            <div className="flex gap-2">
              <Button onClick={addMember} size="sm" className="gap-1"><Plus className="w-3 h-3" /> Add</Button>
              <Button onClick={() => setShowAdd(false)} size="sm" variant="outline">Cancel</Button>
            </div>
          </Card>
        </motion.div>
      )}

      {members.length === 0 ? (
        <Card className="p-12 text-center bg-card/80 backdrop-blur-xl border-border/50">
          <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="font-bold text-lg mb-2">Your Family Tree is Empty</h3>
          <p className="text-sm text-muted-foreground">Complete a DNA Analysis to auto-discover ancestors, or add family members manually.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {/* DNA Discovered */}
          {dnaMembers.length > 0 && (
            <div>
              <h3 className="text-sm font-black mb-2 flex items-center gap-1.5">🧬 DNA-Discovered Ancestors</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dnaMembers.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-lg">🧬</div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{m.name}</p>
                          <div className="flex gap-2 text-[10px] text-muted-foreground">
                            <span className="flex items-center gap-0.5"><Calendar className="w-2.5 h-2.5" />{m.era}</span>
                            <span className="flex items-center gap-0.5"><MapPin className="w-2.5 h-2.5" />{m.location}</span>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[9px]">DNA</Badge>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}

          {/* Manual */}
          {manualMembers.length > 0 && (
            <div>
              <h3 className="text-sm font-black mb-2 flex items-center gap-1.5">👨‍👩‍👧‍👦 Manually Added</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {manualMembers.map((m, i) => (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                    <Card className="p-4 bg-card/80 backdrop-blur-xl border-border/50 hover:border-primary/30 transition-all">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center text-lg"><User className="w-5 h-5 text-white" /></div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm truncate">{m.name}</p>
                          <p className="text-[10px] text-muted-foreground">{m.relation} • {m.location}</p>
                        </div>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => removeMember(m.id)}>
                          <Trash2 className="w-3 h-3 text-muted-foreground" />
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
    </>
  );
};
