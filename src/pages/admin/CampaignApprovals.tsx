import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Check, X, Eye, FileText, ExternalLink, AlertTriangle, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useIsAdmin } from '@/hooks/useIsAdmin';
import { AdminPageShell, AdminGlassCard } from '@/components/admin/AdminPageShell';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';

interface CampaignApproval {
  id: string;
  campaign_id: string;
  campaign_type: 'medical' | 'dream' | 'hero' | 'pet' | 'student' | 'crisis' | 'talent';
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  campaign_data?: any;
}

const campaignTypeLabels = {
  medical: '🏥 Medical',
  dream: '✨ Dream Maker',
  hero: '🦸 Community Hero',
  pet: '🐾 Pet Rescue',
  student: '🎓 Student Support',
  crisis: '🚨 Crisis Relief',
  talent: '⭐ Talent Sponsorship',
};

export default function CampaignApprovals() {
  const navigate = useNavigate();
  const { isAdmin, loading: adminLoading } = useIsAdmin();
  const [approvals, setApprovals] = useState<CampaignApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<CampaignApproval | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    if (!adminLoading && !isAdmin) {
      navigate('/');
      return;
    }
    if (isAdmin) {
      fetchApprovals();
    }
  }, [isAdmin, adminLoading, navigate]);

  const fetchApprovals = async () => {
    try {
      const { data, error } = await supabase
        .from('campaign_approvals')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch campaign details for each approval
      const approvalsWithData = await Promise.all(
        (data || []).map(async (approval) => {
          let campaignData = null;
          try {
            if (approval.campaign_type === 'medical') {
              const { data: d } = await supabase.from('medical_campaigns').select('*').eq('id', approval.campaign_id).single();
              campaignData = d;
            } else if (approval.campaign_type === 'dream') {
              const { data: d } = await supabase.from('dream_campaigns').select('*').eq('id', approval.campaign_id).single();
              campaignData = d;
            } else if (approval.campaign_type === 'hero') {
              const { data: d } = await supabase.from('hero_campaigns').select('*').eq('id', approval.campaign_id).single();
              campaignData = d;
            } else if (approval.campaign_type === 'pet') {
              const { data: d } = await supabase.from('pet_rescue_campaigns').select('*').eq('id', approval.campaign_id).single();
              campaignData = d;
            } else if (approval.campaign_type === 'student') {
              const { data: d } = await supabase.from('student_campaigns').select('*').eq('id', approval.campaign_id).single();
              campaignData = d;
            } else if (approval.campaign_type === 'crisis') {
              const { data: d } = await supabase.from('crisis_campaigns').select('*').eq('id', approval.campaign_id).single();
              campaignData = d;
            } else if (approval.campaign_type === 'talent') {
              const { data: d } = await supabase.from('talent_campaigns').select('*').eq('id', approval.campaign_id).single();
              campaignData = d;
            }
          } catch (err) {
            console.error('Error fetching campaign:', err);
          }

          return {
            ...approval,
            campaign_data: campaignData,
          };
        })
      );

      setApprovals(approvalsWithData as CampaignApproval[]);
    } catch (error) {
      console.error('Error fetching approvals:', error);
      toast({
        title: 'Error',
        description: 'Failed to load campaign approvals',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (approval: CampaignApproval) => {
    if (!approval.campaign_data) return;
    setProcessing(true);

    try {
      // Update campaign status based on type
      let campaignError = null;
      if (approval.campaign_type === 'medical') {
        ({ error: campaignError } = await supabase.from('medical_campaigns').update({ status: 'active' }).eq('id', approval.campaign_id));
      } else if (approval.campaign_type === 'dream') {
        ({ error: campaignError } = await supabase.from('dream_campaigns').update({ status: 'active' }).eq('id', approval.campaign_id));
      } else if (approval.campaign_type === 'hero') {
        ({ error: campaignError } = await supabase.from('hero_campaigns').update({ status: 'active' }).eq('id', approval.campaign_id));
      } else if (approval.campaign_type === 'pet') {
        ({ error: campaignError } = await supabase.from('pet_rescue_campaigns').update({ status: 'active' }).eq('id', approval.campaign_id));
      } else if (approval.campaign_type === 'student') {
        ({ error: campaignError } = await supabase.from('student_campaigns').update({ status: 'active' }).eq('id', approval.campaign_id));
      } else if (approval.campaign_type === 'crisis') {
        ({ error: campaignError } = await supabase.from('crisis_campaigns').update({ status: 'active' }).eq('id', approval.campaign_id));
      } else if (approval.campaign_type === 'talent') {
        ({ error: campaignError } = await supabase.from('talent_campaigns').update({ status: 'active' }).eq('id', approval.campaign_id));
      }

      if (campaignError) throw campaignError;

      // Update approval record
      const { error: approvalError } = await supabase
        .from('campaign_approvals')
        .update({
          status: 'approved',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
        })
        .eq('id', approval.id);

      if (approvalError) throw approvalError;

      toast({
        title: 'Success',
        description: 'Campaign approved successfully',
      });

      fetchApprovals();
    } catch (error) {
      console.error('Error approving campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve campaign',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (approval: CampaignApproval) => {
    if (!rejectionReason.trim()) {
      toast({
        title: 'Error',
        description: 'Please provide a reason for rejection',
        variant: 'destructive',
      });
      return;
    }

    setProcessing(true);

    try {
      // Update campaign status based on type
      let campaignError = null;
      if (approval.campaign_type === 'medical') {
        ({ error: campaignError } = await supabase.from('medical_campaigns').update({ status: 'rejected' }).eq('id', approval.campaign_id));
      } else if (approval.campaign_type === 'dream') {
        ({ error: campaignError } = await supabase.from('dream_campaigns').update({ status: 'rejected' }).eq('id', approval.campaign_id));
      } else if (approval.campaign_type === 'hero') {
        ({ error: campaignError } = await supabase.from('hero_campaigns').update({ status: 'rejected' }).eq('id', approval.campaign_id));
      } else if (approval.campaign_type === 'pet') {
        ({ error: campaignError } = await supabase.from('pet_rescue_campaigns').update({ status: 'rejected' }).eq('id', approval.campaign_id));
      } else if (approval.campaign_type === 'student') {
        ({ error: campaignError } = await supabase.from('student_campaigns').update({ status: 'rejected' }).eq('id', approval.campaign_id));
      } else if (approval.campaign_type === 'crisis') {
        ({ error: campaignError } = await supabase.from('crisis_campaigns').update({ status: 'rejected' }).eq('id', approval.campaign_id));
      } else if (approval.campaign_type === 'talent') {
        ({ error: campaignError } = await supabase.from('talent_campaigns').update({ status: 'rejected' }).eq('id', approval.campaign_id));
      }

      if (campaignError) throw campaignError;

      // Update approval record
      const { error: approvalError } = await supabase
        .from('campaign_approvals')
        .update({
          status: 'rejected',
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          rejection_reason: rejectionReason,
        })
        .eq('id', approval.id);

      if (approvalError) throw approvalError;

      toast({
        title: 'Success',
        description: 'Campaign rejected',
      });

      setSelectedApproval(null);
      setRejectionReason('');
      fetchApprovals();
    } catch (error) {
      console.error('Error rejecting campaign:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject campaign',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  if (adminLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <AdminPageShell>
      <AdminPageHeader
        title="Campaign Approvals"
        subtitle="Review and approve fundraising, dream-maker, hero and rescue campaigns."
        icon={Heart}
        badge="Fundraising"
        breadcrumbs={[{ label: "Campaign Approvals" }]}
        stats={[
          { label: "Pending", value: approvals.length, accent: "amber" },
        ]}
      />

        {approvals.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">No pending campaigns to review</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {approvals.map((approval) => (
              <Card key={approval.id} className="overflow-hidden">
                {approval.campaign_data?.image_url && (
                  <div className="h-48 overflow-hidden">
                    <img
                      src={approval.campaign_data.image_url}
                      alt={approval.campaign_data.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-xl">{approval.campaign_data?.title}</CardTitle>
                    <Badge variant="secondary">{campaignTypeLabels[approval.campaign_type]}</Badge>
                  </div>
                  <CardDescription className="line-clamp-3">
                    {approval.campaign_data?.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm space-y-2">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Target Amount:</span>
                      <span className="font-semibold">{approval.campaign_data?.target_amount?.toFixed(2)}€</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Created:</span>
                      <span>{new Date(approval.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>

                  {/* Verification Documents Section */}
                  {(approval.campaign_type === 'medical' || approval.campaign_type === 'crisis') && (
                    <div className="border-2 border-amber-500/30 bg-amber-50 dark:bg-amber-900/10 p-3 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle className="h-4 w-4 text-amber-600" />
                        <span className="font-semibold text-amber-800 dark:text-amber-300 text-sm">Verification Required</span>
                      </div>
                      {approval.campaign_data?.proof_document_url ? (
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="sm" className="w-full">
                              <FileText className="mr-2 h-4 w-4" />
                              View Verification Document
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
                            <DialogHeader>
                              <DialogTitle>Verification Document - {approval.campaign_data?.title}</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              {approval.campaign_data.proof_document_url.endsWith('.pdf') ? (
                                <div className="space-y-2">
                                  <p className="text-sm text-muted-foreground">PDF Document uploaded</p>
                                  <a 
                                    href={approval.campaign_data.proof_document_url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-primary hover:underline"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                    Open PDF in New Tab
                                  </a>
                                </div>
                              ) : (
                                <img 
                                  src={approval.campaign_data.proof_document_url} 
                                  alt="Verification document"
                                  className="w-full max-h-[70vh] object-contain rounded-lg border"
                                />
                              )}
                              <a 
                                href={approval.campaign_data.proof_document_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 text-primary hover:underline text-sm"
                              >
                                <ExternalLink className="h-4 w-4" />
                                Open Full Document
                              </a>
                            </div>
                          </DialogContent>
                        </Dialog>
                      ) : (
                        <p className="text-sm text-destructive">⚠️ No verification document uploaded!</p>
                      )}
                    </div>
                  )}

                  {selectedApproval?.id === approval.id ? (
                    <div className="space-y-4">
                      <div>
                        <Label>Rejection Reason</Label>
                        <Textarea
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          placeholder="Explain why this campaign is being rejected..."
                          className="mt-2"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="destructive"
                          onClick={() => handleReject(approval)}
                          disabled={processing}
                          className="flex-1"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Confirm Reject
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => {
                            setSelectedApproval(null);
                            setRejectionReason('');
                          }}
                          disabled={processing}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApprove(approval)}
                        disabled={processing}
                        className="flex-1"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => setSelectedApproval(approval)}
                        disabled={processing}
                        className="flex-1"
                      >
                        <X className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => navigate(`/fundraising/${approval.campaign_type === 'pet' ? 'pet' : approval.campaign_type}/${approval.campaign_id}`)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
        </div>
      )}
    </AdminPageShell>
  );
}
