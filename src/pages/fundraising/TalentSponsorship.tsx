import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Star, Users, Award, ExternalLink, Crown, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TalentCampaign {
  id: string;
  title: string;
  description: string;
  talent_type: string;
  target_amount: number;
  current_amount: number;
  portfolio_url: string;
  achievements: string[];
  goals: string[];
  images: string[];
  sponsors_count: number;
  premium_subscriber: boolean;
  created_at: string;
}

const talentTypeLabels: Record<string, string> = {
  music: '🎵 Music',
  sports: '⚽ Sports',
  art: '🎨 Art',
  dance: '💃 Dance',
  other: '⭐ Other',
};

export default function TalentSponsorship() {
  const [campaigns, setCampaigns] = useState<TalentCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      let query = supabase
        .from('talent_campaigns')
        .select('*')
        .eq('status', 'active')
        .order('premium_subscriber', { ascending: false })
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('talent_type', filter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setCampaigns(data || []);
    } catch (error) {
      console.error('Error fetching campaigns:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaigns',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
            🎭 Talent Sponsorship Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Support young talents on their journey to success
          </p>
          
          <Alert className="mb-6 max-w-3xl mx-auto text-left">
            <Info className="h-5 w-5" />
            <AlertDescription className="mt-2">
              <strong className="block mb-2">How Talent Sponsorship Works:</strong>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Showcase Your Talent:</strong> Young artists, athletes, musicians, dancers, and creators can present their portfolios and goals</li>
                <li>• <strong>Build Your Story:</strong> Share achievements, training goals, competition plans, and equipment needs</li>
                <li>• <strong>Premium Visibility:</strong> Premium subscribers get featured placement with special badges and priority visibility</li>
                <li>• <strong>Platform Fee:</strong> 10% platform fee (highest rate due to marketing support and premium features)</li>
                <li>• <strong>Ongoing Support:</strong> Sponsors can provide monthly recurring support or one-time donations</li>
                <li>• <strong>Portfolio Integration:</strong> Link to your portfolio, social media, and showcase your work with images and videos</li>
                <li>• <strong>Growth Tracking:</strong> Track sponsor count and funding progress toward your goals</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button 
            size="lg" 
            onClick={() => navigate('/fundraising/talent/create')}
            className="bg-gradient-to-r from-accent to-accent/80"
          >
            <Star className="mr-2 h-5 w-5" />
            Showcase Your Talent
          </Button>
        </div>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Talents
          </Button>
          {Object.entries(talentTypeLabels).map(([key, label]) => (
            <Button
              key={key}
              variant={filter === key ? 'default' : 'outline'}
              onClick={() => setFilter(key)}
            >
              {label}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Loading talents...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No active campaigns</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id} className={`overflow-hidden hover:shadow-lg transition-shadow ${campaign.premium_subscriber ? 'border-accent' : ''}`}>
                {campaign.images && campaign.images.length > 0 && (
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={campaign.images[0]}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                    {campaign.premium_subscriber && (
                      <Badge className="absolute top-2 left-2 bg-gradient-to-r from-accent to-accent/80">
                        <Crown className="h-3 w-3 mr-1" />
                        Premium
                      </Badge>
                    )}
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{campaign.title}</CardTitle>
                    <Badge variant="secondary">
                      {talentTypeLabels[campaign.talent_type]}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-2">
                    {campaign.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="font-semibold">
                        €{campaign.current_amount.toFixed(2)}
                      </span>
                      <span className="text-muted-foreground">
                        of €{campaign.target_amount.toFixed(2)}
                      </span>
                    </div>
                    <Progress value={getProgress(campaign.current_amount, campaign.target_amount)} />
                  </div>
                  
                  {campaign.achievements && campaign.achievements.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1 flex items-center gap-1">
                        <Award className="h-4 w-4" />
                        Achievements:
                      </p>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {campaign.achievements.slice(0, 2).join(', ')}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{campaign.sponsors_count} sponsors</span>
                    </div>
                    {campaign.portfolio_url && (
                      <a 
                        href={campaign.portfolio_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-1 text-primary hover:underline"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Portfolio
                      </a>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/fundraising/talent/${campaign.id}`)}
                  >
                    <Star className="mr-2 h-4 w-4" />
                    Become a Sponsor
                  </Button>
                </CardFooter>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
