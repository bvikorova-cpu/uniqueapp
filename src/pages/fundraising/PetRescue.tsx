import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, AlertCircle, Users, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface PetCampaign {
  id: string;
  pet_name: string;
  pet_type: string;
  title: string;
  description: string;
  target_amount: number;
  current_amount: number;
  urgent: boolean;
  medical_condition: string;
  shelter_name: string;
  images: string[];
  supporters_count: number;
  status: string;
  created_at: string;
}

const petTypeLabels: Record<string, string> = {
  dog: '🐕 Dog',
  cat: '🐈 Cat',
  bird: '🐦 Bird',
  rabbit: '🐰 Rabbit',
  other: '🐾 Other',
};

export default function PetRescue() {
  const [campaigns, setCampaigns] = useState<PetCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('all');
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
  }, [filter]);

  const fetchCampaigns = async () => {
    try {
      let query = supabase
        .from('pet_rescue_campaigns')
        .select('*')
        .eq('status', 'active')
        .order('urgent', { ascending: false })
        .order('created_at', { ascending: false });

      if (filter !== 'all' && filter !== 'urgent') {
        query = query.eq('pet_type', filter);
      } else if (filter === 'urgent') {
        query = query.eq('urgent', true);
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 pt-24 pb-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            🐾 Pet Rescue Network
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Help animals in need get the medical treatment and homes they deserve
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/fundraising/pet/create')}
            className="bg-gradient-to-r from-primary to-primary/80"
          >
            <Heart className="mr-2 h-5 w-5" />
            Help an Animal
          </Button>
        </div>

        <Alert className="mb-8 border-primary/20 bg-primary/5">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            <div className="space-y-2">
              <p className="font-semibold">How Pet Rescue Network Works:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li><strong>Create a Campaign:</strong> Animal shelters, rescue organizations, or individuals caring for animals can create campaigns. Include pet's story, medical condition, and shelter information.</li>
                <li><strong>Urgent Cases Priority:</strong> Mark campaigns as urgent for critical medical situations. Urgent cases receive priority visibility for immediate support.</li>
                <li><strong>Verified Organizations:</strong> Campaigns from registered shelters and rescues undergo verification to ensure legitimacy.</li>
                <li><strong>Photo & Video Support:</strong> Upload multiple images and videos to help supporters connect with the animals.</li>
                <li><strong>Platform Fee:</strong> 6% fee covers operations and secure payment processing. 94% goes directly to pet's care.</li>
                <li><strong>Success Stories:</strong> Share updates and photos of recovered animals to show impact and inspire more support.</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            All Animals
          </Button>
          <Button
            variant={filter === 'urgent' ? 'default' : 'outline'}
            onClick={() => setFilter('urgent')}
          >
            <AlertCircle className="mr-2 h-4 w-4" />
            Urgent Cases
          </Button>
          {Object.entries(petTypeLabels).map(([key, label]) => (
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
                {campaign.images && campaign.images.length > 0 && (
                  <div className="h-48 overflow-hidden relative">
                    <img
                      src={campaign.images[0]}
                      alt={campaign.pet_name}
                      className="w-full h-full object-cover"
                    />
                    {campaign.urgent && (
                      <Badge variant="destructive" className="absolute top-2 right-2">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Urgentné
                      </Badge>
                    )}
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{campaign.pet_name}</CardTitle>
                    <Badge variant="secondary">
                      {petTypeLabels[campaign.pet_type]}
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
                    <Progress value={getProgress(campaign.current_amount, campaign.target_amount)} />
                  </div>
                  
                  <div className="space-y-1 text-sm pt-2 border-t">
                    <p><strong>Condition:</strong> {campaign.medical_condition}</p>
                    <p><strong>Shelter:</strong> {campaign.shelter_name}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{campaign.supporters_count} supporters</span>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/fundraising/pet/${campaign.id}`)}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Pomôcť {campaign.pet_name}
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
