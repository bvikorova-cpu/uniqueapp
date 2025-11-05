import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  Users, 
  Crown, 
  Lock, 
  MessageCircle, 
  DollarSign,
  TrendingUp,
  Calendar,
  Star,
  CheckCircle2,
  Sparkles
} from 'lucide-react';

interface Creator {
  id: string;
  display_name: string;
  bio: string;
  avatar_url: string;
  total_subscribers: number;
  is_verified: boolean;
}

interface SubscriptionTier {
  id: string;
  name: string;
  description: string;
  price: number;
  benefits: string[];
}

export default function MembershipCommunity() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [creators, setCreators] = useState<Creator[]>([]);
  const [isCreator, setIsCreator] = useState(false);

  useEffect(() => {
    checkAuth();
    loadCreators();
  }, []);

  const checkAuth = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate('/auth');
      return;
    }
    setUser(user);
    
    // Check if user is a creator
    const { data: profile } = await supabase
      .from('creator_profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();
    
    setIsCreator(!!profile);
    setLoading(false);
  };

  const loadCreators = async () => {
    const { data, error } = await supabase
      .from('creator_profiles')
      .select('*')
      .order('total_subscribers', { ascending: false })
      .limit(6);

    if (!error && data) {
      setCreators(data);
    }
  };

  const becomeCreator = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('creator_profiles')
      .insert({
        user_id: user.id,
        display_name: user.email?.split('@')[0] || 'Creator',
        bio: 'New creator on the platform',
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to create creator profile",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success!",
        description: "Welcome to the creator community!",
      });
      setIsCreator(true);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-gray-900">
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16 space-y-4">
          <Badge className="mb-4" variant="secondary">
            <Crown className="w-3 h-3 mr-1" />
            Premium Creator Platform
          </Badge>
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Membership Community Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Build your exclusive community. Share premium content. Earn recurring revenue.
          </p>
          <div className="flex gap-4 justify-center mt-6">
            {!isCreator ? (
              <Button onClick={becomeCreator} size="lg" className="gap-2">
                <Sparkles className="w-4 h-4" />
                Become a Creator
              </Button>
            ) : (
              <Button onClick={() => navigate('/creator-dashboard')} size="lg" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                Creator Dashboard
              </Button>
            )}
            <Button variant="outline" size="lg" className="gap-2">
              <Users className="w-4 h-4" />
              Browse Creators
            </Button>
          </div>
        </div>

        {/* Key Features */}
        <div className="grid md:grid-cols-3 gap-6 mb-16">
          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <Lock className="w-10 h-10 text-purple-600 mb-2" />
              <CardTitle>Exclusive Content</CardTitle>
              <CardDescription>
                Share premium posts, videos, and resources only with paying members
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <MessageCircle className="w-10 h-10 text-pink-600 mb-2" />
              <CardTitle>Community Chat</CardTitle>
              <CardDescription>
                Build engaged communities with real-time group chats and discussions
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:shadow-lg transition-shadow">
            <CardHeader>
              <DollarSign className="w-10 h-10 text-blue-600 mb-2" />
              <CardTitle>Recurring Revenue</CardTitle>
              <CardDescription>
                Earn 80-85% of subscription fees with monthly recurring payments
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Featured Creators */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Featured Creators</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {creators.length > 0 ? (
              creators.map((creator) => (
                <Card key={creator.id} className="hover:shadow-xl transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold">
                          {creator.display_name[0]}
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {creator.display_name}
                            {creator.is_verified && (
                              <CheckCircle2 className="w-4 h-4 text-blue-600" />
                            )}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground">
                            {creator.total_subscribers} members
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{creator.bio}</p>
                    <Button className="w-full">View Profile</Button>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-3 text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <p className="text-muted-foreground">No creators yet. Be the first!</p>
              </div>
            )}
          </div>
        </div>

        {/* How It Works */}
        <Card className="bg-gradient-to-br from-purple-600 to-pink-600 text-white">
          <CardHeader>
            <CardTitle className="text-3xl text-center">How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">1</span>
                </div>
                <h3 className="font-semibold mb-2">Create Profile</h3>
                <p className="text-sm opacity-90">Set up your creator profile and introduce yourself</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">2</span>
                </div>
                <h3 className="font-semibold mb-2">Set Tiers</h3>
                <p className="text-sm opacity-90">Define subscription tiers with different benefits</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">3</span>
                </div>
                <h3 className="font-semibold mb-2">Share Content</h3>
                <p className="text-sm opacity-90">Post exclusive content for your members</p>
              </div>
              <div>
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-2xl font-bold">4</span>
                </div>
                <h3 className="font-semibold mb-2">Earn Money</h3>
                <p className="text-sm opacity-90">Get paid monthly with 80-85% of subscription fees</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Platform Features */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold mb-8 text-center">Platform Features</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-yellow-500" />
                  For Creators
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Multiple subscription tiers with custom pricing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Exclusive content posting (text, images, videos)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Real-time chat rooms for community engagement</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Analytics dashboard with earnings insights</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Content scheduling and management</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-500" />
                  For Members
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Access exclusive content from your favorite creators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Join private community chats and discussions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Direct interaction with creators</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Flexible subscription management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <span>Cancel anytime, no commitments</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-16 text-center">
          <Card className="border-2 border-primary">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Build Your Community?</CardTitle>
              <CardDescription className="text-base">
                Join thousands of creators earning recurring revenue from their passionate communities
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 justify-center">
                {!isCreator && (
                  <Button onClick={becomeCreator} size="lg" className="gap-2">
                    <Crown className="w-4 h-4" />
                    Start Creating Now
                  </Button>
                )}
                <Button variant="outline" size="lg" className="gap-2">
                  <Calendar className="w-4 h-4" />
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
