import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, Briefcase, DollarSign, Users, Clock, CheckCircle, Send, Loader2, Filter, Building2, TrendingUp, Star } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface BrandDealFinderProps {
  onBack: () => void;
}

const BRAND_DEALS = [
  {
    id: "1", brand: "FitPro Supplements", logo: "💪", category: "Fitness & Health",
    budget: "€500 - €2,000", requirements: "Min 5K followers, fitness niche",
    description: "Looking for fitness influencers to promote our new protein powder line. Create 3 posts + 5 stories over 2 weeks.",
    deadline: "2026-04-15", applicants: 23, type: "Sponsored Post",
  },
  {
    id: "2", brand: "TechVault", logo: "🖥️", category: "Technology",
    budget: "€1,000 - €5,000", requirements: "Min 10K followers, tech reviews",
    description: "Review our latest gaming headset. Full creative freedom. Keep the product + get paid.",
    deadline: "2026-04-20", applicants: 45, type: "Product Review",
  },
  {
    id: "3", brand: "WanderLux Travel", logo: "✈️", category: "Travel",
    budget: "€2,000 - €8,000", requirements: "Min 20K followers, travel content",
    description: "All-expenses-paid trip to Bali. Create a travel vlog series (5 episodes). Premium brand partnership.",
    deadline: "2026-05-01", applicants: 89, type: "Brand Ambassador",
  },
  {
    id: "4", brand: "GlowUp Skincare", logo: "✨", category: "Fashion & Beauty",
    budget: "€300 - €1,500", requirements: "Min 3K followers, beauty niche",
    description: "30-day skincare challenge with our products. Document your journey with before/after content.",
    deadline: "2026-04-10", applicants: 56, type: "Challenge Campaign",
  },
  {
    id: "5", brand: "EduSpark Academy", logo: "📚", category: "Education",
    budget: "€800 - €3,000", requirements: "Min 8K followers, educational content",
    description: "Promote our online courses through tutorial-style content. Long-term partnership available.",
    deadline: "2026-04-25", applicants: 18, type: "Affiliate Partnership",
  },
  {
    id: "6", brand: "GameZone", logo: "🎮", category: "Gaming",
    budget: "€1,500 - €6,000", requirements: "Min 15K followers, gaming content",
    description: "Stream our new RPG game for 4 hours with live commentary. Exclusive early access included.",
    deadline: "2026-04-18", applicants: 67, type: "Sponsored Stream",
  },
];

const BrandDealFinder = ({ onBack }: BrandDealFinderProps) => {
  const { toast } = useToast();
  const [selectedDeal, setSelectedDeal] = useState<typeof BRAND_DEALS[0] | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [pitch, setPitch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [appliedDeals, setAppliedDeals] = useState<Set<string>>(new Set());

  const { data: myProfile } = useQuery({
    queryKey: ["my-influencer-deals"],
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

  const applyForDeal = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");
      if (!myProfile) throw new Error("Create your influencer profile first");
      if (!selectedDeal) throw new Error("Select a deal");

      const { error } = await supabase.from("activity_feed").insert({
        user_id: user.id,
        activity_type: "brand_deal_application",
        target_type: "brand_deal",
        target_id: selectedDeal.id,
        metadata: {
          brand: selectedDeal.brand,
          pitch,
          influencer_name: myProfile.display_name,
          followers: myProfile.followers_count,
          category: myProfile.category,
        },
      });
      if (error) throw error;
    },
    onSuccess: () => {
      if (selectedDeal) {
        setAppliedDeals(prev => new Set(prev).add(selectedDeal.id));
      }
      toast({ title: "✅ Application Sent!", description: `Your pitch has been sent to ${selectedDeal?.brand}` });
      setShowApplyDialog(false);
      setPitch("");
    },
    onError: (error: any) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const filteredDeals = filterCategory
    ? BRAND_DEALS.filter(d => d.category === filterCategory)
    : BRAND_DEALS;

  const categories = [...new Set(BRAND_DEALS.map(d => d.category))];

  const typeColors: Record<string, string> = {
    "Sponsored Post": "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "Product Review": "bg-green-500/10 text-green-500 border-green-500/20",
    "Brand Ambassador": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    "Challenge Campaign": "bg-pink-500/10 text-pink-500 border-pink-500/20",
    "Affiliate Partnership": "bg-amber-500/10 text-amber-500 border-amber-500/20",
    "Sponsored Stream": "bg-red-500/10 text-red-500 border-red-500/20",
  };

  return (
    <>
      <FloatingHowItWorks title={"Brand Deal Finder - How it works"} steps={[{ title: 'Open', desc: 'Access the Brand Deal Finder section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Brand Deal Finder.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
        <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
          <ArrowLeft className="h-4 w-4" /> Back to Hub
        </Button>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
            <Briefcase className="h-8 w-8 text-emerald-500" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Brand Deal Finder</h2>
            <p className="text-muted-foreground">Browse and apply for sponsored partnership opportunities</p>
          </div>
        </div>
      </motion.div>

      {/* Category Filters */}
      <div className="flex flex-wrap gap-2">
        <Button variant={!filterCategory ? "default" : "outline"} size="sm" onClick={() => setFilterCategory(null)}>
          <Filter className="h-3 w-3 mr-1" /> All Deals
        </Button>
        {categories.map((cat) => (
          <Button key={cat} variant={filterCategory === cat ? "default" : "outline"} size="sm"
            onClick={() => setFilterCategory(cat)}>{cat}</Button>
        ))}
      </div>

      {/* Deals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredDeals.map((deal, i) => (
          <motion.div key={deal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}>
            <Card className="backdrop-blur-xl bg-card/80 border-primary/10 hover:border-primary/30 transition-all h-full">
              <CardContent className="p-5 flex flex-col h-full">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{deal.logo}</span>
                    <div>
                      <h3 className="font-bold">{deal.brand}</h3>
                      <Badge variant="secondary" className="text-[10px]">{deal.category}</Badge>
                    </div>
                  </div>
                  <Badge className={`${typeColors[deal.type] || ""} border text-[10px]`}>{deal.type}</Badge>
                </div>

                <p className="text-sm text-muted-foreground mb-3 flex-1">{deal.description}</p>

                <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <DollarSign className="h-3 w-3 text-green-500" />
                    <span className="font-medium">{deal.budget}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Users className="h-3 w-3" />
                    <span>{deal.applicants} applied</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>Deadline: {new Date(deal.deadline).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Star className="h-3 w-3" />
                    <span>{deal.requirements}</span>
                  </div>
                </div>

                {appliedDeals.has(deal.id) ? (
                  <Button disabled className="w-full gap-2" variant="outline" size="sm">
                    <CheckCircle className="h-4 w-4 text-green-500" /> Applied
                  </Button>
                ) : (
                  <Button className="w-full gap-2" size="sm" onClick={() => { setSelectedDeal(deal); setShowApplyDialog(true); }}>
                    <Send className="h-4 w-4" /> Apply Now
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Apply Dialog */}
      <Dialog open={showApplyDialog} onOpenChange={setShowApplyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5 text-emerald-500" />
              Apply for {selectedDeal?.brand}
            </DialogTitle>
          </DialogHeader>
          {selectedDeal && (
            <div className="space-y-4">
              <div className="p-3 bg-muted/50 rounded-lg space-y-1">
                <p className="font-medium">{selectedDeal.type}</p>
                <p className="text-sm text-muted-foreground">{selectedDeal.description}</p>
                <p className="text-sm font-bold text-green-500">{selectedDeal.budget}</p>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Your Pitch</label>
                <Textarea value={pitch} onChange={(e) => setPitch(e.target.value)}
                  placeholder="Tell the brand why you're the perfect fit for this campaign..."
                  rows={5} />
              </div>
              <Button onClick={() => applyForDeal.mutate()} disabled={applyForDeal.isPending || !pitch.trim()}
                className="w-full gap-2">
                {applyForDeal.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {applyForDeal.isPending ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
};

export default BrandDealFinder;
