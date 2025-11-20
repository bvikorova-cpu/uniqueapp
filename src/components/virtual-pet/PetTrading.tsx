import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Check, X, Users, Star } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const PetTrading = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [offeredPetId, setOfferedPetId] = useState("");
  const [requestedPetId, setRequestedPetId] = useState("");
  const [offeredCredits, setOfferedCredits] = useState("");
  const [requestedCredits, setRequestedCredits] = useState("");
  const [message, setMessage] = useState("");

  const { data: userData } = useQuery({
    queryKey: ['user'],
    queryFn: async () => await supabase.auth.getUser()
  });

  const user = userData?.data?.user;

  const { data: allUsers } = useQuery({
    queryKey: ['users-for-trading'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name')
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const { data: allPets } = useQuery({
    queryKey: ['all-pets-for-trading'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pets')
        .select('id, name, level, user_id, pet_types(name, species)')
        .order('level', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: myPets } = useQuery({
    queryKey: ['my-pets-trading'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pets')
        .select('*, pet_types(*)')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: myTrades } = useQuery({
    queryKey: ['my-trades'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('pet_trades')
        .select(`
          *,
          from_user:profiles!pet_trades_from_user_id_fkey(full_name),
          to_user:profiles!pet_trades_to_user_id_fkey(full_name),
          offered_pet:pets!pet_trades_offered_pet_id_fkey(name, level, pet_types(name)),
          requested_pet:pets!pet_trades_requested_pet_id_fkey(name, level, pet_types(name))
        `)
        .or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: publicTrades } = useQuery({
    queryKey: ['public-trades'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('pet_trades')
        .select(`
          *,
          from_user:profiles!pet_trades_from_user_id_fkey(full_name),
          offered_pet:pets!pet_trades_offered_pet_id_fkey(name, level, user_id, pet_types(name))
        `)
        .eq('status', 'pending')
        .is('to_user_id', null)
        .order('created_at', { ascending: false })
        .limit(20);
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <Check className="h-4 w-4" />;
      case 'pending': return <ArrowLeftRight className="h-4 w-4" />;
      case 'rejected': return <X className="h-4 w-4" />;
      default: return null;
    }
  };

  const createTradeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!offeredPetId) throw new Error('Please select a pet to offer');

      const tradeData: any = {
        from_user_id: user.id,
        offered_pet_id: offeredPetId,
        status: 'pending',
        message: message || null
      };

      if (requestedPetId) {
        const requestedPet = allPets?.find(p => p.id === requestedPetId);
        if (requestedPet) {
          tradeData.to_user_id = requestedPet.user_id;
          tradeData.requested_pet_id = requestedPetId;
        }
      }

      if (offeredCredits) tradeData.offered_credits = parseInt(offeredCredits);
      if (requestedCredits) tradeData.requested_credits = parseInt(requestedCredits);

      const { data, error } = await supabase
        .from('pet_trades')
        .insert([tradeData])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-trades'] });
      queryClient.invalidateQueries({ queryKey: ['public-trades'] });
      toast.success('Trade offer created!');
      setIsCreateOpen(false);
      setOfferedPetId("");
      setRequestedPetId("");
      setOfferedCredits("");
      setRequestedCredits("");
      setMessage("");
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to create trade');
    }
  });

  const respondTradeMutation = useMutation({
    mutationFn: async ({ tradeId, accept }: { tradeId: string; accept: boolean }) => {
      if (!user) throw new Error('Not authenticated');

      if (accept) {
        // Transfer pets
        const trade = myTrades?.find(t => t.id === tradeId);
        if (!trade) throw new Error('Trade not found');

        // Update pet ownership
        if (trade.offered_pet_id) {
          await supabase
            .from('pets')
            .update({ user_id: trade.to_user_id })
            .eq('id', trade.offered_pet_id);
        }

        if (trade.requested_pet_id) {
          await supabase
            .from('pets')
            .update({ user_id: trade.from_user_id })
            .eq('id', trade.requested_pet_id);
        }
      }

      const { data, error } = await supabase
        .from('pet_trades')
        .update({ 
          status: accept ? 'completed' : 'rejected',
          accepted_at: accept ? new Date().toISOString() : null,
          completed_at: accept ? new Date().toISOString() : null
        })
        .eq('id', tradeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { accept }) => {
      queryClient.invalidateQueries({ queryKey: ['my-trades'] });
      queryClient.invalidateQueries({ queryKey: ['public-trades'] });
      queryClient.invalidateQueries({ queryKey: ['my-pets'] });
      queryClient.invalidateQueries({ queryKey: ['my-pets-trading'] });
      toast.success(accept ? 'Trade accepted! Pets exchanged.' : 'Trade rejected');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to respond to trade');
    }
  });

  const acceptPublicTradeMutation = useMutation({
    mutationFn: async (tradeId: string) => {
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('pet_trades')
        .update({ 
          to_user_id: user.id,
          status: 'pending'
        })
        .eq('id', tradeId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-trades'] });
      queryClient.invalidateQueries({ queryKey: ['public-trades'] });
      toast.success('Trade request sent!');
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to accept trade');
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
        {myTrades?.map((trade: any) => (
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

        {(!myTrades || myTrades.length === 0) && (
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