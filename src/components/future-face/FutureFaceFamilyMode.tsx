import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Plus, Trash2, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Member { id: string; name: string; relation: string; emoji: string; }
const KEY = "ff_family_v1";
const EMOJIS = ["👨", "👩", "👦", "👧", "👴", "👵", "🧒", "👶"];

export default function FutureFaceFamilyMode() {
  const [members, setMembers] = useState<Member[]>([]);
  const [active, setActive] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [relation, setRelation] = useState("");
  const [emoji, setEmoji] = useState(EMOJIS[0]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setMembers(data.members || []);
        setActive(data.active || null);
      }
    } catch {}
  }, []);

  const save = (next: Member[], act: string | null) => {
    setMembers(next);
    setActive(act);
    localStorage.setItem(KEY, JSON.stringify({ members: next, active: act }));
  };

  const add = () => {
    if (!name.trim()) { toast({ title: "Enter a name", variant: "destructive" }); return; }
    const m: Member = { id: crypto.randomUUID(), name: name.trim(), relation: relation.trim() || "family", emoji };
    const next = [...members, m];
    save(next, active || m.id);
    setName(""); setRelation("");
  };
  const remove = (id: string) => save(members.filter(m => m.id !== id), active === id ? null : active);

  return (
    <>
      <FloatingHowItWorks title={"Future Face Family Mode - How it works"} steps={[{ title: 'Open', desc: 'Access the Future Face Family Mode section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Future Face Family Mode.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="mb-8 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl sm:text-2xl font-black">👨‍👩‍👧 Family Mode</h2>
        <Badge variant="outline" className="gap-1"><Users className="h-3 w-3" />{members.length} members</Badge>
      </div>
      <Card className="border-cyan-500/20 bg-gradient-to-br from-cyan-500/5 to-purple-500/5">
        <CardContent className="p-4 space-y-3">
          <p className="text-xs text-muted-foreground">Track aging predictions for multiple family members. Active member tags new transformations.</p>

          {members.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {members.map(m => (
                <button key={m.id}
                  onClick={() => save(members, m.id)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all ${active === m.id ? "border-cyan-500 bg-cyan-500/10" : "border-border bg-card/50 hover:border-cyan-500/40"}`}
                >
                  <span className="text-xl">{m.emoji}</span>
                  <div className="text-left">
                    <p className="text-xs font-bold leading-tight">{m.name}</p>
                    <p className="text-[9px] text-muted-foreground">{m.relation}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); remove(m.id); }} className="text-muted-foreground hover:text-red-500">
                    <Trash2 className="h-3 w-3" />
                  </button>
                </button>
              ))}
            </div>
          )}

          <div className="border-t border-border/40 pt-3 space-y-2">
            <p className="text-xs font-bold uppercase">Add Family Member</p>
            <div className="flex gap-1.5 overflow-x-auto pb-1">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setEmoji(e)}
                  className={`text-2xl p-1.5 rounded-lg ${emoji === e ? "bg-cyan-500/20 ring-2 ring-cyan-500" : "bg-card/40"}`}>
                  {e}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input value={name} onChange={e => setName(e.target.value)} placeholder="Name" />
              <Input value={relation} onChange={e => setRelation(e.target.value)} placeholder="Relation" />
            </div>
            <Button onClick={add} className="w-full bg-gradient-to-r from-cyan-600 to-purple-600">
              <Plus className="h-4 w-4 mr-2" /> Add Member
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
    </>
  );
}
