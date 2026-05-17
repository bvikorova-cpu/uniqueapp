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
import { ArrowLeft, Star, Users, Trophy, Target, Heart, Link as LinkIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useDonationReturn } from "@/hooks/useDonationReturn";
import { CampaignDetailEnhancements, CampaignDetailLiveFeed } from '@/components/fundraising/CampaignDetailEnhancements';
import { CampaignPayoutPanel } from '@/components/fundraising/CampaignPayoutPanel';
import { PendingCampaignGuard } from '@/components/fundraising/PendingCampaignGuard';
import { SponsorTiers } from '@/components/fundraising/talent/SponsorTiers';
import { MilestoneProofs } from '@/components/fundraising/talent/MilestoneProofs';
import { PortfolioShowcase } from '@/components/fundraising/talent/PortfolioShowcase';

interface TalentCampaign {
  id: string;
  title: string;
  description: string;
  story: string;
  talent_type: string;
  target_amount: number;
  current_amount: number;
  images: string[];
  video_url: string;
  portfolio_url: string;
  achievements: string[];
  goals: string[];
  sponsors_count: number;
  premium_subscriber: boolean;
  status: string;
  user_id: string;
  created_at: string;
}

const talentTypeLabels: Record<string, string> = {
  music: '🎵 Music',
  art: '🎨 Visual Arts',
  sports: '⚽ Sports',
  dance: '💃 Dance',
  acting: '🎭 Acting/Theater',
  writing: '✍️ Writing',
  other: '⭐ Other Talent',
};

export default function TalentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<TalentCampaign | null>(null);
  const [loading, setLoading] = useState(true);
  const [donating, setDonating] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setCurrentUserId(data.user?.id ?? null));
  }, []);
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
        .from('talent_campaigns')
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
        description: 'Minimum sponsorship is €1',
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
          campaignType: 'talent',
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
          description: 'Please complete your sponsorship in the new window',
        });
      }
    } catch (error) {
      console.error('Error creating sponsorship:', error);
      toast({
        title: 'Error',
        description: 'Failed to process sponsorship',
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
          <Button onClick={() => navigate('/fundraising/talent')}>
            Back to Talent Sponsorship
          </Button>
        </div>
      </div>
    );
  }

  const progress = Math.min((campaign.current_amount / campaign.target_amount) * 100, 100);

  return (
    <PendingCampaignGuard campaign={campaign as any}>
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Button variant="outline" size="sm" onClick={() => navigate('/fundraising/talent')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Talent Sponsorship
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <PortfolioShowcase
              images={campaign.images || []}
              videoUrl={campaign.video_url}
              portfolioUrl={campaign.portfolio_url}
            />

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
                  <CardTitle className="text-3xl">{campaign.title}</CardTitle>
                  <div className="flex flex-col gap-2">
                    <Badge variant="secondary">{talentTypeLabels[campaign.talent_type]}</Badge>
                    {campaign.premium_subscriber && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Star className="h-3 w-3" />
                        Premium
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-lg">{campaign.description}</CardDescription>
                {campaign.portfolio_url && (
                  <Button variant="link" className="p-0 h-auto" asChild>
                    <a href={campaign.portfolio_url} target="_blank" rel="noopener noreferrer">
                      <LinkIcon className="mr-2 h-4 w-4" />
                      View Portfolio
                    </a>
                  </Button>
                )}
              </CardHeader>
            </Card>

            {campaign.achievements && campaign.achievements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-5" />
                    Achievements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {campaign.achievements.map((achievement, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-primary mt-1">•</span>
                        <span>{achievement}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {campaign.goals && campaign.goals.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Future Goals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {campaign.goals.map((goal, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-accent mt-1">•</span>
                        <span>{goal}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle>My Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{campaign.story}</p>
              </CardContent>
            </Card>

            <MilestoneProofs campaignId={campaign.id} isOwner={currentUserId === campaign.user_id} />
            <SponsorTiers campaignId={campaign.id} isOwner={currentUserId === campaign.user_id} />
          </div>

          <div className="space-y-6">
            <CampaignDetailEnhancements
              currentAmount={campaign.current_amount}
              targetAmount={campaign.target_amount}
              supportersCount={campaign.sponsors_count ?? 0}
              campaignType="talent"
            />
            <CampaignPayoutPanel
              campaignType="talent"
              campaignId={campaign.id}
              ownerUserId={campaign.user_id}
            />
            <Card>
              <CardHeader>
                <CardTitle>Sponsorship Progress</CardTitle>
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
                  <span>{campaign.sponsors_count} sponsors</span>
                </div>
              </CardContent>
            </Card>

            {campaign.status === 'active' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Heart className="h-5 w-5 text-accent" />
                    Become a Sponsor
                  </CardTitle>
                  <CardDescription>Support rising talent</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Sponsorship Amount (€) *</Label>
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
                      Monthly sponsorship
                    </Label>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="anonymous"
                      checked={donationData.isAnonymous}
                      onCheckedChange={(checked) => setDonationData({ ...donationData, isAnonymous: checked as boolean })}
                    />
                    <Label htmlFor="anonymous" className="text-sm font-normal cursor-pointer">
                      Sponsor anonymously
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
                      placeholder="Words of encouragement for the talent..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleDonate} disabled={donating} className="w-full" size="lg">
                    <Heart className="mr-2 h-5 w-5" />
                    {donating ? 'Processing...' : 'Sponsor Now'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Your donation includes a platform service fee of 10% to ensure security, verification, and technical maintenance. Secure payment via Stripe.
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
