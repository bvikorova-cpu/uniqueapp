import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Pin, Radio, Plus, AlertCircle, Package, Trophy, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Update {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  update_type: string;
  is_pinned: boolean;
  created_at: string;
}

const typeMeta: Record<string, { label: string; icon: any; color: string }> = {
  situation: { label: "Situation", icon: AlertCircle, color: "text-orange-500" },
  distribution: { label: "Distribution", icon: Package, color: "text-blue-500" },
  milestone: { label: "Milestone", icon: Trophy, color: "text-primary" },
  closure: { label: "Closure", icon: Flag, color: "text-muted-foreground" },
};

interface Props {
  campaignId: string;
  ownerUserId: string;
}

export function CrisisUpdatesTimeline({ campaignId, ownerUserId }: Props) {
  const [updates, setUpdates] = useState<Update[]>([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", update_type: "situation", image_url: "" });
  const [posting, setPosting] = useState(false);

  const load = async () => {
    const { data } = await supabase
      .from("crisis_updates" as any)
      .select("*")
      .eq("campaign_id", campaignId)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false });
    setUpdates((data as unknown as Update[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    supabase.auth.getUser().then(({ data }) => setIsOwner(data.user?.id === ownerUserId));
    const channel = supabase
      .channel(`crisis-updates-${campaignId}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "crisis_updates", filter: `campaign_id=eq.${campaignId}` },
        () => load()
      )
      .subscribe();
    return (
    <>
      <FloatingHowItWorks title={"Crisis Updates Timeline - How it works"} steps={[{ title: 'Open', desc: 'Access the Crisis Updates Timeline section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Crisis Updates Timeline.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      
    </>
  ) => { supabase.removeChannel(channel); };
    // eslint-disable-next-line
  }, [campaignId, ownerUserId]);

  const post = async () => {
    if (form.title.trim().length < 3 || form.body.trim().length < 3) {
      toast({ title: "Add a title and body", variant: "destructive" });
      return;
    }
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    const { error } = await supabase.from("crisis_updates" as any).insert({
      campaign_id: campaignId,
      author_user_id: user?.id,
      title: form.title.trim().slice(0, 200),
      body: form.body.trim().slice(0, 5000),
      update_type: form.update_type,
      image_url: form.image_url.trim() || null,
    });
    setPosting(false);
    if (error) {
      toast({ title: "Could not post", description: error.message, variant: "destructive" });
      return;
    }
    setForm({ title: "", body: "", update_type: "situation", image_url: "" });
    setShowForm(false);
    toast({ title: "Update posted" });
  };

  return (
    <Card className="p-5">
      <div className="flex items-center gap-2 mb-4">
        <Radio className="w-5 h-5 text-destructive animate-pulse" />
        <h3 className="font-bold text-lg">Live Updates</h3>
        <Badge variant="outline" className="ml-2">{updates.length}</Badge>
        {isOwner && (
          <Button size="sm" variant="outline" onClick={() => setShowForm((v) => !v)} className="ml-auto">
            <Plus className="w-4 h-4 mr-1" /> Post Update
          </Button>
        )}
      </div>

      {showForm && isOwner && (
        <div className="space-y-2 mb-4 p-3 rounded-lg border border-border bg-muted/20">
          <Input
            placeholder="Update title"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            maxLength={200}
          />
          <Select value={form.update_type} onValueChange={(v) => setForm({ ...form, update_type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.entries(typeMeta).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Textarea
            placeholder="What's happening on the ground?"
            value={form.body}
            onChange={(e) => setForm({ ...form, body: e.target.value })}
            rows={4}
            maxLength={5000}
            className="resize-none"
          />
          <Input
            placeholder="Image URL (optional)"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
          />
          <Button onClick={post} disabled={posting} size="sm" className="w-full">
            {posting ? "Posting..." : "Publish Update"}
          </Button>
        </div>
      )}

      {loading ? (
        <p className="text-xs text-muted-foreground text-center py-4">Loading updates...</p>
      ) : updates.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-6">
          No updates yet. The campaign organizer will post here as the situation develops.
        </p>
      ) : (
        <div className="relative pl-6 space-y-4 border-l-2 border-border">
          {updates.map((u, i) => {
            const meta = typeMeta[u.update_type] ?? typeMeta.situation;
            const Icon = meta.icon;
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: Math.min(i * 0.04, 0.3) }}
                className="relative"
              >
                <div className="absolute -left-[33px] top-1 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                  <Icon className={`w-3 h-3 ${meta.color}`} />
                </div>
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  {u.is_pinned && <Pin className="w-3 h-3 text-primary" />}
                  <h4 className="font-bold text-sm">{u.title}</h4>
                  <Badge variant="outline" className="text-[10px] py-0">{meta.label}</Badge>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {formatDistanceToNow(new Date(u.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{u.body}</p>
                {u.image_url && (
                  <img src={u.image_url} alt="" className="mt-2 rounded-lg max-h-64 object-cover" loading="lazy" />
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
