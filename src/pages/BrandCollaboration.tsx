import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Handshake, DollarSign, Star, TrendingUp, Plus, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";
import { User } from "@supabase/supabase-js";
interface Campaign {
  id: string;
  brand_name: string;
  campaign_name: string;
  description: string | null;
  budget_min: number;
  budget_max: number;
  deadline: string;
  tags: string[];
  applications_count: number;
}

const BrandCollaboration = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [isApplyDialogOpen, setIsApplyDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [applicationMessage, setApplicationMessage] = useState("");
  const [portfolioLink, setPortfolioLink] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("brand_campaigns")
      .select("*")
      .eq("status", "active")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load campaigns",
        variant: "destructive",
      });
    } else {
      setCampaigns(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const handleApply = async () => {
    if (!selectedCampaign) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please log in to apply for campaigns",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    const { error } = await supabase
      .from("campaign_applications")
      .insert({
        campaign_id: selectedCampaign.id,
        user_id: user.id,
        message: applicationMessage,
        portfolio_link: portfolioLink || null,
      });

    if (error) {
      if (error.code === "23505") {
        toast({
          title: "Already Applied",
          description: "You have already applied to this campaign",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to submit application",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Success",
        description: "Your application has been submitted",
      });
      setIsApplyDialogOpen(false);
      setApplicationMessage("");
      setPortfolioLink("");
      fetchCampaigns();
    }

    setSubmitting(false);
  };

  const openApplyDialog = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setIsApplyDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary/20 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12 mt-16">
          <Handshake className="w-16 h-16 mx-auto mb-4 text-primary" />
          <h1 className="text-4xl font-bold mb-4">Brand Collaboration Hub</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Connect brands with talented creators. Platform takes 20% of deals.
          </p>
          
          {/* Main CTA Buttons */}
          {!user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/auth?tab=signup&role=creator">
                  <Star className="h-5 w-5 mr-2" />
                  I'm a Creator
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link to="/auth?tab=signup&role=brand">
                  <Handshake className="h-5 w-5 mr-2" />
                  I'm a Brand
                </Link>
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
              <Button asChild size="lg" className="text-lg px-8">
                <a href="#campaigns">
                  <Star className="h-5 w-5 mr-2" />
                  Browse Campaigns
                </a>
              </Button>
              <Button asChild size="lg" variant="outline" className="text-lg px-8">
                <Link to="/brand-dashboard">
                  <Plus className="h-5 w-5 mr-2" />
                  Post a Campaign
                </Link>
              </Button>
            </div>
          )}
          
          <div className="max-w-4xl mx-auto bg-card border rounded-lg p-6 text-left space-y-4">
            <h2 className="text-xl font-semibold">How It Works</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-3 text-sm text-muted-foreground">
                <h3 className="text-foreground font-semibold flex items-center gap-2">
                  <Star className="h-4 w-4 shrink-0 text-primary" />
                  <span>For Creators</span>
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Browse active brand campaigns</li>
                  <li>Apply with your portfolio</li>
                  <li>Get paid for collaborations</li>
                  <li>Keep 80% of every deal</li>
                </ul>
                {!user && (
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link to="/auth?tab=signup&role=creator">
                      Sign up as Creator →
                    </Link>
                  </Button>
                )}
              </div>
              
              <div className="space-y-3 text-sm text-muted-foreground">
                <h3 className="text-foreground font-semibold flex items-center gap-2">
                  <Handshake className="h-4 w-4 shrink-0 text-primary" />
                  <span>For Brands</span>
                </h3>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Post your campaign</li>
                  <li>Reach talented creators</li>
                  <li>Review applications</li>
                  <li>Collaborate on content</li>
                </ul>
                {!user ? (
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link to="/auth?tab=signup&role=brand">
                      Sign up as Brand →
                    </Link>
                  </Button>
                ) : (
                  <Button asChild variant="link" className="p-0 h-auto">
                    <Link to="/brand-dashboard">
                      Go to Brand Dashboard →
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </div>

          {/* Login prompt for non-logged users */}
          {!user && (
            <p className="text-sm text-muted-foreground mt-6">
              Already have an account?{" "}
              <Link to="/auth" className="text-primary hover:underline font-medium">
                Log in here
              </Link>
            </p>
          )}
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6 text-center">
            <Star className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Premium Brands</h3>
            <p className="text-muted-foreground">Work with top companies</p>
          </Card>
          <Card className="p-6 text-center">
            <DollarSign className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Fair Pay</h3>
            <p className="text-muted-foreground">You keep 80%</p>
          </Card>
          <Card className="p-6 text-center">
            <TrendingUp className="w-12 h-12 mx-auto mb-4 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Build Portfolio</h3>
            <p className="text-muted-foreground">Grow your reputation</p>
          </Card>
        </div>

        <div id="campaigns" className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Available Campaigns</h2>
            <Button variant="outline" size="sm" onClick={fetchCampaigns} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          {loading ? (
            <p className="text-muted-foreground text-center py-8">Loading campaigns...</p>
          ) : campaigns.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-2">No active campaigns at the moment</p>
              <p className="text-sm text-muted-foreground">Check back soon for new opportunities!</p>
            </Card>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{campaign.brand_name}</h3>
                    <p className="text-muted-foreground mb-3">{campaign.campaign_name}</p>
                    {campaign.description && (
                      <p className="text-sm text-muted-foreground mb-3">{campaign.description}</p>
                    )}
                    <div className="flex gap-2 flex-wrap">
                      {campaign.tags.map((tag, i) => (
                        <Badge key={i} variant="secondary">{tag}</Badge>
                      ))}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <p className="text-2xl font-bold text-primary mb-1">
                      €{campaign.budget_min}-{campaign.budget_max}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Deadline: {formatDistanceToNow(new Date(campaign.deadline), { addSuffix: true })}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {campaign.applications_count} application{campaign.applications_count !== 1 ? "s" : ""}
                    </p>
                  </div>
                </div>
                <Button className="w-full" onClick={() => openApplyDialog(campaign)}>
                  Apply Now
                </Button>
              </Card>
            ))
          )}
        </div>

        <Dialog open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Apply to Campaign</DialogTitle>
              <DialogDescription>
                {selectedCampaign && (
                  <>
                    Applying to <strong>{selectedCampaign.campaign_name}</strong> by{" "}
                    <strong>{selectedCampaign.brand_name}</strong>
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="message">Message to Brand</Label>
                <Textarea
                  id="message"
                  placeholder="Tell them why you're a great fit..."
                  value={applicationMessage}
                  onChange={(e) => setApplicationMessage(e.target.value)}
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="portfolio">Portfolio Link (Optional)</Label>
                <Input
                  id="portfolio"
                  type="url"
                  placeholder="https://..."
                  value={portfolioLink}
                  onChange={(e) => setPortfolioLink(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setIsApplyDialogOpen(false)} className="flex-1">
                Cancel
              </Button>
              <Button onClick={handleApply} disabled={submitting} className="flex-1">
                {submitting ? "Submitting..." : "Submit Application"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default BrandCollaboration;
