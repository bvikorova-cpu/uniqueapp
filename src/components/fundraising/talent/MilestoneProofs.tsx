import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Trophy, Music, Award, Disc3, Plus, ExternalLink, Trash2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface Proof {
  id: string;
  title: string;
  description: string | null;
  proof_type: string;
  media_url: string | null;
  external_url: string | null;
  achieved_on: string | null;
}

const typeIcons: Record<string, any> = {
  achievement: Trophy,
  performance: Music,
  award: Award,
  release: Disc3,
};

export const MilestoneProofs = ({ campaignId, isOwner }: { campaignId: string; isOwner: boolean }) => {
  const [proofs, setProofs] = useState<Proof[]>([]);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", proof_type: "achievement", media_url: "", external_url: "", achieved_on: "" });

  const load = async () => {
    const { data } = await (supabase as any)
      .from("talent_milestone_proofs")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("achieved_on", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false });
    setProofs((data as Proof[]) || []);
  };

  useEffect(() => { load(); }, [campaignId]);

  const handleAdd = async () => {
    if (!form.title) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    const { error } = await (supabase as any).from("talent_milestone_proofs").insert({
      campaign_id: campaignId,
      title: form.title,
      description: form.description || null,
      proof_type: form.proof_type,
      media_url: form.media_url || null,
      external_url: form.external_url || null,
      achieved_on: form.achieved_on || null,
    });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    setForm({ title: "", description: "", proof_type: "achievement", media_url: "", external_url: "", achieved_on: "" });
    setAdding(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await (supabase as any).from("talent_milestone_proofs").delete().eq("id", id);
    load();
  };

  if (proofs.length === 0 && !isOwner) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-primary" />
          Milestone Proofs
        </CardTitle>
        <CardDescription>Verified achievements, performances, awards & releases</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {proofs.map((p, i) => {
          const Icon = typeIcons[p.proof_type] || Trophy;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex gap-3 border rounded-lg p-4"
            >
              {p.media_url && (
                <img src={p.media_url} alt={p.title} className="w-20 h-20 rounded object-cover flex-shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <Icon className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{p.title}</span>
                  <Badge variant="outline" className="capitalize text-xs">{p.proof_type}</Badge>
                  {p.achieved_on && (
                    <span className="text-xs text-muted-foreground">{new Date(p.achieved_on).toLocaleDateString()}</span>
                  )}
                </div>
                {p.description && <p className="text-sm text-muted-foreground mb-2">{p.description}</p>}
                {p.external_url && (
                  <a href={p.external_url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary inline-flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" /> View proof
                  </a>
                )}
              </div>
              {isOwner && (
                <Button variant="ghost" size="icon" onClick={() => handleDelete(p.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </motion.div>
          );
        })}

        {isOwner && (
          adding ? (
            <div className="border-2 border-dashed rounded-lg p-4 space-y-3">
              <div>
                <Label>Title</Label>
                <Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Won National Competition 2026" />
              </div>
              <div>
                <Label>Type</Label>
                <select className="w-full border rounded px-3 py-2 bg-background" value={form.proof_type} onChange={e => setForm({ ...form, proof_type: e.target.value })}>
                  <option value="achievement">🏆 Achievement</option>
                  <option value="performance">🎵 Performance</option>
                  <option value="award">🥇 Award</option>
                  <option value="release">💿 Release</option>
                </select>
              </div>
              <div>
                <Label>Description</Label>
                <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Image URL</Label>
                  <Input value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} placeholder="https://..." />
                </div>
                <div>
                  <Label>External link</Label>
                  <Input value={form.external_url} onChange={e => setForm({ ...form, external_url: e.target.value })} placeholder="https://..." />
                </div>
              </div>
              <div>
                <Label>Achieved on</Label>
                <Input type="date" value={form.achieved_on} onChange={e => setForm({ ...form, achieved_on: e.target.value })} />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAdd} className="flex-1">Save proof</Button>
                <Button variant="outline" onClick={() => setAdding(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" onClick={() => setAdding(true)} className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add milestone
            </Button>
          )
        )}
      </CardContent>
    </Card>
  );
};
