import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Check, X } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const PetTrading = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [offeredPetId, setOfferedPetId] = useState("");
  const [requestedCredits, setRequestedCredits] = useState("");

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => await supabase.auth.getUser()
  });

  const user = userData?.data?.user;

  const { data: myPets } = useQuery({
    queryKey: ['my-pets-trading'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('*, pet_types(*)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

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

  const createTradeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');

      // For now, create a placeholder trade without to_user_id (system will match later)
      const { data, error } = await supabase
        .from('pet_trades')
        .insert([{
          from_user_id: user.id,
          to_user_id: user.id, // Placeholder - would need a marketplace matching system
          offered_pet_id: offeredPetId,
          requested_credits: parseInt(requestedCredits),
          status: 'pending'
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pet-trades'] });
      toast.success('Trade offer created!');
      setIsCreateOpen(false);
      setOfferedPetId("");
      setRequestedCredits("");
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create trade');
    }
  });

  const respondTradeMutation = useMutation({
    mutationFn: async ({ tradeId, accept }: { tradeId: string; accept: boolean }) => {
      const { data, error } = await supabase
        .from('pet_trades')
        .update({ status: accept ? 'completed' : 'rejected' })
        .eq('id', tradeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { accept }) => {
      queryClient.invalidateQueries({ queryKey: ['pet-trades'] });
      toast.success(accept ? 'Trade accepted!' : 'Trade rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to respond to trade');
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Pet Trading</h2>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button className="gap-2" onClick={() => setIsCreateOpen(true)}>
            <ArrowLeftRight className="h-4 w-4" />
            Create Trade Offer
          </Button>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Trade Offer</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Pet to Offer</Label>
                <Select value={offeredPetId} onValueChange={setOfferedPetId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a pet..." />
                  </SelectTrigger>
                  <SelectContent>
                    {myPets?.map((pet) => (
                      <SelectItem key={pet.id} value={pet.id}>
                        {pet.name} (Lv {pet.level})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Requested Credits</Label>
                <Input
                  type="number"
                  value={requestedCredits}
                  onChange={(e) => setRequestedCredits(e.target.value)}
                  placeholder="Enter credits amount..."
                />
              </div>
              <Button 
                className="w-full"
                onClick={() => createTradeMutation.mutate()}
                disabled={!offeredPetId || !requestedCredits || createTradeMutation.isPending}
              >
                Create Trade
              </Button>
            </div>
          </DialogContent>
        </Dialog>
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

              {trade.status === 'pending' && trade.to_user_id === user?.id && (
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => respondTradeMutation.mutate({ tradeId: trade.id, accept: true })}
                    disabled={respondTradeMutation.isPending}
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => respondTradeMutation.mutate({ tradeId: trade.id, accept: false })}
                    disabled={respondTradeMutation.isPending}
                  >
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