import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import {
  Users,
  Crown,
  MessageCircle,
  TrendingUp,
  Star,
  Calendar,
  CheckCircle2,
  Sparkles,
  Heart,
  Search,
  Gift,
} from "lucide-react";

interface Creator {
  id: string;
  user_id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  total_subscribers: number;
  is_verified: boolean;
}

export default function MembershipCommunity() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredCreators, setFilteredCreators] = useState<Creator[]>([]);
  const [loadingCreators, setLoadingCreators] = useState(true);
  const [myCreatorProfile, setMyCreatorProfile] = useState<Creator | null>(null);

  useEffect(() => {
    loadCreators();
    checkMyCreatorProfile();
  }, []);

  const checkMyCreatorProfile = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (data) {
        setMyCreatorProfile(data);
      }
    } catch (error) {
      console.error("Error checking creator profile:", error);
    }
  };

  useEffect(() => {
    if (searchTerm) {
      const filtered = creators.filter(
        (creator) =>
          creator.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          creator.bio?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCreators(filtered);
    } else {
      setFilteredCreators(creators);
    }
  }, [searchTerm, creators]);

  const loadCreators = async () => {
    try {
      const { data, error } = await supabase
        .from("creator_profiles")
        .select("*")
        .order("total_subscribers", { ascending: false });

      if (error) throw error;

      setCreators(data || []);
      setFilteredCreators(data || []);
    } catch (error: any) {
      console.error("Error loading creators:", error);
    } finally {
      setLoadingCreators(false);
    }
  };

  const features = [
    {
      icon: Crown,
      title: "Exclusive Content",
      description: "Share premium posts, videos, and resources with your paying members only",
    },
    {
      icon: MessageCircle,
      title: "Community Chat",
      description: "Discord-style group chats for different membership tiers",
    },
    {
      icon: TrendingUp,
      title: "Creator Dashboard",
      description: "Track earnings, subscriber growth, and engagement metrics",
    },
    {
      icon: Calendar,
      title: "Content Scheduling",
      description: "Schedule posts in advance and maintain consistent engagement",
    },
  ];

  const handleBecomeCreator = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please sign in to become a creator",
          variant: "destructive",
        });
        navigate("/auth");
        return;
      }

      // Check if user already has a creator profile
      const { data: existingProfile } = await supabase
        .from("creator_profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (existingProfile) {
        toast({
          title: "Already a Creator",
          description: "You already have a creator profile!",
        });
        return;
      }

      // Create creator profile
      const { data: newProfile, error } = await supabase
        .from("creator_profiles")
        .insert({
          user_id: user.id,
          display_name: user.email?.split("@")[0] || "Creator",
          bio: "New creator on the platform",
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your creator profile has been created. Redirecting to your profile...",
      });

      // Redirect to the new creator profile
      if (newProfile) {
        navigate(`/creator/${newProfile.id}`);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">SFW Community-First Platform</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-purple-500 to-pink-500 bg-clip-text text-transparent">
          Build Your Exclusive Community
        </h1>
        
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
          Create recurring revenue with monthly subscriptions. Share exclusive content, 
          host private communities, and connect directly with your most dedicated fans.
        </p>

        <div className="flex flex-wrap gap-4 justify-center mb-12">
          {myCreatorProfile ? (
            <Button size="lg" onClick={() => navigate(`/creator/${myCreatorProfile.id}`)}>
              <Crown className="mr-2 h-5 w-5" />
              My Creator Profile
            </Button>
          ) : (
            <Button size="lg" onClick={handleBecomeCreator} disabled={loading}>
              <Crown className="mr-2 h-5 w-5" />
              Become a Creator
            </Button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-lg bg-card border">
            <div className="text-3xl font-bold text-primary mb-1">10%</div>
            <div className="text-sm text-muted-foreground">Platform Fee</div>
          </div>
          <div className="p-6 rounded-lg bg-card border">
            <div className="text-3xl font-bold text-primary mb-1">90%</div>
            <div className="text-sm text-muted-foreground">You Keep</div>
          </div>
          <div className="p-6 rounded-lg bg-card border">
            <div className="text-3xl font-bold text-primary mb-1">∞</div>
            <div className="text-sm text-muted-foreground">Content Types</div>
          </div>
          <div className="p-6 rounded-lg bg-card border">
            <div className="text-3xl font-bold text-primary mb-1">Real-time</div>
            <div className="text-sm text-muted-foreground">Community Chat</div>
          </div>
        </div>
      </section>

      {/* About Section - What is Membership Community */}
      <section className="container mx-auto px-4 py-16">
        <Card className="border-2">
          <CardHeader>
            <CardTitle className="text-2xl">What is Membership Community?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Membership Community is a premium subscription platform similar to Patreon or OnlyFans (SFW version), 
              designed for creators who want to monetize their content and build dedicated fan communities. 
              Whether you're a fitness coach, educator, artist, musician, or business mentor, our platform 
              provides all the tools you need to earn recurring revenue from your most loyal supporters.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  For Creators: How to Start Earning
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>Sign in</strong> to your account or create a new one</li>
                  <li>Click <strong>"Become a Creator"</strong> button to set up your profile</li>
                  <li>Customize your <strong>creator profile</strong> with a bio and avatar</li>
                  <li>Create <strong>subscription tiers</strong> with different price points (e.g., €5, €15, €50/month)</li>
                  <li>Define <strong>exclusive benefits</strong> for each tier (content access, direct messages, shoutouts)</li>
                  <li>Start posting <strong>exclusive content</strong> for your subscribers</li>
                  <li>Engage with your community through <strong>real-time group chats</strong></li>
                  <li><strong>Receive monthly payouts</strong> - you keep 90% of all earnings!</li>
                </ol>
              </div>
              
              <div className="space-y-4">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  For Fans: How to Support Creators
                </h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-muted-foreground">
                  <li><strong>Browse creators</strong> in the discovery section below</li>
                  <li>Use the <strong>search bar</strong> to find creators by name or topic</li>
                  <li>Click <strong>"View"</strong> to see a creator's profile and content preview</li>
                  <li>Choose a <strong>subscription tier</strong> that fits your budget</li>
                  <li>Complete payment via <strong>secure Stripe checkout</strong></li>
                  <li>Access <strong>exclusive content</strong> immediately after subscribing</li>
                  <li>Join <strong>community chats</strong> and interact with the creator and other fans</li>
                  <li>Send <strong>tips and gifts</strong> to show extra appreciation</li>
                </ol>
              </div>
            </div>

            <div className="bg-secondary/30 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-lg">Creator Revenue Model</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="space-y-2">
                  <div className="font-medium text-primary">You Keep 90%</div>
                  <p className="text-muted-foreground">Industry-leading payout rate. For every €100 in subscriptions, you receive €90 directly to your account.</p>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-primary">Monthly Payouts</div>
                  <p className="text-muted-foreground">Automatic monthly payments to your bank account or PayPal. No minimum threshold required.</p>
                </div>
                <div className="space-y-2">
                  <div className="font-medium text-primary">Multiple Revenue Streams</div>
                  <p className="text-muted-foreground">Earn from subscriptions, tips, gifts, and exclusive paid content. Maximize your income potential.</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-6">
              <h3 className="font-semibold text-lg mb-3">Content You Can Share</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><strong>• Posts & Articles:</strong> Text updates, behind-the-scenes stories, exclusive announcements</li>
                <li><strong>• Photos & Videos:</strong> Premium visual content available only to subscribers</li>
                <li><strong>• Live Sessions:</strong> Host live streams and Q&A sessions for your community</li>
                <li><strong>• Courses & Tutorials:</strong> Educational content, workout plans, cooking recipes, business advice</li>
                <li><strong>• Community Chats:</strong> Discord-style group conversations with different access levels per tier</li>
                <li><strong>• Direct Messages:</strong> Personal 1-on-1 communication with top-tier subscribers</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Everything You Need to Succeed</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-all">
              <CardHeader>
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Browse All Creators */}
      <section className="container mx-auto px-4 py-16 bg-muted/30">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Browse All Creators</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Discover amazing creators and support them with memberships and gifts
          </p>
        </div>

        {/* Search */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search creators by name or bio..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Creators Grid */}
        {loadingCreators ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Loading creators...</p>
          </div>
        ) : filteredCreators.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">
              {searchTerm ? "No creators found matching your search" : "No creators yet"}
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCreators.map((creator) => (
              <Card key={creator.id} className="hover:shadow-lg transition-all">
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-white font-bold text-2xl">
                      {creator.display_name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg truncate">{creator.display_name}</CardTitle>
                        {creator.is_verified && (
                          <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <CardDescription className="line-clamp-2">
                        {creator.bio || "No bio yet"}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{creator.total_subscribers || 0} subscribers</span>
                  </div>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button
                    className="flex-1"
                    variant="outline"
                    onClick={() => navigate(`/creator/${creator.id}`)}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    View
                  </Button>
                  <Button
                    variant="default"
                    onClick={() => navigate(`/creator/${creator.id}`)}
                  >
                    <Gift className="h-4 w-4" />
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">1</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Create Your Profile</h3>
            <p className="text-muted-foreground">
              Set up your creator profile and define your membership tiers with exclusive benefits
            </p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">2</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Share Exclusive Content</h3>
            <p className="text-muted-foreground">
              Post premium content, host live chats, and engage with your community members
            </p>
          </div>
          <div className="text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-primary">3</span>
            </div>
            <h3 className="text-xl font-semibold mb-2">Earn Recurring Revenue</h3>
            <p className="text-muted-foreground">
              Get paid monthly as your community grows. Keep 90% of all subscription revenue
            </p>
          </div>
        </div>
      </section>

      {/* Comparison */}
      <section className="container mx-auto px-4 py-16">
        <Card className="max-w-4xl mx-auto border-2 border-primary/20">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Why Choose Our Platform?</CardTitle>
            <CardDescription>
              Built for creators who value community and want to keep more of their earnings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Similar to Patreon/OnlyFans
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span>Monthly recurring subscriptions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span>Exclusive content for paying members</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span>Direct creator-fan relationships</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                    <span>Multiple subscription tiers</span>
                  </li>
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="font-semibold text-lg flex items-center gap-2">
                  <Star className="h-5 w-5 text-primary" />
                  Our Unique Features
                </h4>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-primary mt-0.5" />
                    <span>Community-focused (Discord-style group chats)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-primary mt-0.5" />
                    <span>SFW-first (fitness, education, business mentors)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-primary mt-0.5" />
                    <span>Real-time chat and live interactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Star className="h-4 w-4 text-primary mt-0.5" />
                    <span>Integrated with our course platform</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to Build Your Community?</h2>
          <p className="text-lg text-muted-foreground mb-8">
            Join thousands of creators who are earning recurring revenue while building meaningful connections
          </p>
          <Button size="lg" onClick={handleBecomeCreator} disabled={loading}>
            <Crown className="mr-2 h-5 w-5" />
            Start Creating Today
          </Button>
          <p className="text-sm text-muted-foreground mt-4">
            No credit card required • Set up in minutes • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}