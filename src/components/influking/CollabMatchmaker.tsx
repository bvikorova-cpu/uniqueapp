import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Handshake, Users, Search, Send, CheckCircle, Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface CollabMatchmakerProps {
  onBack: () => void;
}

const CollabMatchmaker = ({ onBack }: CollabMatchmakerProps) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedInfluencer, setSelectedInfluencer] = useState<any>(null);
  const [collabMessage, setCollabMessage] = useState("");
  const [showProposalDialog, setShowProposalDialog] = useState(false);

  const CATEGORIES = ["Fashion & Beauty", "Gaming", "Fitness & Health", "Travel", "Food & Cooking", "Technology", "Music", "Comedy", "Education", "Lifestyle"];

  const { data: influencers = [], isLoading } = useQuery({
    queryKey: ["collab-influencers", searchQuery, selectedCategory],
    queryFn: async () => {
      let query = supabase
        .from("influencer_profiles")
        .select("*")
        .eq("is_active", true)
        .order("followers_count", { ascending: false })
        .limit(30);

      if (selectedCategory) {
        query = query.eq("category", selectedCategory);
      }

      if (searchQuery.trim()) {
        query = query.ilike("display_name", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const { data: myProfile } = useQuery({
    queryKey: ["my-influencer-collab"],
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

  const sendProposal = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (!myProfile) throw new Error("Create your influencer profile first");
      if (!selectedInfluencer) throw new Error("Select an influencer");

      // Send as a message in the platform
      const { error } = await supabase.from("bazaar_messages").insert({
        sender_id: user.id,
        receiver_id: selectedInfluencer.user_id,
        item_id: selectedInfluencer.id,
        message: `🤝 Collaboration Proposal from ${myProfile.display_name}:\n\n${collabMessage}`,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast({ title: "✅ Proposal Sent!", description: "Your collaboration proposal has been delivered" });
      setShowProposalDialog(false);
      setCollabMessage("");
      setSelectedInfluencer(null);
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const getCompatibilityScore = (inf: any): number => {
    if (!myProfile) return 0;
    let score = 50;
    if (inf.category === myProfile.category) score += 20;
    const followerRatio = Math.min(inf.followers_count, myProfile.followers_count) / 
                          Math.max(inf.followers_count, myProfile.followers_count, 1);
    score += Math.round(followerRatio * 30);
    return Math.min(score, 99);
  };

  return (
    <>
      <FloatingHowItWorks title={"Collab Matchmaker - How it works"} steps={[{ title: 'Open', desc: 'Access the Collab Matchmaker section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Collab Matchmaker.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-pink-500/20 border border-pink-500/30">
            <Handshake className="h-8 w-8 text-pink-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Collab Matchmaker</h2>
            <p className="text-muted-foreground">Find perfect collaboration partners and grow together</p>
          </div>
        </div>
      </motion.div>

      {/* Search & Filter */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search influencers..." value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)} className="pl-10" />
        </div>
      </motion.div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        <Button variant={!selectedCategory ? "default" : "outline"} size="sm"
          onClick={() => setSelectedCategory(null)}>All</Button>
        {CATEGORIES.map((cat) => (
          <Button key={cat} variant={selectedCategory === cat ? "default" : "outline"} size="sm"
            onClick={() => setSelectedCategory(cat)}>{cat}</Button>
        ))}
      </div>

      {/* Results */}
      {isLoading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {influencers.map((inf, i) => {
            const compatibility = getCompatibilityScore(inf);
            return (
              <motion.div key={inf.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
                <Card className="backdrop-blur-xl bg-card/80 border-primary/10 hover:border-primary/30 transition-all group cursor-pointer"
                  onClick={() => { setSelectedInfluencer(inf); setShowProposalDialog(true); }}>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-12 w-12 border-2 border-primary/20">
                        <AvatarImage src={inf.profile_photo_url || undefined} />
                        <AvatarFallback>{inf.display_name?.[0]}</AvatarFallback>
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1">
                          <h3 className="font-bold text-sm truncate">{inf.display_name}</h3>
                          {inf.is_verified && <CheckCircle className="h-4 w-4 text-blue-500 fill-blue-500 shrink-0" />}
                        </div>
                        <Badge variant="secondary" className="text-[10px]">{inf.category}</Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-center mb-3">
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">Followers</p>
                        <p className="font-bold text-sm">{inf.followers_count?.toLocaleString()}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">Likes</p>
                        <p className="font-bold text-sm">{inf.total_likes?.toLocaleString()}</p>
                      </div>
                      <div className="bg-muted/50 rounded-lg p-2">
                        <p className="text-xs text-muted-foreground">Match</p>
                        <p className={`font-bold text-sm ${compatibility > 70 ? "text-green-500" : compatibility > 40 ? "text-amber-500" : "text-muted-foreground"}`}>
                          {compatibility}%
                        </p>
                      </div>
                    </div>

                    <Button variant="outline" className="w-full gap-2 group-hover:bg-primary group-hover:text-primary-foreground transition-colors" size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedInfluencer(inf);
                        setShowProposalDialog(true);
                      }}>
                      <Send className="h-3 w-3" /> Send Proposal
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Proposal Dialog */}
      <Dialog open={showProposalDialog} onOpenChange={setShowProposalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Handshake className="h-5 w-5 text-pink-500" />
              Send Collaboration Proposal
            </DialogTitle>
          </DialogHeader>
          {selectedInfluencer && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={selectedInfluencer.profile_photo_url || undefined} />
                  <AvatarFallback>{selectedInfluencer.display_name?.[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-bold">{selectedInfluencer.display_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedInfluencer.category} • {selectedInfluencer.followers_count?.toLocaleString()} followers</p>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Your proposal message</label>
                <Textarea value={collabMessage} onChange={(e) => setCollabMessage(e.target.value)}
                  placeholder="Hi! I'd love to collaborate on a project together. Here's my idea..."
                  rows={4} />
              </div>
              <Button onClick={() => sendProposal.mutate()} disabled={sendProposal.isPending || !collabMessage.trim()} className="w-full gap-2">
                {sendProposal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {sendProposal.isPending ? "Sending..." : "Send Proposal"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default CollabMatchmaker;
