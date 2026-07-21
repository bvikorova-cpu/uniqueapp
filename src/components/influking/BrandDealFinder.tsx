import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft, Briefcase, DollarSign, Users, Clock, CheckCircle,
  Send, Loader2, Filter, Star, Sparkles,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface BrandDealFinderProps {
  onBack: () => void;
}

interface BrandDeal {
  id: string;
  brand: string;
  logo: string;
  category: string;
  budget: string;
  requirements: string;
  description: string;
  deadline: string;
  applicants: number;
  deal_type: string;
}

const GENERATE_COST = 3;

const BrandDealFinder = ({ onBack }: BrandDealFinderProps) => {
  const { toast } = useToast();
  const qc = useQueryClient();
  const [selectedDeal, setSelectedDeal] = useState<BrandDeal | null>(null);
  const [showApplyDialog, setShowApplyDialog] = useState(false);
  const [pitch, setPitch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["brand-deal-finder", "list"],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("brand-deal-finder", {
        body: { action: "list" },
      });
      if (error) throw error;
      return data as { deals: BrandDeal[]; appliedDealIds: string[] };
    },
  });

  const deals: BrandDeal[] = data?.deals ?? [];
  const appliedDealIds = new Set(data?.appliedDealIds ?? []);

  const generate = useMutation({
    mutationFn: async () => {
      const { data, error } = await supabase.functions.invoke("brand-deal-finder", {
        body: { action: "generate" },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
      return data;
    },
    onSuccess: (d: any) => {
      toast({
        title: "✨ Fresh AI deals generated",
        description: `${d.deals?.length ?? 0} matched to your profile. ${d.creditsRemaining ?? 0} credits left.`,
      });
      qc.invalidateQueries({ queryKey: ["brand-deal-finder"] });
    },
    onError: (e: any) => {
      const msg = e?.message || "Failed to generate";
      if (msg.includes("INSUFFICIENT_CREDITS")) {
        toast({
          title: "Not enough credits",
          description: `You need ${GENERATE_COST} AI credits to generate.`,
          variant: "destructive",
        });
      } else {
        toast({ title: "Error", description: msg, variant: "destructive" });
      }
    },
  });

  const applyForDeal = useMutation({
    mutationFn: async () => {
      if (!selectedDeal) throw new Error("Select a deal");
      if (pitch.trim().length < 20) throw new Error("Pitch must be at least 20 characters");
      const { data, error } = await supabase.functions.invoke("brand-deal-finder", {
        body: { action: "apply", dealId: selectedDeal.id, pitch },
      });
      if (error) throw error;
      if ((data as any)?.error) throw new Error((data as any).error);
    },
    onSuccess: () => {
      toast({ title: "✅ Application Sent!", description: `Your pitch has been sent to ${selectedDeal?.brand}` });
      setShowApplyDialog(false);
      setPitch("");
      qc.invalidateQueries({ queryKey: ["brand-deal-finder"] });
    },
    onError: (e: any) => toast({ title: "Error", description: e.message, variant: "destructive" }),
  });

  const filteredDeals = filterCategory ? deals.filter(d => d.category === filterCategory) : deals;
  const categories = [...new Set(deals.map(d => d.category))];

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
      <FloatingHowItWorks
        title="Brand Deal Finder — How it works"
        steps={[
          { title: "Set up profile", desc: "Add your influencer profile (category, followers) so AI can match relevant deals." },
          { title: "Generate deals", desc: `Tap Generate — OpenAI creates 6 tailored brand opportunities (${GENERATE_COST} credits).` },
          { title: "Apply with a pitch", desc: "Send a personalized pitch (min 20 chars). Applications are saved in the database." },
          { title: "Track status", desc: "Your applications appear as Applied. Brands / admins review and update status." },
        ]}
      />
      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
          <Button variant="ghost" onClick={onBack} className="gap-2 mb-4">
            <ArrowLeft className="h-4 w-4" /> Back to Hub
          </Button>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30">
              <Briefcase className="h-8 w-8 text-emerald-500" />
            </div>
            <div>
              <h2 className="text-2xl font-black">Brand Deal Finder</h2>
              <p className="text-muted-foreground">AI-matched sponsorship opportunities</p>
            </div>
          </div>
          <Button onClick={() => generate.mutate()} disabled={generate.isPending} className="gap-2">
            {generate.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Generate with AI ({GENERATE_COST} credits)
          </Button>
        </motion.div>

        {/* Category Filters */}
        {categories.length > 0 && (
          <div className="flex flex-wrap gap-2">
            <Button variant={!filterCategory ? "default" : "outline"} size="sm" onClick={() => setFilterCategory(null)}>
              <Filter className="h-3 w-3 mr-1" /> All Deals
            </Button>
            {categories.map((cat) => (
              <Button key={cat} variant={filterCategory === cat ? "default" : "outline"} size="sm"
                onClick={() => setFilterCategory(cat)}>{cat}</Button>
            ))}
          </div>
        )}

        {/* Deals Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="h-6 w-6 animate-spin mr-2" /> Loading deals...
          </div>
        ) : filteredDeals.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center space-y-3">
              <Sparkles className="h-10 w-10 mx-auto text-primary" />
              <p className="font-medium">No brand deals yet</p>
              <p className="text-sm text-muted-foreground">
                Tap <b>Generate with AI</b> to create 6 opportunities tailored to your influencer profile.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDeals.map((deal, i) => (
              <motion.div key={deal.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}>
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
                      <Badge className={`${typeColors[deal.deal_type] || ""} border text-[10px]`}>{deal.deal_type}</Badge>
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
                        <span className="truncate">{deal.requirements}</span>
                      </div>
                    </div>

                    {appliedDealIds.has(deal.id) ? (
                      <Button disabled className="w-full gap-2" variant="outline" size="sm">
                        <CheckCircle className="h-4 w-4 text-green-500" /> Applied
                      </Button>
                    ) : (
                      <Button className="w-full gap-2" size="sm"
                        onClick={() => { setSelectedDeal(deal); setShowApplyDialog(true); }}>
                        <Send className="h-4 w-4" /> Apply Now
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

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
                  <p className="font-medium">{selectedDeal.deal_type}</p>
                  <p className="text-sm text-muted-foreground">{selectedDeal.description}</p>
                  <p className="text-sm font-bold text-green-500">{selectedDeal.budget}</p>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">Your Pitch (min 20 chars)</label>
                  <Textarea value={pitch} onChange={(e) => setPitch(e.target.value)}
                    placeholder="Tell the brand why you're the perfect fit for this campaign..."
                    rows={5} />
                </div>
                <Button onClick={() => applyForDeal.mutate()}
                  disabled={applyForDeal.isPending || pitch.trim().length < 20}
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

