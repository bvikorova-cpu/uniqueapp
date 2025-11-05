import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
} from "lucide-react";

export default function MembershipCommunity() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

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

  const sampleCreators = [
    {
      id: 1,
      name: "Sarah Fitness Pro",
      category: "Fitness & Health",
      subscribers: 2847,
      tiers: ["$9.99/mo", "$29.99/mo", "$99.99/mo"],
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
      isVerified: true,
    },
    {
      id: 2,
      name: "Tech Mentor Mike",
      category: "Business & Education",
      subscribers: 1523,
      tiers: ["$14.99/mo", "$49.99/mo"],
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
      isVerified: true,
    },
    {
      id: 3,
      name: "Creative Artist Emma",
      category: "Art & Design",
      subscribers: 3291,
      tiers: ["$7.99/mo", "$24.99/mo", "$74.99/mo"],
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&q=80",
      isVerified: false,
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
      const { error } = await supabase
        .from("creator_profiles")
        .insert({
          user_id: user.id,
          display_name: user.email?.split("@")[0] || "Creator",
          bio: "New creator on the platform",
        });

      if (error) throw error;

      toast({
        title: "Success!",
        description: "Your creator profile has been created. Start building your community!",
      });
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
          <Button size="lg" onClick={handleBecomeCreator} disabled={loading}>
            <Crown className="mr-2 h-5 w-5" />
            Become a Creator
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate("/browse-creators")}>
            <Users className="mr-2 h-5 w-5" />
            Browse Creators
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
          <div className="p-6 rounded-lg bg-card border">
            <div className="text-3xl font-bold text-primary mb-1">15-20%</div>
            <div className="text-sm text-muted-foreground">Platform Fee</div>
          </div>
          <div className="p-6 rounded-lg bg-card border">
            <div className="text-3xl font-bold text-primary mb-1">80-85%</div>
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

      {/* Sample Creators */}
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-3xl font-bold text-center mb-12">Featured Creators</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sampleCreators.map((creator) => (
            <Card key={creator.id} className="hover:shadow-lg transition-all">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <img
                    src={creator.avatar}
                    alt={creator.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{creator.name}</CardTitle>
                      {creator.isVerified && (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <CardDescription>{creator.category}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                  <Users className="h-4 w-4" />
                  <span>{creator.subscribers.toLocaleString()} subscribers</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {creator.tiers.map((tier, i) => (
                    <Badge key={i} variant="secondary">
                      {tier}
                    </Badge>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline" onClick={() => navigate(`/creator/${creator.id}`)}>
                  <Heart className="mr-2 h-4 w-4" />
                  View Profile
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
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
              Get paid monthly as your community grows. Keep 80-85% of all subscription revenue
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