import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface HeroCampaign {
  id: string;
  title: string;
  description: string;
  hero_type: string;
  target_amount: number;
  current_amount: number;
  verified: boolean;
  organization_name: string;
  image_url: string;
  supporters_count: number;
  sponsors: unknown;
  created_at: string;
}

const heroTypeLabels: Record<string, string> = {
  firefighter: '🚒 Firefighters',
  paramedic: '🚑 Paramedics',
  teacher: '👨‍🏫 Teachers',
  volunteer: '🤝 Volunteers',
  other: '🦸 Other Heroes',
};

export default function CommunityHero() {
  const [campaigns, setCampaigns] = useState<HeroCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      let query = supabase
        .from('hero_campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('hero_type', filter);
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
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
            🦸 Community Hero Fund
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Support local heroes and their projects for the community
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/fundraising/hero/create')}
            className="bg-gradient-to-r from-accent to-accent/80"
          >
            <Shield className="mr-2 h-5 w-5" />
            Create Project
          </Button>
        </div>

        <Alert className="mb-8 border-accent/20 bg-accent/5">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p className="font-semibold">How Community Hero Fund Works:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Honor Local Heroes:</strong> Create campaigns for firefighters, paramedics, teachers, volunteers, and community heroes. Fund equipment, training, or community projects.</li>
                <li><strong>Organization-Based:</strong> Campaigns must represent registered organizations. Include official details for verification.</li>
                <li><strong>Verification Process:</strong> Admin review to verify organization legitimacy (typically within 24 hours).</li>
                <li><strong>Corporate Sponsorship:</strong> Attract individual donations and corporate sponsors supporting community initiatives.</li>
                <li><strong>Platform Fee:</strong> Only 5% fee - lowest across all categories. 95% goes directly to the project.</li>
                <li><strong>Full Transparency:</strong> Track donations, view sponsors, share project updates with supporters.</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2 mb-8 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Heroes
          </Button>
          {Object.entries(heroTypeLabels).map(([key, label]) => (
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
              <p className="text-muted-foreground">Loading campaigns...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No active campaigns</p>
            </div>
          ) : (
            campaigns.map((campaign) => (
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {campaign.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={campaign.image_url}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{campaign.title}</CardTitle>
                    <div className="flex flex-col gap-1">
                      <Badge variant="secondary">
                        {heroTypeLabels[campaign.hero_type]}
                      </Badge>
                      {campaign.verified && (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
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
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">{campaign.organization_name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{campaign.supporters_count} supporters</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/fundraising/hero/${campaign.id}`)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Support
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
