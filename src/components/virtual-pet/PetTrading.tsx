import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Check, X } from "lucide-react";

export const PetTrading = () => {
  const { data: trades } = useQuery({
    queryKey: ['pet-trades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_trades')
        .select(`
          *,
          from_user:from_user_id(id),
          to_user:to_user_id(id),
          offered_pet:offered_pet_id(name, level, pet_types(name)),
          requested_pet:requested_pet_id(name, level, pet_types(name))
        `)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'pending': return 'secondary';
      case 'rejected': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pet Trading</h2>
        <Button className="gap-2">
          <ArrowLeftRight className="h-4 w-4" />
          Create Trade Offer
        </Button>
      </div>

      <div className="space-y-4">
        {trades?.map((trade: any) => (
          <Card key={trade.id} className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-semibold">Trade Offer</h3>
                  <Badge variant={getStatusColor(trade.status)}>{trade.status}</Badge>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground mb-1">Offering:</p>
                    <p className="font-medium">{trade.offered_pet?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      Lv{trade.offered_pet?.level} {trade.offered_pet?.pet_types?.name}
                    </p>
                  </div>
                  
                  <div>
                    <p className="text-muted-foreground mb-1">Requesting:</p>
                    {trade.requested_pet ? (
                      <>
                        <p className="font-medium">{trade.requested_pet.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Lv{trade.requested_pet.level} {trade.requested_pet.pet_types?.name}
                        </p>
                      </>
                    ) : (
                      <p className="font-medium">{trade.requested_credits} credits</p>
                    )}
                  </div>
                </div>

                {trade.message && (
                  <p className="text-sm text-muted-foreground mt-2 pt-2 border-t">
                    "{trade.message}"
                  </p>
                )}
              </div>

              {trade.status === 'pending' && (
                <div className="flex gap-2">
                  <Button size="sm" variant="outline">
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        ))}

        {(!trades || trades.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">
            <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No trades yet.</p>
            <p className="text-sm">Create your first trade offer!</p>
          </div>
        )}
      </div>
    </div>
  );
};