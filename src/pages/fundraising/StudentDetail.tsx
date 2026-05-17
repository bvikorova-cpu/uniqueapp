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
import { ArrowLeft, GraduationCap, Users, Heart, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useDonationReturn } from "@/hooks/useDonationReturn";
import { CampaignDetailEnhancements, CampaignDetailLiveFeed } from '@/components/fundraising/CampaignDetailEnhancements';
import { CampaignPayoutPanel } from '@/components/fundraising/CampaignPayoutPanel';
import { PendingCampaignGuard } from '@/components/fundraising/PendingCampaignGuard';
import { AcademicVerificationCard } from '@/components/fundraising/student/AcademicVerificationCard';
import { ScholarshipMatchCard } from '@/components/fundraising/student/ScholarshipMatchCard';
import { StudentProgressReports } from '@/components/fundraising/student/StudentProgressReports';

interface StudentCampaign {
  id: string;
  title: string;
  description: string;
  story: string;
  support_type: string;
  school_name: string;
  field_of_study: string;
  target_amount: number;
  current_amount: number;
  image_url: string;
  supporters_count: number;
  pay_it_forward: boolean;
  status: string;
  user_id: string;
  created_at: string;
}

const supportTypeLabels: Record<string, string> = {
  tuition: '💰 Tuition Fees',
  books: '📚 Books & Materials',
  living: '🏠 Living Expenses',
  technology: '💻 Technology',
  research: '🔬 Research Project',
  other: '📝 Other',
};

export default function StudentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [campaign, setCampaign] = useState<StudentCampaign | null>(null);
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
        .from('student_campaigns')
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
          campaignType: 'student',
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
          <Button onClick={() => navigate('/fundraising/student')}>
            Back to Student Support
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
        <Button variant="outline" size="sm" onClick={() => navigate('/fundraising/student')} className="mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Student Support
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            {campaign.image_url && (
              <div className="rounded-lg overflow-hidden">
                <img src={campaign.image_url} alt={campaign.title} className="w-full h-96 object-cover" />
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
                    <CardTitle className="text-3xl">{campaign.title}</CardTitle>
                    {campaign.school_name && (
                      <p className="text-sm text-muted-foreground mt-2">
                        🏫 {campaign.school_name}
                      </p>
                    )}
                    {campaign.field_of_study && (
                      <p className="text-sm text-muted-foreground">
                        📖 {campaign.field_of_study}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2">
                    <Badge variant="secondary">{supportTypeLabels[campaign.support_type]}</Badge>
                    {campaign.pay_it_forward && (
                      <Badge variant="default" className="flex items-center gap-1">
                        <Sparkles className="h-3 w-3" />
                        Pay It Forward
                      </Badge>
                    )}
                  </div>
                </div>
                <CardDescription className="text-lg">{campaign.description}</CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>My Story</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-muted-foreground">{campaign.story}</p>
              </CardContent>
            </Card>

            <StudentProgressReports campaignId={campaign.id} ownerUserId={campaign.user_id} />
          </div>

          <div className="space-y-6">
            <AcademicVerificationCard
              institutionVerified={(campaign as any).institution_verified}
              enrollmentVerified={(campaign as any).enrollment_verified}
              enrollmentDocUrl={(campaign as any).enrollment_doc_url}
              verifierName={(campaign as any).verifier_name}
              verifiedAt={(campaign as any).verified_at}
              currentGpa={(campaign as any).current_gpa}
              expectedGraduation={(campaign as any).expected_graduation}
              schoolName={campaign.school_name}
            />
            <ScholarshipMatchCard
              openToMatch={(campaign as any).open_to_scholarship_match}
              tags={(campaign as any).scholarship_tags || []}
              fieldOfStudy={campaign.field_of_study}
              campaignTitle={campaign.title}
            />
            <CampaignDetailEnhancements
              currentAmount={campaign.current_amount}
              targetAmount={campaign.target_amount}
              supportersCount={campaign.supporters_count ?? 0}
              campaignType="student"
            />
            <CampaignPayoutPanel
              campaignType="student"
              campaignId={campaign.id}
              ownerUserId={campaign.user_id}
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
                    Support Education
                  </CardTitle>
                  <CardDescription>Invest in a student's future</CardDescription>
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
                      placeholder="Encouraging words for the student..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={handleDonate} disabled={donating} className="w-full" size="lg">
                    <Heart className="mr-2 h-5 w-5" />
                    {donating ? 'Processing...' : 'Donate Now'}
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center">
                    Your donation includes a platform service fee of 5% to ensure security, verification, and technical maintenance. Secure payment via Stripe.
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
