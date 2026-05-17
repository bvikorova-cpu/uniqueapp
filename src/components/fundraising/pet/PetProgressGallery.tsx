import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Camera, Plus, Sparkles, Heart, PawPrint } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Update {
  id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  day_since_rescue: number | null;
  milestone_type: string;
  created_at: string;
}

const milestoneMeta: Record<string, { label: string; icon: any; color: string }> = {
  before: { label: "Before", icon: Camera, color: "text-orange-500" },
  progress: { label: "Progress", icon: PawPrint, color: "text-primary" },
  milestone: { label: "Milestone", icon: Sparkles, color: "text-accent" },
  after: { label: "After", icon: Heart, color: "text-green-500" },
};

interface Props {
  campaignId: string;
  ownerUserId: string;
  petName: string;
}

export function PetProgressGallery({ campaignId, ownerUserId, petName }: Props) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [isOwner, setIsOwner] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    image_url: "",
    day_since_rescue: "",
    milestone_type: "progress",
  });
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("pet_progress_updates" as any)
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: true });
    setUpdates((data as unknown as Update[]) || []);
  };

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setIsOwner(data.user?.id === ownerUserId));
  }, [campaignId, ownerUserId]);

  const post = async () => {
    if (form.title.trim().length < 2) {
      toast({ title: "Title required", variant: "destructive" });
      return;
    }
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("pet_progress_updates" as any).insert({
      campaign_id: campaignId,
      author_user_id: user?.id,
      title: form.title.trim().slice(0, 200),
      body: form.body.trim() || null,
      image_url: form.image_url.trim() || null,
      day_since_rescue: form.day_since_rescue ? parseInt(form.day_since_rescue) : null,
      milestone_type: form.milestone_type,
    });
    setPosting(false);
    if (error) {
      toast({ title: "Could not post", description: error.message, variant: "destructive" });
      return;
    }
    setForm({ title: "", body: "", image_url: "", day_since_rescue: "", milestone_type: "progress" });
    setShowForm(false);
    load();
    toast({ title: "Progress posted 🐾" });
  };

  const beforeShot = updates.find((u) => u.milestone_type === "before");
  const afterShot = [...updates].reverse().find((u) => u.milestone_type === "after");

  if (updates.length === 0 && !isOwner) return null;

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Camera className="w-5 h-5 text-primary" />
        <h3 className="font-bold text-lg">{petName}'s Recovery Journey</h3>
        {isOwner && (
          <Button size="sm" variant="outline" className="ml-auto" onClick={() => setShowForm((v) => !v)}>
            <Plus className="w-4 h-4 mr-1" /> Add Update
          </Button>
        )}
      </div>

      {showForm && (
        <div className="space-y-2 mb-4 p-3 rounded-lg border bg-muted/20">
          <Input placeholder="Title (e.g. 'Surgery successful!')" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <Select value={form.milestone_type} onValueChange={(v) => setForm({ ...form, milestone_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(milestoneMeta).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Input placeholder="Photo URL" value={form.image_url} onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
          <Input placeholder="Days since rescue (optional)" type="number" value={form.day_since_rescue} onChange={(e) => setForm({ ...form, day_since_rescue: e.target.value })} />
          <Textarea placeholder="What happened?" rows={3} className="resize-none" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
          <Button onClick={post} disabled={posting} size="sm" className="w-full">
            {posting ? "Posting..." : "Post Update"}
          </Button>
        </div>
      )}

      {beforeShot && afterShot && (
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 rounded-lg bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/20">
          <div>
            <Badge variant="outline" className="mb-2 text-xs">Before</Badge>
            {beforeShot.image_url && <img src={beforeShot.image_url} alt="Before" className="w-full h-32 object-cover rounded" loading="lazy" />}
          </div>
          <div>
            <Badge variant="default" className="mb-2 text-xs">After ✨</Badge>
            {afterShot.image_url && <img src={afterShot.image_url} alt="After" className="w-full h-32 object-cover rounded" loading="lazy" />}
          </div>
        </div>
      )}

      {updates.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">
          The rescue team will post progress photos here as {petName} recovers.
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {updates.map((u, i) => {
            const meta = milestoneMeta[u.milestone_type] ?? milestoneMeta.progress;
            const Icon = meta.icon;
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="rounded-lg overflow-hidden border border-border bg-muted/20"
              >
                {u.image_url && (
                  <img src={u.image_url} alt={u.title} className="w-full h-40 object-cover" loading="lazy" />
                )}
                <div className="p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-3 h-3 ${meta.color}`} />
                    <span className="text-xs font-bold">{meta.label}</span>
                    {u.day_since_rescue != null && (
                      <Badge variant="outline" className="text-[10px] ml-auto">Day {u.day_since_rescue}</Badge>
                    )}
                  </div>
                  <h5 className="text-sm font-medium mb-1">{u.title}</h5>
                  {u.body && <p className="text-xs text-muted-foreground line-clamp-3">{u.body}</p>}
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {format(new Date(u.created_at), "MMM d, yyyy")}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
