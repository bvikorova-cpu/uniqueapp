import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Users, MapPin, Clock, CheckCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface CrisisCampaign {
  id: string;
  crisis_type: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  verified: boolean;
  urgent: boolean;
  location: string;
  images: string[];
  supporters_count: number;
  created_at: string;
  expires_at: string;
}

const crisisTypeLabels: Record<string, string> = {
  fire: '🔥 Fire',
  flood: '🌊 Flood',
  accident: '⚠️ Accident',
  natural_disaster: '🌪️ Natural Disaster',
  other: '🆘 Other',
};

export default function CrisisRelief() {
  const [campaigns, setCampaigns] = useState<CrisisCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('crisis_campaigns')
        .select('*')
        .eq('status', 'active')
        .eq('verified', true)
        .order('urgent', { ascending: false })
        .order('created_at', { ascending: false });

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

  const getTimeLeft = (expiresAt: string) => {
    return formatDistanceToNow(new Date(expiresAt), { addSuffix: true });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-destructive/5 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-destructive to-destructive/60 bg-clip-text text-transparent">
            🆘 Crisis Relief Platform
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Rapid help in critical situations - every minute counts
          </p>
          
          <Alert className="mb-6 max-w-3xl mx-auto text-left">
            <Info className="h-5 w-5" />
            <AlertDescription className="mt-2">
              <strong className="block mb-2">How Crisis Relief Works:</strong>
              <ul className="space-y-2 text-sm">
                <li>• <strong>Urgent Response:</strong> Submit verified emergency cases requiring immediate financial help (fires, floods, accidents, natural disasters)</li>
                <li>• <strong>Fast Verification:</strong> All campaigns are verified within 24 hours to ensure authenticity</li>
                <li>• <strong>Time-Limited:</strong> Emergency campaigns have expiration dates to create urgency</li>
                <li>• <strong>Platform Fee:</strong> 8% platform fee (higher than other categories due to urgent verification and processing costs)</li>
                <li>• <strong>Direct Impact:</strong> Funds are released quickly to help those in immediate need</li>
                <li>• <strong>Transparency:</strong> All verified campaigns show location, urgency level, and supporter count</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Button 
            size="lg" 
            onClick={() => navigate('/fundraising/crisis/create')}
            variant="destructive"
          >
            <AlertTriangle className="mr-2 h-5 w-5" />
            Create Emergency Case
          </Button>
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
              <Card key={campaign.id} className="overflow-hidden hover:shadow-lg transition-shadow border-destructive/20">
                {campaign.images && campaign.images.length > 0 && (
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={campaign.images[0]}
                      alt={campaign.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 left-2 right-2 flex justify-between">
                      <Badge variant="destructive" className="animate-pulse">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        URGENTNÉ
                      </Badge>
                      {campaign.verified && (
                        <Badge variant="default">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{campaign.title}</CardTitle>
                    <Badge variant="outline">
                      {crisisTypeLabels[campaign.crisis_type]}
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
                        {campaign.current_amount.toFixed(2)}€
                      </span>
                      <span className="text-muted-foreground">
                        z {campaign.target_amount.toFixed(2)}€
                      </span>
                    </div>
                    <Progress value={getProgress(campaign.current_amount, campaign.target_amount)} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {campaign.location && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span className="truncate">{campaign.location}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1 text-destructive font-medium">
                      <Clock className="h-4 w-4" />
                      <span>{getTimeLeft(campaign.expires_at)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2 border-t">
                    <Users className="h-4 w-4" />
                    <span>{campaign.supporters_count} people helped</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    variant="destructive"
                    onClick={() => navigate(`/fundraising/crisis/${campaign.id}`)}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Help Now
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
