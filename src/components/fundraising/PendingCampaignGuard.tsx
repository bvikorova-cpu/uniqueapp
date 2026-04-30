import { useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, XCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface Props {
  campaign: {
    user_id?: string;
    status?: string;
    verified?: boolean;
    rejection_reason?: string | null;
    title?: string;
  };
  children: ReactNode;
}

/**
 * Wraps the public campaign detail. If the campaign is not yet approved
 * (status != 'active' OR verified=false) AND the current viewer is not the
 * owner, it shows a placeholder and hides the campaign content/donation UI.
 * Owners always see their own campaign with a status banner.
 */
export function PendingCampaignGuard({ campaign, children }: Props) {
  const navigate = useNavigate();
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setCurrentUserId(data.session?.user?.id ?? null);
      setAuthChecked(true);
    });
  }, []);

  if (!authChecked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  const isApproved = campaign.status === 'active' && campaign.verified === true;
  const isOwner = !!currentUserId && currentUserId === campaign.user_id;

  // Public visitor on a non-approved campaign → blocked
  if (!isApproved && !isOwner) {
    return (
      <div className="min-h-screen bg-background pt-20 px-4">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardContent className="pt-10 pb-10 text-center">
              <Clock className="h-12 w-12 text-amber-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold mb-2">Campaign not yet available</h1>
              <p className="text-muted-foreground mb-6">
                This campaign is awaiting admin verification and is not publicly visible yet.
                Please check back later.
              </p>
              <Button onClick={() => navigate('/fundraising')}>Browse other campaigns</Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Owner viewing their own pending/rejected campaign → show banner + content (no donation)
  return (
    <>
      {!isApproved && isOwner && (
        <div className="max-w-7xl mx-auto px-4 pt-20">
          {campaign.status === 'rejected' ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 mb-4 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-destructive mb-1">Campaign rejected</p>
                {campaign.rejection_reason ? (
                  <p className="text-sm text-muted-foreground">{campaign.rejection_reason}</p>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    This campaign was rejected by admin. Contact support for details.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4 mb-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold mb-1">Pending approval</p>
                <p className="text-sm text-muted-foreground">
                  This is a preview only. Your campaign is hidden from the public hub until an admin
                  approves it. Donations are disabled in this state.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
      {children}
    </>
  );
}
