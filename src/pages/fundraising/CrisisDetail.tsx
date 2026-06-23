import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { ArrowLeft, AlertTriangle, Users, MapPin, Clock, Heart, CheckCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useDonationReturn } from "@/hooks/useDonationReturn";
import { formatDistanceToNow } from 'date-fns';
import { CampaignDetailEnhancements, CampaignDetailLiveFeed } from '@/components/fundraising/CampaignDetailEnhancements';
import { CampaignDiscussion } from '@/components/fundraising/CampaignDiscussion';
import { CampaignPayoutPanel } from '@/components/fundraising/CampaignPayoutPanel';
import { PendingCampaignGuard } from '@/components/fundraising/PendingCampaignGuard';
import { CrisisUpdatesTimeline } from '@/components/fundraising/crisis/CrisisUpdatesTimeline';
import { CrisisPartnersList } from '@/components/fundraising/crisis/CrisisPartnersList';
import { CampaignShareWidget } from '@/components/fundraising/CampaignShareWidget';
import { CrisisDistributionMap } from '@/components/fundraising/crisis/CrisisDistributionMap';

interface CrisisCampaign {
  id: string;
  title: string;
  description: string;
  story: string;
  crisis_type: string;
  location: string;
  target_amount: number;
  current_amount: number;
  images: string[];
  video_url: string;
  supporters_count: number;
  urgent: boolean;
  verified: boolean;
  status: string;
  expires_at: string;
  user_id: string;
  created_at: string;
}

const crisisTypeLabels: Record<string, string> = {
  natural_disaster: '🌪️ Natural Disaster',
  fire: '🔥 Fire',
  flood: '🌊 Flood',
  accident: '🚗 Accident',
  family_emergency: '👨‍👩‍👧 Family Emergency',
  other: '⚠️ Other Crisis',
};

export default function CrisisDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<CrisisCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [donationData, setDonationData] = useState({
    amount: '',
    isMonthly: false,
    isAnonymous: false,
    message: '',
    donorEmail: '',
    donorName: '',
  });
  useDonationReturn(() => fetchCampaign());

  useEffect(() => {
    if (id) {
      fetchCampaign();
    }
  }, [id]);

  const fetchCampaign = async () => {
    try {
      const { data, error } = await supabase
        .from('crisis_campaigns')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      setCampaign(data);
    } catch (error) {
      console.error('Error fetching campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaign',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDonate = async () => {
    const amount = parseFloat(donationData.amount);
    if (isNaN(amount) || amount < 1) {
      toast({
        title: 'Error',
        description: 'Minimum donation is €1',
        variant: 'destructive',
      });
      return;
    }

    if (!donationData.donorEmail && !donationData.donorName) {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: 'Error',
          description: 'Please provide your email and name, or log in',
          variant: 'destructive',
        });
        return;
      }
    }

    setDonating(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase.functions.invoke('create-campaign-donation', {
        body: {
          campaignId: id,
          campaignType: 'crisis',
          amount,
          isMonthly: donationData.isMonthly,
          isAnonymous: donationData.isAnonymous,
          message: donationData.message,
          donorEmail: donationData.donorEmail,
          donorName: donationData.donorName,
        },
        headers: session ? { Authorization: `Bearer ${session.access_token}` } : {},
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, '_blank');
        toast({
          title: 'Redirecting to payment',
          description: 'Please complete your donation in the new window',
        });
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      toast({
        title: 'Error',
        description: 'Failed to process donation',
        variant: 'destructive',
      });
    } finally {
      setDonating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading campaign...</p>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Campaign not found</p>
          <Button onClick={() => navigate('/fundraising/crisis')}>
            Back to Crisis Relief
          </Button>
        </div>
      </div>
    );
  }

  const progress = Math.min((campaign.current_amount / campaign.target_amount) * 100, 100);
  const timeLeft = campaign.expires_at ? formatDistanceToNow(new Date(campaign.expires_at), { addSuffix: true }) : null;

  return (
    <PendingCampaignGuard campaign={campaign as any}>
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" size="sm" onClick={() => navigate('/fundraising/crisis')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Crisis Relief
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {campaign.images && campaign.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                {campaign.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`Crisis ${idx + 1}`} className="w-full h-64 object-cover" />
                ))}
              </div>
            )}

            {campaign.status === 'pending' && (
              <Card className="border-yellow-500">
                <CardContent className="pt-6">
                  <p className="text-center text-muted-foreground">
                    ⏳ This campaign is pending admin approval
                  </p>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <CardTitle className="text-3xl flex items-center gap-2">
                    {campaign.title}
                    {campaign.urgent && <AlertTriangle className="h-8 w-8 text-destructive" />}
                  </CardTitle>
                  <div className="flex flex-col gap-2">
                    <Badge variant="secondary">{crisisTypeLabels[campaign.crisis_type]}</Badge>
                    {campaign.urgent && (
                      <Badge variant="destructive">URGENT</Badge>
                    )}
                    {campaign.verified && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-lg">{campaign.description}</CardDescription>
                {campaign.location && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                    <MapPin className="h-4 w-4" />
                    <span>{campaign.location}</span>
                  </div>
                )}
                {timeLeft && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span>Ends {timeLeft}</span>
                  </div>
                )}
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>What Happened</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{campaign.story}</p>
              </CardContent>
            </Card>

            <CrisisUpdatesTimeline campaignId={campaign.id} ownerUserId={campaign.user_id} />
            <CrisisDistributionMap campaignId={campaign.id} ownerUserId={campaign.user_id} />
            <CrisisPartnersList campaignId={campaign.id} ownerUserId={campaign.user_id} />

            {campaign.video_url && (
              <Card>
                <CardHeader>
                  <CardTitle>Video</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="aspect-video">
                    <iframe
                      src={campaign.video_url.replace('watch?v=', 'embed/')}
                      className="w-full h-full rounded"
                      allowFullScreen
                    />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <CampaignDetailEnhancements
              currentAmount={campaign.current_amount}
              targetAmount={campaign.target_amount}
              supportersCount={campaign.supporters_count}
              campaignType="crisis"
            />
            <CampaignDiscussion campaignId={campaign.id} campaignType="crisis" ownerUserId={campaign.user_id} />
            <CampaignPayoutPanel
              campaignType="crisis"
              campaignId={campaign.id}
              ownerUserId={campaign.user_id}
            />
            <CampaignShareWidget
              campaignType="crisis"
              campaignId={campaign.id}
              title={campaign.title}
              description={campaign.description}
              goalAmount={campaign.target_amount}
              raisedAmount={campaign.current_amount}
              imageUrl={campaign.images?.[0]}
            />
            <Card>
              <CardHeader>
                <CardTitle>Campaign Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="font-bold text-2xl text-primary">
                      €{campaign.current_amount.toFixed(2)}
                    </span>
                    <span className="text-muted-foreground">
                      of €{campaign.target_amount.toFixed(2)}
                    </span>
                  </div>
                  <Progress value={progress} className="h-3" />
                  <p className="text-sm text-muted-foreground mt-2">{progress.toFixed(0)}% funded</p>
                </div>

                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{campaign.supporters_count} supporters</span>
                </div>
              </CardContent>
            </Card>

            {campaign.status === 'active' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-destructive" />
                    Help Now
                  </CardTitle>
                  <CardDescription>Every donation makes a difference</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Donation Amount (€) *</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={donationData.amount}
                      onChange={(e) => setDonationData({ ...donationData, amount: e.target.value })}
                      placeholder="10"
                      min="1"
                      step="1"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="monthly"
                      checked={donationData.isMonthly}
                      onCheckedChange={(checked) => setDonationData({ ...donationData, isMonthly: checked as boolean })}
                    />
                    <Label htmlFor="monthly" className="text-sm font-normal cursor-pointer">
                      Monthly donation
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={donationData.isAnonymous}
                      onCheckedChange={(checked) => setDonationData({ ...donationData, isAnonymous: checked as boolean })}
                    />
                    <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
                      Donate anonymously
                    </Label>
                  </div>

                  <div>
                    <Label htmlFor="donorName">Your Name</Label>
                    <Input
                      id="donorName"
                      value={donationData.donorName}
                      onChange={(e) => setDonationData({ ...donationData, donorName: e.target.value })}
                      placeholder="John Doe"
                    />
                  </div>

                  <div>
                    <Label htmlFor="donorEmail">Your Email</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      value={donationData.donorEmail}
                      onChange={(e) => setDonationData({ ...donationData, donorEmail: e.target.value })}
                      placeholder="john@example.com"
                    />
                  </div>

                  <div>
                    <Label htmlFor="message">Message (optional)</Label>
                    <Textarea
                      id="message"
                      value={donationData.message}
                      onChange={(e) => setDonationData({ ...donationData, message: e.target.value })}
                      placeholder="Words of support..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleDonate} disabled={donating} className="w-full" size="lg">
                    <Heart className="mr-2 h-5 w-5" />
                    {donating ? 'Processing...' : 'Donate Now'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Your donation includes a platform service fee of 8% to ensure security, verification, and technical maintenance. Secure payment via Stripe.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
      <CampaignDetailLiveFeed />
    </div>
    </PendingCampaignGuard>
  );
}
