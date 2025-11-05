import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Heart, CheckCircle, Clock, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

interface MedicalCampaign {
  id: string;
  title: string;
  description: string;
  patient_name: string;
  diagnosis: string;
  hospital: string;
  target_amount: number;
  current_amount: number;
  image_url: string;
  verified: boolean;
  monthly_donors_count: number;
  one_time_donors_count: number;
  created_at: string;
  ends_at: string;
}

export default function MedicalFundraising() {
  const [campaigns, setCampaigns] = useState<MedicalCampaign[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCampaigns();
    checkUserCampaigns();
  }, []);

  const checkUserCampaigns = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      // Optional: Check if user has campaigns to show dashboard link
    } catch (error) {
      console.error('Error checking user campaigns:', error);
    }
  };

  const fetchCampaigns = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_campaigns')
        .select('*')
        .eq('status', 'active')
        .eq('verified', true)
        .order('created_at', { ascending: false });

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

  const getDaysLeft = (endDate: string) => {
    if (!endDate) return null;
    const days = Math.ceil((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            🏥 Medical Fundraising Hub
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            Pomôžte ľuďom s vážnymi zdravotnými problémami získať potrebnú liečbu
          </p>
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              onClick={() => navigate('/fundraising/medical/create')}
              className="bg-gradient-to-r from-primary to-primary/80"
            >
              <Heart className="mr-2 h-5 w-5" />
              Vytvoriť kampaň
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              onClick={() => navigate('/fundraising/dashboard')}
            >
              Moje kampane
            </Button>
          </div>
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
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-xl">{campaign.title}</CardTitle>
                    {campaign.verified && (
                      <Badge variant="default" className="ml-2">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Overené
                      </Badge>
                    )}
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
                  
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <TrendingUp className="h-4 w-4" />
                      <span>{campaign.monthly_donors_count} mesačných darcov</span>
                    </div>
                    {getDaysLeft(campaign.ends_at) !== null && (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{getDaysLeft(campaign.ends_at)} dní</span>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 border-t">
                    <p className="text-sm">
                      <strong>Pacient:</strong> {campaign.patient_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <strong>Diagnóza:</strong> {campaign.diagnosis}
                    </p>
                    {campaign.hospital && (
                      <p className="text-sm text-muted-foreground">
                        <strong>Nemocnica:</strong> {campaign.hospital}
                      </p>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full" 
                    onClick={() => navigate(`/fundraising/medical/${campaign.id}`)}
                  >
                    <Heart className="mr-2 h-4 w-4" />
                    Prispieť
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
