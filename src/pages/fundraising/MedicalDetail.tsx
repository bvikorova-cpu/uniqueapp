import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import { Heart, CheckCircle, Clock, Users, ArrowLeft, Share2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';

interface MedicalCampaign {
  id: string;
  title: string;
  description: string;
  story: string;
  patient_name: string;
  diagnosis: string;
  hospital: string;
  target_amount: number;
  current_amount: number;
  image_url: string;
  video_url: string;
  verified: boolean;
  monthly_donors_count: number;
  one_time_donors_count: number;
  created_at: string;
  ends_at: string;
  user_id: string;
}

interface Donation {
  id: string;
  donor_name: string;
  amount: number;
  message: string;
  is_anonymous: boolean;
  is_monthly: boolean;
  created_at: string;
}

export default function MedicalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [campaign, setCampaign] = useState<MedicalCampaign | null>(null);
  const [donations, setDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);

  // Donation form
  const [amount, setAmount] = useState('');
  const [customAmount, setCustomAmount] = useState('');
  const [isMonthly, setIsMonthly] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [message, setMessage] = useState('');
  const [donorName, setDonorName] = useState('');
  const [donorEmail, setDonorEmail] = useState('');

  const predefinedAmounts = [5, 10, 25, 50, 100];

  useEffect(() => {
    fetchCampaign();
    fetchDonations();
    
    // Check for successful donation
    const sessionId = searchParams.get('session_id');
    if (searchParams.get('donation') === 'success' && sessionId) {
      verifyDonation(sessionId);
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('medical_campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa načítať kampaň',
        variant: 'destructive',
      });
      navigate('/fundraising/medical');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_donations')
        .select('*')
        .eq('campaign_id', id)
        .eq('campaign_type', 'medical')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) throw error;
      setDonations(data || []);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const verifyDonation = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-donation', {
        body: { sessionId },
      });

      if (error) throw error;

      if (data.verified) {
        toast({
          title: 'Ďakujeme!',
          description: `Váš príspevok ${data.donation.amount}€ bol úspešne spracovaný.`,
        });
        // Refresh campaign data
        fetchCampaign();
        fetchDonations();
      }
    } catch (error) {
      console.error('Error verifying donation:', error);
    }
  };

  const handleDonate = async () => {
    const finalAmount = amount === 'custom' ? parseFloat(customAmount) : parseFloat(amount);

    if (!finalAmount || finalAmount < 1) {
      toast({
        title: 'Chyba',
        description: 'Minimálna suma daru je 1€',
        variant: 'destructive',
      });
      return;
    }

    if (!donorEmail) {
      toast({
        title: 'Chyba',
        description: 'Zadajte prosím váš email',
        variant: 'destructive',
      });
      return;
    }

    setDonating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();

      const { data, error } = await supabase.functions.invoke('create-campaign-donation', {
        body: {
          campaignId: id,
          campaignType: 'medical',
          amount: finalAmount,
          isMonthly,
          isAnonymous,
          message,
          donorEmail,
          donorName: isAnonymous ? null : donorName,
        },
        headers: session ? {
          Authorization: `Bearer ${session.access_token}`,
        } : undefined,
      });

      if (error) throw error;

      if (data.url) {
        window.open(data.url, '_blank');
        toast({
          title: 'Presmerovanie',
          description: 'Otvorili sme platobnú bránu v novom okne',
        });
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      toast({
        title: 'Chyba',
        description: 'Nepodarilo sa vytvoriť platbu',
        variant: 'destructive',
      });
    } finally {
      setDonating(false);
    }
  };

  const getProgress = () => {
    if (!campaign) return 0;
    return Math.min((campaign.current_amount / campaign.target_amount) * 100, 100);
  };

  const getDaysLeft = () => {
    if (!campaign?.ends_at) return null;
    const days = Math.ceil((new Date(campaign.ends_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: campaign?.title,
        text: campaign?.description,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: 'Link skopírovaný',
        description: 'Link na kampaň bol skopírovaný do schránky',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Načítavam...</p>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/fundraising/medical')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Späť na kampane
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-3xl mb-2">{campaign.title}</CardTitle>
                    <p className="text-muted-foreground">{campaign.description}</p>
                  </div>
                  {campaign.verified && (
                    <Badge variant="default" className="ml-4">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Overené
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                {campaign.image_url && (
                  <img
                    src={campaign.image_url}
                    alt={campaign.title}
                    className="w-full h-96 object-cover rounded-lg"
                  />
                )}

                <div>
                  <h3 className="text-xl font-semibold mb-2">Príbeh</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{campaign.story}</p>
                </div>

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Pacient</p>
                    <p className="font-medium">{campaign.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Diagnóza</p>
                    <p className="font-medium">{campaign.diagnosis}</p>
                  </div>
                  {campaign.hospital && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Nemocnica</p>
                      <p className="font-medium">{campaign.hospital}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card>
              <CardHeader>
                <CardTitle>Najnovšie príspevky</CardTitle>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    Zatiaľ žiadne príspevky
                  </p>
                ) : (
                  <div className="space-y-4">
                    {donations.map((donation) => (
                      <div key={donation.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">
                            {donation.is_anonymous ? 'Anonymný darca' : (donation.donor_name || 'Anonymný darca')}
                          </p>
                          {donation.message && (
                            <p className="text-sm text-muted-foreground mt-1">{donation.message}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true, locale: sk })}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-primary">{donation.amount.toFixed(2)}€</p>
                          {donation.is_monthly && (
                            <Badge variant="secondary" className="text-xs mt-1">Mesačne</Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Donation Stats */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div>
                  <div className="flex justify-between text-lg font-semibold mb-2">
                    <span>{campaign.current_amount.toFixed(2)}€</span>
                    <span className="text-muted-foreground">z {campaign.target_amount.toFixed(2)}€</span>
                  </div>
                  <Progress value={getProgress()} className="h-3" />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <p className="text-2xl font-bold">{campaign.monthly_donors_count + campaign.one_time_donors_count}</p>
                    <p className="text-sm text-muted-foreground">Darcov</p>
                  </div>
                  {getDaysLeft() !== null && (
                    <div className="text-center">
                      <p className="text-2xl font-bold">{getDaysLeft()}</p>
                      <p className="text-sm text-muted-foreground">Dní zostáva</p>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => document.getElementById('donate-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Prispieť teraz
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Zdieľať kampaň
                </Button>
              </CardContent>
            </Card>

            {/* Donation Form */}
            <Card id="donate-form">
              <CardHeader>
                <CardTitle>Váš príspevok</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Vyberte sumu</label>
                  <div className="grid grid-cols-3 gap-2">
                    {predefinedAmounts.map((amt) => (
                      <Button
                        key={amt}
                        variant={amount === amt.toString() ? 'default' : 'outline'}
                        onClick={() => {
                          setAmount(amt.toString());
                          setCustomAmount('');
                        }}
                      >
                        {amt}€
                      </Button>
                    ))}
                  </div>
                  <Button
                    variant={amount === 'custom' ? 'default' : 'outline'}
                    className="w-full mt-2"
                    onClick={() => setAmount('custom')}
                  >
                    Vlastná suma
                  </Button>
                  {amount === 'custom' && (
                    <Input
                      type="number"
                      placeholder="Zadajte sumu"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="mt-2"
                      min="1"
                    />
                  )}
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="monthly"
                    checked={isMonthly}
                    onCheckedChange={(checked) => setIsMonthly(checked as boolean)}
                  />
                  <label
                    htmlFor="monthly"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Mesačný príspevok
                  </label>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Input
                    placeholder="Vaše meno"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    disabled={isAnonymous}
                  />
                  <Input
                    type="email"
                    placeholder="Váš email *"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    required
                  />
                </div>

                <Textarea
                  placeholder="Správa (voliteľné)"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  rows={3}
                />

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="anonymous"
                    checked={isAnonymous}
                    onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
                  />
                  <label
                    htmlFor="anonymous"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Darovať anonymne
                  </label>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleDonate}
                  disabled={donating || !amount || (!customAmount && amount === 'custom')}
                >
                  {donating ? 'Spracovávam...' : `Darovať ${amount === 'custom' ? customAmount || '0' : amount}€`}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Poplatok platformy: 6% • Bezpečná platba cez Stripe
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
