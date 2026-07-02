import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Heart,
  TrendingUp,
  Users,
  Euro,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  LayoutDashboard,
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { campaignDetailRoute, campaignDashboardRoute, tableToCategory } from '@/lib/fundraisingRoutes';
import { NewCampaignPicker } from '@/components/fundraising/NewCampaignPicker';
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";

interface Campaign {
  id: string;
  campaign_type: string;
  title: string;
  target_amount: number;
  current_amount: number;
  status: string;
  verified: boolean;
  rejection_reason?: string | null;
  monthly_donors_count?: number;
  one_time_donors_count?: number;
  supporters_count?: number;
  created_at: string;
}

interface DonationStat {
  total_donations: number;
  total_amount: number;
  monthly_amount: number;
}

export default function FundraisingDashboard() {
  const navigate = useNavigate();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [stats, setStats] = useState<DonationStat>({
    total_donations: 0,
    total_amount: 0,
    monthly_amount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthAndFetch();
  }, []);

  const checkAuthAndFetch = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: 'Error',
          description: 'You must be logged in',
          variant: 'destructive',
        });
        navigate('/auth');
        return;
      }

      const fetched = await fetchCampaigns(session.user.id);
      await fetchStats(fetched);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCampaigns = async (userId: string): Promise<Campaign[]> => {
    const tables = [
      'medical_campaigns',
      'dream_campaigns',
      'hero_campaigns',
      'pet_rescue_campaigns',
      'student_campaigns',
      'crisis_campaigns',
      'talent_campaigns',
    ];

    const allCampaigns: Campaign[] = [];

    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table as any)
          .select('id, title, target_amount, current_amount, status, verified, rejection_reason, monthly_donors_count, one_time_donors_count, supporters_count, created_at')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (error) {
          console.error(`Error fetching ${table}:`, error);
          continue;
        }

        if (data && Array.isArray(data)) {
          const campaignType = tableToCategory(table);
          for (const row of data as any[]) {
            allCampaigns.push({ ...row, campaign_type: campaignType });
          }
        }
      } catch (err) {
        console.error(`Error in ${table}:`, err);
      }
    }

    setCampaigns(allCampaigns);
    return allCampaigns;
  };

  const fetchStats = async (campaignsList: Campaign[]) => {
    try {
      const campaignIds = campaignsList.map(c => c.id);

      if (campaignIds.length === 0) {
        setStats({ total_donations: 0, total_amount: 0, monthly_amount: 0 });
        return;
      }

      // Scoped column list — never expose donor_email on the dashboard query.
      const { data, error } = await supabase
        .from('campaign_donations')
        .select('amount, is_monthly')
        .in('campaign_id', campaignIds)
        .eq('status', 'completed');

      if (error) throw error;

      if (data) {
        const totalAmount = data.reduce((sum, d) => sum + Number(d.amount || 0), 0);
        const monthlyAmount = data
          .filter(d => d.is_monthly)
          .reduce((sum, d) => sum + Number(d.amount || 0), 0);

        setStats({
          total_donations: data.length,
          total_amount: totalAmount,
          monthly_amount: monthlyAmount,
        });
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const getStatusBadge = (campaign: Campaign) => {
    if (campaign.status === 'pending') {
      return <Badge variant="secondary"><Clock className="h-3 w-3 mr-1" />Pending Approval</Badge>;
    }
    if (campaign.status === 'active' && campaign.verified) {
      return <Badge variant="default"><CheckCircle className="h-3 w-3 mr-1" />Active</Badge>;
    }
    if (campaign.status === 'rejected') {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
    }
    if (campaign.status === 'completed') {
      return <Badge variant="outline"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
    }
    return <Badge variant="outline">{campaign.status}</Badge>;
  };

  const getProgress = (campaign: Campaign) => {
    return Math.min((campaign.current_amount / campaign.target_amount) * 100, 100);
  };

  const getDonorsCount = (campaign: Campaign) => {
    return (campaign.monthly_donors_count || 0) + 
           (campaign.one_time_donors_count || 0) + 
           (campaign.supporters_count || 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FloatingHowItWorks
          title="Fundraising Dashboard"
          intro="Overview of all your campaigns and donations."
          steps={[
            { title: "See all campaigns", desc: "Both those you run and those you support." },
          { title: "Track totals", desc: "Combined raised, donors, days left." },
          { title: "Manage payouts", desc: "Request Stripe Connect transfers." },
          { title: "Post updates", desc: "Keep donors engaged across campaigns." },
          { title: "Create new campaign", desc: "Start a new one in any of the 7 categories." }
          ]}
        />
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-black mb-2">Dashboard - My Campaigns</h1>
            <p className="text-muted-foreground">Manage your fundraising campaigns</p>
          </div>
          <NewCampaignPicker triggerLabel="New Campaign" size="lg" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Raised</p>
                  <p className="text-2xl font-bold">{stats.total_amount.toFixed(2)}€</p>
                </div>
                <Euro className="h-8 w-8 text-primary" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Monthly Income</p>
                  <p className="text-2xl font-bold">{stats.monthly_amount.toFixed(2)}€</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Donations</p>
                  <p className="text-2xl font-bold">{stats.total_donations}</p>
                </div>
                <Heart className="h-8 w-8 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Campaigns</p>
                  <p className="text-2xl font-bold">
                    {campaigns.filter(c => c.status === 'active').length}
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Campaigns List */}
        <Card>
          <CardHeader>
            <CardTitle>Your Campaigns</CardTitle>
            <CardDescription>Overview of all your fundraising campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList>
                <TabsTrigger value="all">All ({campaigns.length})</TabsTrigger>
                <TabsTrigger value="active">
                  Active ({campaigns.filter(c => c.status === 'active' && c.verified).length})
                </TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({campaigns.filter(c => c.status === 'pending' || (c.status === 'active' && !c.verified)).length})
                </TabsTrigger>
                <TabsTrigger value="rejected">
                  Rejected ({campaigns.filter(c => c.status === 'rejected').length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-4 mt-4">
                {campaigns.length === 0 ? (
                  <div className="text-center py-12">
                    <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">You don't have any campaigns yet</p>
                    <NewCampaignPicker triggerLabel="Create First Campaign" size="default" />
                  </div>
                ) : (
                  campaigns.map((campaign) => (
                    <Card key={campaign.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                            {getStatusBadge(campaign)}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(campaignDetailRoute(campaign.campaign_type, campaign.id))}
                              title="View campaign"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(campaignDashboardRoute(campaign.campaign_type, campaign.id))}
                              title="Manage finances"
                            >
                              <LayoutDashboard className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="font-semibold">{campaign.current_amount.toFixed(2)}€</span>
                              <span className="text-muted-foreground">of {campaign.target_amount.toFixed(2)}€</span>
                            </div>
                            <Progress value={getProgress(campaign)} />
                          </div>

                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Donors</p>
                              <p className="font-semibold">{getDonorsCount(campaign)}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Progress</p>
                              <p className="font-semibold">{getProgress(campaign).toFixed(0)}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Created</p>
                              <p className="font-semibold">
                                {new Date(campaign.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="active" className="space-y-4 mt-4">
                {campaigns.filter(c => c.status === 'active').map((campaign) => (
                  <Card key={campaign.id}>
                    <CardContent className="pt-6">
                      {/* Same content as above */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                          {getStatusBadge(campaign)}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => navigate(campaignDetailRoute(campaign.campaign_type, campaign.id))}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-sm mb-2">
                            <span className="font-semibold">{campaign.current_amount.toFixed(2)}€</span>
                            <span className="text-muted-foreground">of {campaign.target_amount.toFixed(2)}€</span>
                          </div>
                          <Progress value={getProgress(campaign)} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="pending" className="space-y-4 mt-4">
                {campaigns.filter(c => c.status === 'pending' || (c.status === 'active' && !c.verified)).length === 0 ? (
                  <div className="text-center py-8">
                    <Clock className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No pending campaigns</p>
                  </div>
                ) : (
                  campaigns.filter(c => c.status === 'pending' || (c.status === 'active' && !c.verified)).map((campaign) => (
                    <Card key={campaign.id} className="border-amber-500/30 bg-amber-500/5">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                            {getStatusBadge(campaign)}
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          Campaign is pending verification and admin approval. It is hidden from the public hub until approved. You will be notified once reviewed.
                        </p>
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>

              <TabsContent value="rejected" className="space-y-4 mt-4">
                {campaigns.filter(c => c.status === 'rejected').length === 0 ? (
                  <div className="text-center py-8">
                    <XCircle className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No rejected campaigns</p>
                  </div>
                ) : (
                  campaigns.filter(c => c.status === 'rejected').map((campaign) => (
                    <Card key={campaign.id} className="border-destructive/30 bg-destructive/5">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-semibold mb-2">{campaign.title}</h3>
                            {getStatusBadge(campaign)}
                          </div>
                        </div>
                        {campaign.rejection_reason ? (
                          <div className="rounded-lg bg-background/50 border border-destructive/20 p-3">
                            <p className="text-xs font-semibold text-destructive mb-1">Reason for rejection:</p>
                            <p className="text-sm text-muted-foreground">{campaign.rejection_reason}</p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            Campaign was rejected. Please contact support for more information.
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
