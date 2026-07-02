import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Award, Plus, X, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Props {
  profileUserId: string;
  currentUserId?: string | null;
}

interface Endorsement {
  id: string;
  endorser_id: string;
  skill: string;
  message: string | null;
  created_at: string;
  endorser?: { full_name: string | null; avatar_url: string | null };
}

export const Endorsements = ({ profileUserId, currentUserId }: Props) => {
  const [list, setList] = useState<Endorsement[]>([]);
  const [skill, setSkill] = useState("");
  const [message, setMessage] = useState("");
  const [adding, setAdding] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const canEndorse = !!currentUserId && currentUserId !== profileUserId;

  const load = async () => {
    const { data } = await supabase
      .from("endorsements")
      .select("id, endorser_id, skill, message, created_at")
      .eq("endorsed_user_id", profileUserId)
      .order("created_at", { ascending: false })
      .limit(50);
    if (!data) return;
    const ids = [...new Set(data.map((d) => d.endorser_id))];
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", ids);
    const map = new Map(profs?.map((p) => [p.id, p]) ?? []);
    setList(data.map((d) => ({ ...d, endorser: map.get(d.endorser_id) as any })));
  };

  useEffect(() => {
    load();
  }, [profileUserId]);

  const add = async () => {
    if (!skill.trim()) return;
    setAdding(true);
    const { error } = await supabase.from("endorsements").insert({
      endorsed_user_id: profileUserId,
      endorser_id: currentUserId!,
      skill: skill.trim(),
      message: message.trim() || null,
    });
    setAdding(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "Already endorsed for this skill" : error.message);
      return;
    }
    setSkill("");
    setMessage("");
    setShowForm(false);
    toast.success("Endorsement added");
    load();
  };

  const remove = async (id: string) => {
    await supabase.from("endorsements").delete().eq("id", id);
    load();
  };

  const skillCounts = list.reduce<Record<string, number>>((acc, e) => {
    acc[e.skill] = (acc[e.skill] || 0) + 1;
    return acc;
  }, {});
  const topSkills = Object.entries(skillCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  return (
    <>
      <FloatingHowItWorks title={"Endorsements - How it works"} steps={[{ title: 'Open', desc: 'Access the Endorsements section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Endorsements.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="bg-card/80 backdrop-blur border-border/40">
      <CardHeader className="flex flex-row items-center justify-between pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Award className="w-4 h-4 text-primary" />
          Endorsements ({list.length})
        </CardTitle>
        {canEndorse && (
          <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Endorse
          </Button>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {topSkills.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {topSkills.map(([s, n]) => (
              <Badge key={s} variant="secondary" className="text-xs">
                {s} · {n}
              </Badge>
            ))}
          </div>
        )}
        {showForm && canEndorse && (
          <div className="space-y-2 p-3 bg-muted/30 rounded-lg border border-border/40">
            <Input placeholder="Skill (e.g., React, Photography)" value={skill} onChange={(e) => setSkill(e.target.value)} maxLength={60} />
            <Input placeholder="Optional message" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={200} />
            <Button size="sm" onClick={add} disabled={adding || !skill.trim()} className="w-full">
              {adding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Submit endorsement"}
            </Button>
          </div>
        )}
        {list.length === 0 ? (
          <p className="text-xs text-muted-foreground">No endorsements yet.</p>
        ) : (
          <ul className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {list.slice(0, 10).map((e) => (
              <li key={e.id} className="flex items-start gap-2 text-xs p-2 rounded bg-muted/20">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">
                    {e.endorser?.full_name || "Anonymous"} → <span className="text-primary">{e.skill}</span>
                  </div>
                  {e.message && <div className="text-muted-foreground mt-0.5 line-clamp-2">{e.message}</div>}
                </div>
                {currentUserId === e.endorser_id && (
                  <button onClick={() => remove(e.id)} className="text-muted-foreground hover:text-destructive shrink-0">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
    </>
  );
};
