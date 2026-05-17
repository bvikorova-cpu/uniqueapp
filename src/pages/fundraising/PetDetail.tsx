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
import { ArrowLeft, PawPrint, Users, AlertTriangle, Heart } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useDonationReturn } from "@/hooks/useDonationReturn";
import { CampaignDetailEnhancements, CampaignDetailLiveFeed } from '@/components/fundraising/CampaignDetailEnhancements';
import { CampaignPayoutPanel } from '@/components/fundraising/CampaignPayoutPanel';
import { PendingCampaignGuard } from '@/components/fundraising/PendingCampaignGuard';
import { PetAdoptionStatus } from '@/components/fundraising/pet/PetAdoptionStatus';
import { PetVetPartnerCard } from '@/components/fundraising/pet/PetVetPartnerCard';
import { PetProgressGallery } from '@/components/fundraising/pet/PetProgressGallery';
import { CampaignShareWidget } from '@/components/fundraising/CampaignShareWidget';

interface PetCampaign {
  id: string;
  title: string;
  description: string;
  story: string;
  pet_name: string;
  pet_type: string;
  medical_condition: string;
  shelter_name: string;
  target_amount: number;
  current_amount: number;
  images: string[];
  video_url: string;
  supporters_count: number;
  urgent: boolean;
  status: string;
  user_id: string;
  created_at: string;
}

const petTypeLabels: Record<string, string> = {
  dog: '🐕 Dog',
  cat: '🐈 Cat',
  bird: '🦜 Bird',
  rabbit: '🐰 Rabbit',
  other: '🐾 Other',
};

export default function PetDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<PetCampaign | null>(null);
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
        .from('pet_rescue_campaigns')
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
          campaignType: 'pet',
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
          <Button onClick={() => navigate('/fundraising/pet')}>
            Back to Pet Rescue
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
        <Button variant="outline" size="sm" onClick={() => navigate('/fundraising/pet')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Pet Rescue
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {campaign.images && campaign.images.length > 0 && (
              <div className="grid grid-cols-2 gap-2 rounded-lg overflow-hidden">
                {campaign.images.map((img, idx) => (
                  <img key={idx} src={img} alt={`${campaign.pet_name} ${idx + 1}`} className="w-full h-64 object-cover" />
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
                  <div>
                    <CardTitle className="text-3xl flex items-center gap-2">
                      {campaign.pet_name} {campaign.urgent && <AlertTriangle className="h-6 w-6 text-destructive" />}
                    </CardTitle>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="secondary">{petTypeLabels[campaign.pet_type]}</Badge>
                      {campaign.urgent && (
                        <Badge variant="destructive">URGENT</Badge>
                      )}
                    </div>
                    {campaign.medical_condition && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Condition: {campaign.medical_condition}
                      </p>
                    )}
                    {campaign.shelter_name && (
                      <p className="text-sm text-muted-foreground">
                        Shelter: {campaign.shelter_name}
                      </p>
                    )}
                  </div>
                </div>
                <CardDescription className="text-lg">{campaign.description}</CardDescription>
              </CardHeader>
            </Card>

            <PetAdoptionStatus
              status={(campaign as any).adoption_status || 'in_treatment'}
              petName={campaign.pet_name}
              adopterName={(campaign as any).adopter_name}
              adoptedAt={(campaign as any).adopted_at}
              intakeDate={(campaign as any).intake_date}
            />

            <Card>
              <CardHeader>
                <CardTitle>{campaign.pet_name}'s Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{campaign.story}</p>
              </CardContent>
            </Card>

            <PetProgressGallery
              campaignId={campaign.id}
              ownerUserId={campaign.user_id}
              petName={campaign.pet_name}
            />

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
            <PetVetPartnerCard
              clinicName={(campaign as any).vet_clinic_name}
              contact={(campaign as any).vet_contact}
              licenseNumber={(campaign as any).vet_license_number}
              verified={(campaign as any).vet_verified}
            />
            <CampaignDetailEnhancements
              currentAmount={campaign.current_amount}
              targetAmount={campaign.target_amount}
              supportersCount={campaign.supporters_count ?? 0}
              campaignType="pet"
            />
            <CampaignPayoutPanel
              campaignType="pet"
              campaignId={campaign.id}
              ownerUserId={campaign.user_id}
            />
            <CampaignShareWidget
              campaignType="pet"
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
                    <Heart className="h-5 w-5 text-primary" />
                    Help {campaign.pet_name}
                  </CardTitle>
                  <CardDescription>Save a life today</CardDescription>
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
                      placeholder="Get well soon, {campaign.pet_name}..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleDonate} disabled={donating} className="w-full" size="lg">
                    <Heart className="mr-2 h-5 w-5" />
                    {donating ? 'Processing...' : 'Donate Now'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Your donation includes a platform service fee of 6% to ensure security, verification, and technical maintenance. Secure payment via Stripe.
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
