import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';
import { DollarSign, Check, X } from 'lucide-react';

export default function WithdrawalRequests() {
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    const { data } = await supabase
      .from('withdrawal_requests')
      .select('*')
      .order('created_at', { ascending: false }) as any;
    
    setRequests(data || []);
    setLoading(false);
  };

  const processRequest = async (id: string, action: string) => {
    const { error } = await supabase.functions.invoke('process-withdrawal-request', {
      body: { withdrawalId: id, action }
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Request ${action}d` });
      fetchRequests();
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">Withdrawal Requests</h1>
        
        <div className="space-y-4">
          {requests.map((req) => (
            <Card key={req.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>€{req.amount.toFixed(2)}</span>
                  <Badge>{req.status}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p><strong>Campaign:</strong> {req.campaign_type} - {req.campaign_id}</p>
                <p><strong>Bank:</strong> {req.bank_name}</p>
                <p><strong>Account:</strong> {req.bank_account_number}</p>
                
                {req.status === 'pending' && (
                  <div className="flex gap-2 mt-4">
                    <Button onClick={() => processRequest(req.id, 'approve')}>
                      <Check className="mr-2 h-4 w-4" />Approve
                    </Button>
                    <Button variant="destructive" onClick={() => processRequest(req.id, 'reject')}>
                      <X className="mr-2 h-4 w-4" />Reject
                    </Button>
                  </div>
                )}
                
                {req.status === 'approved' && (
                  <Button onClick={() => processRequest(req.id, 'complete')} className="mt-4">
                    <DollarSign className="mr-2 h-4 w-4" />Mark as Paid
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
