import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Shield, Users, CheckCircle, Building } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

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
  firefighter: '🚒 Hasiči',
  paramedic: '🚑 Záchranári',
  teacher: '👨‍🏫 Učitelia',
  volunteer: '🤝 Dobrovoľníci',
  other: '🦸 Iní hrdinovia',
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
        title: 'Chyba',
        description: 'Nepodarilo sa načítať kampane',
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
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-accent to-accent/60 bg-clip-text text-transparent">
            🦸 Community Hero Fund
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Podporte lokálnych hrdinov a ich projekty pre komunitu
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate('/fundraising/hero/create')}
            className="bg-gradient-to-r from-accent to-accent/80"
          >
            <Shield className="mr-2 h-5 w-5" />
            Vytvoriť projekt
          </Button>
        </div>

        <div className="flex gap-2 mb-8 justify-center flex-wrap">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            onClick={() => setFilter('all')}
          >
            Všetci hrdinovia
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
              <p className="text-muted-foreground">Načítavam kampane...</p>
            </div>
          ) : campaigns.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">Žiadne aktívne kampane</p>
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
                          Overené
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
                        {campaign.current_amount.toFixed(2)}€
                      </span>
                      <span className="text-muted-foreground">
                        z {campaign.target_amount.toFixed(2)}€
                      </span>
                    </div>
                    <Progress value={getProgress(campaign.current_amount, campaign.target_amount)} />
                  </div>
                  
                  {campaign.organization_name && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Building className="h-4 w-4" />
                      <span>{campaign.organization_name}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{campaign.supporters_count} podporovateľov</span>
                  </div>

                  {campaign.sponsors && Array.isArray(campaign.sponsors) && campaign.sponsors.length > 0 && (
                    <div className="pt-2 border-t">
                      <p className="text-sm font-medium mb-1">Sponzori:</p>
                      <p className="text-sm text-muted-foreground">
                        {campaign.sponsors.length} firemných partnerov
                      </p>
                    </div>
                  )}
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/fundraising/hero/${campaign.id}`)}
                  >
                    <Shield className="mr-2 h-4 w-4" />
                    Podporiť
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
