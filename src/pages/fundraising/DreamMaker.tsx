import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Users, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface DreamCampaign {
  id: string;
  title: string;
  description: string;
  story: string;
  dream_type: string;
  target_amount: number;
  current_amount: number;
  image_url: string;
  supporters_count: number;
  milestones: unknown;
  created_at: string;
}

const dreamTypeLabels: Record<string, string> = {
  education: '🎓 Education',
  travel: '✈️ Travel',
  startup: '🚀 Startup',
  creative: '🎨 Creative',
  other: '✨ Other',
};

export default function DreamMaker() {
  const [campaigns, setCampaigns] = useState<DreamCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      let query = supabase
        .from('dream_campaigns')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (filter !== 'all') {
        query = query.eq('dream_type', filter);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 bg-clip-text text-transparent">
            ✨ Dream Maker Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Share your dream and let the community help you make it happen
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/fundraising/dream/create')}
            className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg"
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Share Your Dream
          </Button>
        </div>

        <Alert className="mb-8 border-secondary/20 bg-secondary/5">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p className="font-semibold">How Dream Maker Works:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Share Your Dream:</strong> Create a campaign describing your dream - starting a business, pursuing education, traveling, or any creative project. Include your story, goals, and milestones.</li>
                <li><strong>Admin Review:</strong> Campaign reviewed within 24 hours for quality and authenticity before going live.</li>
                <li><strong>Community Support:</strong> Once approved, supporters can contribute any amount to help make your dream reality.</li>
                <li><strong>Milestone Tracking:</strong> Set achievable milestones and update supporters on progress.</li>
                <li><strong>Platform Fee:</strong> 7% fee covers operations and secure Stripe payment processing. You receive 93% of donations.</li>
                <li><strong>Flexible Funding:</strong> Keep what you raise even if you don't reach your full goal.</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2 mb-8 justify-center flex-wrap px-6 overflow-x-auto">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Dreams
          </Button>
          {Object.entries(dreamTypeLabels).map(([key, label]) => (
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
              <p className="text-muted-foreground">Loading dreams...</p>
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
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{campaign.title}</CardTitle>
                    <Badge variant="secondary">
                      {dreamTypeLabels[campaign.dream_type]}
                    </Badge>
                  </div>
                  <CardDescription className="line-clamp-3">
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
                  
                  <div className="flex items-center gap-2 text-sm">
                    <Users className="w-4 h-4 text-muted-foreground" />
                    <span>{campaign.supporters_count} supporters</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/fundraising/dream/${campaign.id}`)}
                  >
                    <Sparkles className="mr-2 h-4 w-4" />
                    Support Dream
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
