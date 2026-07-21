import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Crown, Users, Star, Lock, Unlock, Plus, Loader2, Heart,
  DollarSign, Sparkles, Trash2, FileText,
  ChevronDown, ChevronUp,
} from "lucide-react";
import FanClubMembersCard from "./FanClubMembersCard";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface FanClubManagerProps { onBack: () => void; }

type Tier = "bronze" | "silver" | "gold";

const TIER_CONFIG: Record<Tier, {
  color: string; bg: string; border: string; price: number; icon: typeof Star;
}> = {
  bronze: { color: "text-orange-600", bg: "bg-orange-500/10", border: "border-orange-500/20", price: 4.99, icon: Star },
  silver: { color: "text-gray-400",   bg: "bg-gray-500/10",   border: "border-gray-500/20",   price: 9.99, icon: Crown },
  gold:   { color: "text-amber-400",  bg: "bg-amber-500/10",  border: "border-amber-500/20",  price: 19.99, icon: Sparkles },
};

interface FanClubRow {
  id: string;
  name: string;
  description: string | null;
  tier: Tier;
  price_cents: number;
  perks: string[];
  member_count: number;
  is_active: boolean;
}

const FanClubManager = ({ onBack }: FanClubManagerProps) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [expandedMembers, setExpandedMembers] = useState<Record<string, boolean>>({});
  const [postDialogClub, setPostDialogClub] = useState<FanClubRow | null>(null);
  const [newClub, setNewClub] = useState<{ name: string; description: string; tier: Tier; perks: string }>({
    name: "", description: "", tier: "bronze", perks: "",
  });
  const [newPost, setNewPost] = useState({ title: "", body: "", media_url: "" });

  const { data: user } = useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => (await supabase.auth.getUser()).data.user,
  });

  const { data: clubs = [], isLoading } = useQuery<FanClubRow[]>({
    queryKey: ["influencer-fan-clubs", user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from("influencer_fan_clubs")
        .select("id, name, description, tier, price_cents, perks, member_count, is_active")
        .eq("creator_id", user.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []).map((r: any) => ({
        ...r,
        perks: Array.isArray(r.perks) ? r.perks : [],
      })) as FanClubRow[];
    },
    enabled: !!user,
  });

  const createClub = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      const perks = newClub.perks.split("\n").map((s) => s.trim()).filter(Boolean);
      const { error } = await supabase.from("influencer_fan_clubs").insert({
        creator_id: user.id,
        tier: newClub.tier,
        name: newClub.name.trim(),
        description: newClub.description.trim(),
        price_cents: Math.round(TIER_CONFIG[newClub.tier].price * 100),
        perks,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["influencer-fan-clubs"] });
      setShowCreate(false);
      setNewClub({ name: "", description: "", tier: "bronze", perks: "" });
      toast({ title: "✅ Fan Club created", description: "Members can now subscribe via Stripe." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const toggleActive = useMutation({
    mutationFn: async (row: FanClubRow) => {
      const { error } = await supabase
        .from("influencer_fan_clubs")
        .update({ is_active: !row.is_active })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["influencer-fan-clubs"] }),
  });

  const removeClub = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("influencer_fan_clubs").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["influencer-fan-clubs"] });
      toast({ title: "Fan Club deleted" });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const createPost = useMutation({
    mutationFn: async () => {
      if (!user || !postDialogClub) throw new Error("Missing context");
      const { error } = await supabase.from("influencer_fan_club_posts").insert({
        fan_club_id: postDialogClub.id,
        creator_id: user.id,
        title: newPost.title.trim(),
        body: newPost.body.trim(),
        media_url: newPost.media_url.trim() || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setPostDialogClub(null);
      setNewPost({ title: "", body: "", media_url: "" });
      toast({ title: "🔒 Exclusive post published", description: "Only active members can view it." });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={onBack} className="gap-2 mb-2">
        <ArrowLeft className="h-4 w-4" /> Back to Hub
      </Button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <Crown className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Fan Club Manager</h2>
            <p className="text-muted-foreground">
              Real Stripe subscriptions · Locked exclusive posts · 85 % creator / 15 % platform
            </p>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Fan Club
        </Button>
      </motion.div>

      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : clubs.length === 0 ? (
        <Card className="p-12 text-center backdrop-blur-xl bg-card/80 border-primary/10">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-xl font-bold mb-2">No Fan Clubs Yet</h3>
          <p className="text-muted-foreground mb-4">
            Launch your first tier and start earning monthly recurring revenue from your top fans.
          </p>
          <Button onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create Your First Club
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club, i) => {
            const cfg = TIER_CONFIG[club.tier];
            const Icon = cfg.icon;
            return (
              <motion.div key={club.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <Card className={`backdrop-blur-xl bg-card/80 ${cfg.border} border hover:shadow-lg transition-all`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${cfg.bg}`}><Icon className={`h-6 w-6 ${cfg.color}`} /></div>
                      <div className="flex gap-2 items-center">
                        <Badge className={`${cfg.bg} ${cfg.color} border-none capitalize`}>{club.tier}</Badge>
                        {!club.is_active && <Badge variant="outline">Inactive</Badge>}
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-2">{club.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground min-h-[2.5rem]">{club.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{club.member_count} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-green-500">
                          €{(club.price_cents / 100).toFixed(2)}/mo
                        </span>
                      </div>
                    </div>
                    {club.perks.length > 0 && (
                      <div className="space-y-1 pt-2 border-t border-border/20">
                        {club.perks.slice(0, 3).map((perk, j) => (
                          <div key={j} className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Unlock className="h-3 w-3 text-primary shrink-0" />
                            <span>{perk}</span>
                          </div>
                        ))}
                        {club.perks.length > 3 && (
                          <p className="text-xs text-primary">+{club.perks.length - 3} more perks</p>
                        )}
                      </div>
                    )}
                    <div className="flex gap-2 pt-2">
                      <Button size="sm" variant="secondary" className="flex-1 gap-1"
                        onClick={() => setPostDialogClub(club)}>
                        <FileText className="h-3 w-3" /> Post
                      </Button>
                      <Button size="sm" variant="outline" className="gap-1"
                        onClick={() => setExpandedMembers((s) => ({ ...s, [club.id]: !s[club.id] }))}>
                        <Users className="h-3 w-3" />
                        {expandedMembers[club.id]
                          ? <ChevronUp className="h-3 w-3" />
                          : <ChevronDown className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => toggleActive.mutate(club)}>
                        {club.is_active ? <Lock className="h-3 w-3" /> : <Unlock className="h-3 w-3" />}
                      </Button>
                      <Button size="sm" variant="ghost"
                        onClick={() => {
                          if (confirm(`Delete "${club.name}"? Active subscribers keep access until period end.`))
                            removeClub.mutate(club.id);
                        }}>
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </Button>
                    </div>
                    {expandedMembers[club.id] && (
                      <div className="pt-3">
                        <FanClubMembersCard
                          fanClubId={club.id}
                          fanClubName={club.name}
                          tier={club.tier}
                        />
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" /> Create Fan Club
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">Club Name</label>
              <Input value={newClub.name} onChange={(e) => setNewClub({ ...newClub, name: e.target.value })}
                placeholder="e.g. VIP Inner Circle" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Description</label>
              <Textarea value={newClub.description}
                onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
                placeholder="What makes this club special?" rows={2} />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Tier</label>
              <div className="grid grid-cols-3 gap-2">
                {(["bronze", "silver", "gold"] as const).map((tier) => {
                  const cfg = TIER_CONFIG[tier];
                  return (
                    <Button key={tier} variant={newClub.tier === tier ? "default" : "outline"} size="sm"
                      onClick={() => setNewClub({ ...newClub, tier })} className="capitalize gap-1">
                      <cfg.icon className="h-3 w-3" /> {tier} (€{cfg.price}/mo)
                    </Button>
                  );
                })}
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Perks (one per line)</label>
              <Textarea value={newClub.perks} onChange={(e) => setNewClub({ ...newClub, perks: e.target.value })}
                placeholder={"Early access to content\nExclusive behind-the-scenes\nMonthly Q&A sessions"} rows={4} />
            </div>
            <Button onClick={() => createClub.mutate()}
              disabled={createClub.isPending || !newClub.name.trim()} className="w-full gap-2">
              {createClub.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
              {createClub.isPending ? "Creating..." : "Create Fan Club"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Exclusive post dialog */}
      <Dialog open={!!postDialogClub} onOpenChange={(o) => !o && setPostDialogClub(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-primary" /> New Exclusive Post
              {postDialogClub && <span className="text-sm text-muted-foreground">· {postDialogClub.name}</span>}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Title" value={newPost.title}
              onChange={(e) => setNewPost({ ...newPost, title: e.target.value })} />
            <Textarea rows={5} placeholder="Body — only active members can read this"
              value={newPost.body} onChange={(e) => setNewPost({ ...newPost, body: e.target.value })} />
            <Input placeholder="Optional media URL (image/video)"
              value={newPost.media_url}
              onChange={(e) => setNewPost({ ...newPost, media_url: e.target.value })} />
            <Button onClick={() => createPost.mutate()}
              disabled={createPost.isPending || !newPost.title.trim()} className="w-full gap-2">
              {createPost.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
              Publish to Members
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FanClubManager;
