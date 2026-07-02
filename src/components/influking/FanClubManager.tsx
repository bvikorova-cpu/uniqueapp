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
import { ArrowLeft, Crown, Users, Star, Lock, Unlock, Plus, Loader2, Heart, DollarSign, Sparkles } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface FanClubManagerProps {
  onBack: () => void;
}

interface FanClub {
  id: string;
  name: string;
  description: string;
  tier: "bronze" | "silver" | "gold";
  price: number;
  perks: string[];
  memberCount: number;
}

const TIER_CONFIG = {
  bronze: { color: "text-orange-600", bg: "bg-orange-500/10", border: "border-orange-500/20", price: 4.99, icon: Star },
  silver: { color: "text-gray-400", bg: "bg-gray-500/10", border: "border-gray-500/20", price: 9.99, icon: Crown },
  gold: { color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", price: 19.99, icon: Sparkles },
};

const FanClubManager = ({ onBack }: FanClubManagerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newClub, setNewClub] = useState<{ name: string; description: string; tier: "bronze" | "silver" | "gold"; perks: string }>({ name: "", description: "", tier: "bronze", perks: "" });

  const { data: myProfile } = useQuery({
    queryKey: ["my-influencer-fanclub"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;
      const { data } = await supabase
        .from("influencer_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();
      return data;
    },
  });

  const { data: fanClubs = [], isLoading } = useQuery({
    queryKey: ["fan-clubs", myProfile?.id],
    queryFn: async () => {
      if (!myProfile) return [];
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      // Using activity_feed as a lightweight storage for fan club data
      const { data, error } = await supabase
        .from("activity_feed")
        .select("*")
        .eq("user_id", user.id)
        .eq("activity_type", "fan_club_created")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (
    <>
      <FloatingHowItWorks title={"Fan Club Manager - How it works"} steps={[{ title: 'Open', desc: 'Access the Fan Club Manager section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Fan Club Manager.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      data || []
    </>
  ).map((item: any) => ({
        id: item.id,
        name: item.metadata?.name || "Unnamed Club",
        description: item.metadata?.description || "",
        tier: item.metadata?.tier || "bronze",
        price: TIER_CONFIG[item.metadata?.tier as keyof typeof TIER_CONFIG]?.price || 4.99,
        perks: item.metadata?.perks || [],
        memberCount: item.metadata?.member_count || 0,
      })) as FanClub[];
    },
    enabled: !!myProfile,
  });

  const createClub = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (!myProfile) throw new Error("Create your influencer profile first");

      const perksArray = newClub.perks.split("\n").filter(p => p.trim());

      const { error } = await supabase.from("activity_feed").insert({
        user_id: user.id,
        activity_type: "fan_club_created",
        target_type: "fan_club",
        target_id: myProfile.id,
        metadata: {
          name: newClub.name,
          description: newClub.description,
          tier: newClub.tier,
          perks: perksArray,
          member_count: 0,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fan-clubs"] });
      setShowCreateDialog(false);
      setNewClub({ name: "", description: "", tier: "bronze", perks: "" });
      toast({ title: "✅ Fan Club Created!", description: "Your exclusive fan club is now live" });
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-amber-500/20 border border-amber-500/30">
            <Crown className="h-8 w-8 text-amber-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Fan Club Manager</h2>
            <p className="text-muted-foreground">Create exclusive paid fan clubs with tiered perks</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Create Fan Club
        </Button>
      </motion.div>

      {!myProfile ? (
        <Card className="p-12 text-center">
          <Lock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Create your influencer profile first to manage fan clubs</p>
        </Card>
      ) : isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : fanClubs.length === 0 ? (
        <Card className="p-12 text-center backdrop-blur-xl bg-card/80 border-primary/10">
          <Heart className="h-16 w-16 mx-auto mb-4 text-muted-foreground/30" />
          <h3 className="text-xl font-bold mb-2">No Fan Clubs Yet</h3>
          <p className="text-muted-foreground mb-4">Create your first exclusive fan club and start earning from your most loyal followers</p>
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Create Your First Club
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {fanClubs.map((club, i) => {
            const config = TIER_CONFIG[club.tier];
            const TierIcon = config.icon;
            return (
              <motion.div key={club.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}>
                <Card className={`backdrop-blur-xl bg-card/80 ${config.border} border hover:shadow-lg transition-all`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className={`p-2 rounded-lg ${config.bg}`}>
                        <TierIcon className={`h-6 w-6 ${config.color}`} />
                      </div>
                      <Badge className={`${config.bg} ${config.color} border-none capitalize`}>{club.tier}</Badge>
                    </div>
                    <CardTitle className="text-lg mt-2">{club.name}</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-muted-foreground">{club.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{club.memberCount} members</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-bold text-green-500">€{club.price}/mo</span>
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
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
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
              <Textarea value={newClub.description} onChange={(e) => setNewClub({ ...newClub, description: e.target.value })}
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
                placeholder="Early access to content&#10;Exclusive behind-the-scenes&#10;Monthly Q&A sessions" rows={4} />
            </div>
            <Button onClick={() => createClub.mutate()} disabled={createClub.isPending || !newClub.name.trim()}
              className="w-full gap-2">
              {createClub.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Crown className="h-4 w-4" />}
              {createClub.isPending ? "Creating..." : "Create Fan Club"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FanClubManager;
