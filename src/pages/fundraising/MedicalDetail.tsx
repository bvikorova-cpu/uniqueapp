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
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Heart, CheckCircle, Clock, Users, ArrowLeft, Share2, Copy, Check, Facebook, Twitter, Mail } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { sk } from 'date-fns/locale';
import { CampaignDetailEnhancements, CampaignDetailLiveFeed } from '@/components/fundraising/CampaignDetailEnhancements';
import { CampaignPayoutPanel } from '@/components/fundraising/CampaignPayoutPanel';
import { PendingCampaignGuard } from '@/components/fundraising/PendingCampaignGuard';
import { InsuranceGapCalculator } from '@/components/fundraising/medical/InsuranceGapCalculator';
import { MedicalShareKit } from '@/components/fundraising/medical/MedicalShareKit';
import { CampaignShareWidget } from '@/components/fundraising/CampaignShareWidget';
import { MedicalTrustBadges } from '@/components/fundraising/medical/MedicalTrustBadges';
import { RecurringDonationCard } from '@/components/fundraising/medical/RecurringDonationCard';
import { MedicalDocumentsViewer } from '@/components/fundraising/medical/MedicalDocumentsViewer';

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
  // Enhanced fields (Sekcia 1 upgrade)
  treatment_total_cost?: number | null;
  insurance_coverage?: number | null;
  hospital_iban?: string | null;
  hospital_stripe_account?: string | null;
  direct_to_hospital?: boolean | null;
  refund_guarantee?: boolean | null;
  medical_documents?: string[] | null;
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
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [copied, setCopied] = useState(false);

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
        title: 'Error',
        description: 'Failed to load campaign',
        variant: 'destructive',
      });
      navigate('/fundraising/medical');
    } finally {
      setLoading(false);
    }
  };

  const fetchDonations = async () => {
    try {
      // Use SECURITY DEFINER function so donor_email is never exposed publicly
      const { data, error } = await supabase
        .rpc('get_public_campaign_donations', { _campaign_id: id });

      if (error) throw error;
      const filtered = (data || [])
        .filter((d: any) => d.campaign_type === 'medical')
        .slice(0, 10);
      setDonations(filtered);
    } catch (error) {
      console.error('Error fetching donations:', error);
    }
  };

  const verifyDonation = async (sessionId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-donation', {
        body: { session_id: sessionId },
      });

      if (error) throw error;

      if (data?.verified) {
        const eur = ((data?.amount_cents ?? 0) / 100).toFixed(2);
        toast({
          title: 'Thank you!',
          description: `Your contribution of €${eur} was successfully processed. A tax receipt is available.`,
          action: (
            <Button
              size="sm"
              variant="outline"
              onClick={() => navigate(`/fundraising/receipt?session_id=${sessionId}`)}
            >
              View Receipt
            </Button>
          ) as any,
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
        title: 'Error',
        description: 'Minimum donation amount is 1€',
        variant: 'destructive',
      });
      return;
    }

    if (!donorEmail) {
      toast({
        title: 'Error',
        description: 'Please enter your email',
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
          title: 'Redirecting',
          description: 'We opened the payment gateway in a new window',
        });
      }
    } catch (error) {
      console.error('Error creating donation:', error);
      toast({
        title: 'Error',
        description: 'Failed to create payment',
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
    setShareDialogOpen(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast({
      title: 'Link copied',
      description: 'Campaign link copied to clipboard',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShareSocial = (platform: string) => {
    const url = encodeURIComponent(window.location.href);
    const title = encodeURIComponent(campaign?.title || '');
    const description = encodeURIComponent(campaign?.description || '');
    
    let shareUrl = '';
    switch (platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${url}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?url=${url}&text=${title}`;
        break;
      case 'email':
        shareUrl = `mailto:?subject=${title}&body=${description}%0A%0A${url}`;
        break;
    }
    
    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!campaign) {
    return null;
  }

  return (
    <PendingCampaignGuard campaign={campaign as any}>
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/fundraising/medical')}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to campaigns
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-3xl mb-2">{campaign.title}</CardTitle>
                <p className="text-muted-foreground mb-3">{campaign.description}</p>
                <MedicalTrustBadges
                  verified={campaign.verified}
                  directToHospital={campaign.direct_to_hospital}
                  refundGuarantee={campaign.refund_guarantee}
                  medicalDocumentsCount={campaign.medical_documents?.length ?? 0}
                />
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
                  <h3 className="text-xl font-semibold mb-2">Story</h3>
                  <p className="text-muted-foreground whitespace-pre-wrap">{campaign.story}</p>
                </div>

                <InsuranceGapCalculator
                  treatmentTotalCost={campaign.treatment_total_cost}
                  insuranceCoverage={campaign.insurance_coverage}
                  targetAmount={campaign.target_amount}
                  currentAmount={campaign.current_amount}
                />

                <MedicalDocumentsViewer
                  documents={campaign.medical_documents}
                  verified={campaign.verified}
                  hospital={campaign.hospital}
                />

                <Separator />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Patient</p>
                    <p className="font-medium">{campaign.patient_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Diagnosis</p>
                    <p className="font-medium">{campaign.diagnosis}</p>
                  </div>
                  {campaign.hospital && (
                    <div className="col-span-2">
                      <p className="text-sm text-muted-foreground">Hospital</p>
                      <p className="font-medium">{campaign.hospital}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Donations */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Donations</CardTitle>
              </CardHeader>
              <CardContent>
                {donations.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">
                    No donations yet
                  </p>
                ) : (
                  <div className="space-y-4">
                    {donations.map((donation) => (
                      <div key={donation.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                        <div className="flex-1">
                          <p className="font-medium">
                            {donation.is_anonymous ? 'Anonymous donor' : (donation.donor_name || 'Anonymous donor')}
                          </p>
                          {donation.message && (
                            <p className="text-sm text-muted-foreground mt-1">{donation.message}</p>
                          )}
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDistanceToNow(new Date(donation.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="font-bold text-primary">{donation.amount.toFixed(2)}€</p>
                          {donation.is_monthly && (
                            <Badge variant="secondary" className="text-xs mt-1">Monthly</Badge>
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
            <CampaignDetailEnhancements
              currentAmount={campaign.current_amount}
              targetAmount={campaign.target_amount}
              supportersCount={(campaign.monthly_donors_count ?? 0) + (campaign.one_time_donors_count ?? 0)}
              campaignType="medical"
              topDonations={donations.map(d => ({ id: d.id, amount: d.amount, donor_name: d.donor_name, is_anonymous: d.is_anonymous, created_at: d.created_at }))}
            />
            <MedicalShareKit
              campaignTitle={campaign.title}
              patientName={campaign.patient_name}
              diagnosis={campaign.diagnosis}
              targetAmount={campaign.target_amount}
              currentAmount={campaign.current_amount}
              campaignUrl={typeof window !== 'undefined' ? window.location.href : ''}
            />
            <CampaignPayoutPanel
              campaignType="medical"
              campaignId={campaign.id}
              ownerUserId={campaign.user_id}
            />
            <CampaignShareWidget
              campaignType="medical"
              campaignId={campaign.id}
              title={campaign.title}
              description={campaign.description}
              goalAmount={campaign.target_amount}
              raisedAmount={campaign.current_amount}
              imageUrl={campaign.image_url}
            />
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
                    <p className="text-sm text-muted-foreground">Donors</p>
                  </div>
                  {getDaysLeft() !== null && (
                    <div className="text-center">
                      <p className="text-2xl font-bold">{getDaysLeft()}</p>
                      <p className="text-sm text-muted-foreground">Days left</p>
                    </div>
                  )}
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={() => document.getElementById('donate-form')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Donate Now
                </Button>

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleShare}
                >
                  <Share2 className="mr-2 h-4 w-4" />
                  Share Campaign
                </Button>
              </CardContent>
            </Card>

            {/* Donation Form */}
            <Card id="donate-form">
              <CardHeader>
                <CardTitle>Your Donation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Select amount</label>
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
                    Custom amount
                  </Button>
                  {amount === 'custom' && (
                    <Input
                      type="number"
                      placeholder="Enter amount"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      className="mt-2"
                      min="1"
                    />
                  )}
                </div>

                <RecurringDonationCard
                  isMonthly={isMonthly}
                  onChange={setIsMonthly}
                  amount={amount === 'custom' ? parseFloat(customAmount) || 0 : parseFloat(amount) || 0}
                />

                <Separator />

                <div className="space-y-2">
                  <Input
                    placeholder="Your name"
                    value={donorName}
                    onChange={(e) => setDonorName(e.target.value)}
                    disabled={isAnonymous}
                  />
                  <Input
                    type="email"
                    placeholder="Your email *"
                    value={donorEmail}
                    onChange={(e) => setDonorEmail(e.target.value)}
                    required
                  />
                </div>

                <Textarea
                  placeholder="Message (optional)"
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
                    Donate anonymously
                  </label>
                </div>

                <Button
                  className="w-full"
                  size="lg"
                  onClick={handleDonate}
                  disabled={donating || !amount || (!customAmount && amount === 'custom')}
                >
                  {donating ? 'Processing...' : `Donate ${amount === 'custom' ? customAmount || '0' : amount}€`}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Your donation includes a platform service fee of 6% to ensure security, verification, and technical maintenance. Secure payment via Stripe. A tax-deductible receipt will be issued automatically.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Share Dialog */}
        <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Share Campaign</DialogTitle>
              <DialogDescription>
                Help spread the word about this campaign
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold">Campaign Link</label>
                <div className="flex items-center gap-2">
                  <Input
                    value={window.location.href}
                    readOnly
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={handleCopyLink}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <label className="text-sm font-semibold">Share on Social Media</label>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleShareSocial('facebook')}
                  >
                    <Facebook className="h-4 w-4 mr-2" />
                    Facebook
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleShareSocial('twitter')}
                  >
                    <Twitter className="h-4 w-4 mr-2" />
                    Twitter
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => handleShareSocial('email')}
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      <CampaignDetailLiveFeed />
    </div>
    </PendingCampaignGuard>
  );
}
