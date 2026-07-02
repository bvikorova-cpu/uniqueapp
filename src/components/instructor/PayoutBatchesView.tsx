import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { formatCurrency } from "@/lib/utils";
import { format } from "date-fns";
import { Calendar, DollarSign, Package } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface PayoutBatch {
  id: string;
  batch_date: string;
  total_amount: number;
  total_requests: number;
  processed_count: number;
  status: string;
  created_at: string;
  completed_at: string | null;
}

export function PayoutBatchesView() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<PayoutBatch[]>([]);

  useEffect(() => {
    loadBatches();
  }, []);

  const loadBatches = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("payout_batches")
        .select("*")
        .order("batch_date", { ascending: false })
        .limit(10);

      if (error) throw error;

      setBatches(data || []);
    } catch (error: any) {
      console.error("Error loading batches:", error);
      toast({
        title: "Error",
        description: "Failed to load payout batches",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const triggerPayoutProcessing = async () => {
    try {
      toast({
        title: "Processing",
        description: "Triggering payout processing...",
      });

      const { data, error } = await supabase.functions.invoke(
        "process-scheduled-payouts",
        {
          body: { manual_trigger: true },
        }
      );

      if (error) throw error;

      toast({
        title: "Success",
        description: "Payout processing triggered successfully",
      });

      loadBatches();
    } catch (error: any) {
      console.error("Error triggering payouts:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to trigger payout processing",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "success";
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Payout Batches View - How it works"} steps={[{ title: 'Open', desc: 'Access the Payout Batches View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Payout Batches View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
        <CardContent className="p-12 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        </CardContent>
      </Card>
    </>
  );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Payout Batches</CardTitle>
          <Button onClick={triggerPayoutProcessing} variant="outline" size="sm">
            Trigger Manual Processing
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {batches.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No payout batches yet
          </p>
        ) : (
          <div className="space-y-4">
            {batches.map((batch) => (
              <div
                key={batch.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <p className="font-semibold">
                      {format(new Date(batch.batch_date), "MMMM d, yyyy")}
                    </p>
                    <Badge variant={getStatusColor(batch.status) as any}>
                      {batch.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      <span>
                        {batch.processed_count || 0} / {batch.total_requests} processed
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4" />
                      <span>{formatCurrency(batch.total_amount)}</span>
                    </div>
                  </div>

                  {batch.completed_at && (
                    <p className="text-xs text-muted-foreground mt-1">
                      Completed: {format(new Date(batch.completed_at), "PPp")}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <p className="text-sm font-medium mb-2">Automated Payout Schedule</p>
          <p className="text-sm text-muted-foreground">
            Payouts are automatically processed on the 1st and 15th of each month at
            midnight UTC. Withdrawal requests are scheduled for the next available
            payout date.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
