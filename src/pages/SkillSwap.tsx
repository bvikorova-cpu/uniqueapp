import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSkillSwap } from "@/hooks/useSkillSwap";
import { SkillSwapMessages } from "@/components/skill-swap/SkillSwapMessages";
import { SkillMatches } from "@/components/skill-swap/SkillMatches";
import { ArrowLeftRight, Globe, Video, Users, CheckCircle, MessageSquare, Star, Sparkles } from "lucide-react";

interface SkillOffering {
  id: string;
  user_id: string;
  title: string;
  description: string;
  category: string;
  is_active: boolean;
  profiles?: {
    full_name: string;
    rating_average: number;
    total_reviews: number;
    completed_exchanges: number;
  };
}

export default function SkillSwap() {
  const navigate = useNavigate();
  const { subscription, loading, createCheckout } = useSkillSwap();
  const [offerings, setOfferings] = useState<SkillOffering[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newOffering, setNewOffering] = useState({
    title: "",
    description: "",
    category: "teaching",
  });

  useEffect(() => {
    fetchOfferings();
  }, []);

  const fetchOfferings = async () => {
    const { data, error } = await supabase
      .from('skill_offerings')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Error fetching offerings:', error);
      setOfferings([]);
      return;
    }

    // Fetch profiles for all users
    const userIds = data?.map(o => o.user_id) || [];
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, rating_average, total_reviews, completed_exchanges')
      .in('id', userIds);

    const profilesMap = new Map(profilesData?.map(p => [p.id, p]) || []);

    const offeringsWithProfiles = (data || []).map(offering => ({
      ...offering,
      profiles: profilesMap.get(offering.user_id) || undefined
    }));

    setOfferings(offeringsWithProfiles);
  };

  const handleSubscribe = async () => {
    const url = await createCheckout();
    if (url) {
      window.location.href = url;
    }
  };

  const handleAddOffering = async () => {
    if (!newOffering.title || !newOffering.description) {
      toast.error("Please fill in all required fields");
      return;
    }

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in first");
      navigate('/auth');
      return;
    }

    const { error } = await supabase.from('skill_offerings').insert([
      {
        user_id: session.user.id,
        title: newOffering.title,
        description: newOffering.description,
        category: newOffering.category as any,
        is_active: true,
      },
    ]);

    if (error) {
      toast.error("Failed to add skill offering");
      console.error(error);
    } else {
      toast.success("Skill offering added successfully!");
      setShowAddForm(false);
      setNewOffering({
        title: "",
        description: "",
        category: "teaching",
      });
      fetchOfferings();
    }
  };

  const handleRequestExchange = async (offeringId: string) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast.error("Please sign in first");
      navigate('/auth');
      return;
    }

    if (!subscription.hasSubscription) {
      toast.error("Premium subscription required for exchanges");
      return;
    }

    // Get the offering to find the owner
    const { data: offering } = await supabase
      .from('skill_offerings')
      .select('user_id')
      .eq('id', offeringId)
      .single();

    if (!offering) {
      toast.error("Offering not found");
      return;
    }

    // Create or get conversation
    const { data: existingConv } = await supabase
      .from('skill_swap_conversations')
      .select('id')
      .or(`and(user1_id.eq.${session.user.id},user2_id.eq.${offering.user_id}),and(user1_id.eq.${offering.user_id},user2_id.eq.${session.user.id})`)
      .eq('offering_id', offeringId)
      .maybeSingle();

    if (!existingConv) {
      await supabase.from('skill_swap_conversations').insert([
        {
          user1_id: session.user.id,
          user2_id: offering.user_id,
          offering_id: offeringId,
        },
      ]);
    }

    toast.success("Conversation started! Check the Messages tab.");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-16 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-6">
            <ArrowLeftRight className="w-12 h-12 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              Global Skill Swap
            </h1>
          </div>
          
          <p className="text-2xl font-semibold text-foreground mb-4 max-w-3xl mx-auto">
            The Revolutionary Platform for Skill Exchange Without Money
          </p>
          
          <div className="max-w-4xl mx-auto space-y-4 text-lg text-muted-foreground">
            <p>
              Welcome to Global Skill Swap - where knowledge meets opportunity. Our platform connects people worldwide who want to exchange skills without traditional payment. Whether you're a guitar virtuoso looking to learn web development, or a chef wanting to master photography, you'll find the perfect exchange partner here.
            </p>
            
            <p>
              How it works: Simply create a skill offering describing what you can teach, browse through hundreds of available skills from our global community, and request exchanges that interest you. Connect through our real-time messaging system, schedule video lessons, and start learning from experts around the world - all without spending a cent.
            </p>
            
            <p className="font-medium text-foreground">
              Join thousands of learners exchanging skills in categories like teaching, technology, creative arts, repairs, construction, gardening, and more. Your next skill is just an exchange away!
            </p>
          </div>
        </div>

        {/* Premium Features */}
        {!subscription.hasSubscription && (
          <Card className="p-8 mb-12 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Unlock Premium Features</h2>
              <div className="grid md:grid-cols-3 gap-6 mb-6">
                <div className="flex flex-col items-center">
                  <Globe className="w-12 h-12 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Global Exchanges</h3>
                  <p className="text-sm text-muted-foreground">Connect with users worldwide</p>
                </div>
                <div className="flex flex-col items-center">
                  <Video className="w-12 h-12 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Video Lessons</h3>
                  <p className="text-sm text-muted-foreground">Learn through video calls</p>
                </div>
                <div className="flex flex-col items-center">
                  <Users className="w-12 h-12 text-primary mb-2" />
                  <h3 className="font-semibold mb-1">Unlimited Swaps</h3>
                  <p className="text-sm text-muted-foreground">No limits on exchanges</p>
                </div>
              </div>
              <div className="text-3xl font-bold mb-4">€4.99<span className="text-lg text-muted-foreground">/month</span></div>
              <Button onClick={handleSubscribe} size="lg" className="px-8">
                Subscribe Now
              </Button>
            </div>
          </Card>
        )}

        {/* Active Subscription */}
        {subscription.hasSubscription && (
          <Card className="p-6 mb-8 border-green-500/20 bg-green-500/5">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-500" />
              <div>
                <h3 className="font-semibold">Premium Active</h3>
                <p className="text-sm text-muted-foreground">
                  {subscription.subscriptionEnd && `Valid until ${new Date(subscription.subscriptionEnd).toLocaleDateString()}`}
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Main Content Tabs */}
        <Tabs defaultValue="browse" className="mb-8">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3 mb-6">
            <TabsTrigger value="browse" className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Browse Skills
            </TabsTrigger>
            <TabsTrigger value="matches" className="flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Suggested Matches
            </TabsTrigger>
            <TabsTrigger value="messages" className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Messages
            </TabsTrigger>
          </TabsList>

          <TabsContent value="matches">
            <SkillMatches />
          </TabsContent>

          <TabsContent value="browse">
            {/* Add Skill Offering */}
            <div className="mb-8">
          {!showAddForm ? (
            <Button onClick={() => setShowAddForm(true)} className="w-full md:w-auto">
              Offer Your Skill
            </Button>
          ) : (
            <Card className="p-6">
              <h3 className="text-xl font-semibold mb-4">Add Your Skill Offering</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Skill Title</label>
                  <Input
                    placeholder="e.g., Guitar Lessons"
                    value={newOffering.title}
                    onChange={(e) => setNewOffering({ ...newOffering, title: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Description</label>
                  <Textarea
                    placeholder="Describe what you can teach..."
                    value={newOffering.description}
                    onChange={(e) => setNewOffering({ ...newOffering, description: e.target.value })}
                    rows={4}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <select
                    className="w-full p-2 border rounded-md bg-background"
                    value={newOffering.category}
                    onChange={(e) => setNewOffering({ ...newOffering, category: e.target.value })}
                  >
                    <option value="teaching">Teaching</option>
                    <option value="technology">Technology</option>
                    <option value="creative">Creative</option>
                    <option value="repairs">Repairs</option>
                    <option value="construction">Construction</option>
                    <option value="gardening">Gardening</option>
                    <option value="cleaning">Cleaning</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <Button onClick={handleAddOffering}>Add Offering</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>Cancel</Button>
                </div>
              </div>
            </Card>
          )}
        </div>

            {/* Skill Offerings Grid */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Available Skills</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {offerings.map((offering) => (
                  <Card key={offering.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-xl font-semibold">{offering.title}</h3>
                      <Badge variant="secondary">{offering.category}</Badge>
                    </div>
                    <p className="text-muted-foreground mb-4 line-clamp-3">
                      {offering.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <div>
                        <button
                          onClick={() => navigate(`/skill-swap/profile/${offering.user_id}`)}
                          className="text-sm text-primary hover:underline mb-1"
                        >
                          {offering.profiles?.full_name || 'User'}
                        </button>
                        {offering.profiles && (
                          <div className="flex items-center gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                              <span className="font-medium">{offering.profiles.rating_average.toFixed(1)}</span>
                              <span className="text-muted-foreground">({offering.profiles.total_reviews})</span>
                            </div>
                            <span className="text-muted-foreground">•</span>
                            <span className="text-muted-foreground">
                              {offering.profiles.completed_exchanges} exchanges
                            </span>
                          </div>
                        )}
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleRequestExchange(offering.id)}
                        disabled={!subscription.hasSubscription}
                      >
                        Request Exchange
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
              {offerings.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <p>No skill offerings yet. Be the first to add one!</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="messages">
            <SkillSwapMessages />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}