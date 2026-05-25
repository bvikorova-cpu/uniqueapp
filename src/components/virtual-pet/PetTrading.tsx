import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeftRight, Check, X, Plus } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";

export const PetTrading = () => {
  const queryClient = useQueryClient();
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [offeredPetId, setOfferedPetId] = useState("");
  const [requestedPetId, setRequestedPetId] = useState("");
  const [offeredCredits, setOfferedCredits] = useState("");
  const [requestedCredits, setRequestedCredits] = useState("");
  const [message, setMessage] = useState("");

  const { data: userData } = useQuery({ queryKey: ['user'], queryFn: async () => await supabase.auth.getUser() });
  const user = userData?.data?.user;

  const { data: allPets } = useQuery({
    queryKey: ['all-pets-for-trading'],
    queryFn: async () => {
      const { data, error } = await supabase.from('pets').select('id, name, level, user_id, pet_types(name, species)').order('level', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: myPets } = useQuery({
    queryKey: ['my-pets-trading'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('pets').select('*, pet_types(*)').eq('user_id', user.id).order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user
  });

  const { data: myTrades } = useQuery({
    queryKey: ['my-trades'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase.from('pet_trades').select(`
        *,
        offered_pet:pets!pet_trades_offered_pet_id_fkey(name, level, pet_types(name)),
        requested_pet:pets!pet_trades_requested_pet_id_fkey(name, level, pet_types(name))
      `).or(`from_user_id.eq.${user.id},to_user_id.eq.${user.id}`).order('created_at', { ascending: false });
      if (error) throw error;
      const rows = data || [];
      const ids = Array.from(new Set(rows.flatMap((r: any) => [r.from_user_id, r.to_user_id]).filter(Boolean)));
      const { data: profs } = await (supabase as any).from("profiles_public").select("id, full_name").in("id", ids);
      const pmap = new Map<string, any>((profs || []).map((p: any) => [p.id, p]));
      return rows.map((r: any) => ({ ...r, from_user: pmap.get(r.from_user_id) || null, to_user: pmap.get(r.to_user_id) || null }));
    },
    enabled: !!user
  });

  const createTradeMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      if (!offeredPetId) throw new Error('Please select a pet to offer');
      const tradeData: any = { from_user_id: user.id, offered_pet_id: offeredPetId, status: 'pending', message: message || null };
      if (requestedPetId) {
        const requestedPet = allPets?.find(p => p.id === requestedPetId);
        if (requestedPet) { tradeData.to_user_id = requestedPet.user_id; tradeData.requested_pet_id = requestedPetId; }
      }
      if (offeredCredits) tradeData.offered_credits = parseInt(offeredCredits);
      if (requestedCredits) tradeData.requested_credits = parseInt(requestedCredits);
      const { data, error } = await supabase.from('pet_trades').insert([tradeData]).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-trades'] });
      queryClient.invalidateQueries({ queryKey: ['public-trades'] });
      toast.success('Trade offer created! 🤝');
      setIsCreateOpen(false); setOfferedPetId(""); setRequestedPetId(""); setOfferedCredits(""); setRequestedCredits(""); setMessage("");
    },
    onError: (error: any) => toast.error(error.message || 'Failed to create trade')
  });

  const respondTradeMutation = useMutation({
    mutationFn: async ({ tradeId, accept }: { tradeId: string; accept: boolean }) => {
      if (!user) throw new Error('Not authenticated');
      if (accept) {
        const trade = myTrades?.find(t => t.id === tradeId);
        if (!trade) throw new Error('Trade not found');
        if (trade.offered_pet_id) await supabase.from('pets').update({ user_id: trade.to_user_id }).eq('id', trade.offered_pet_id);
        if (trade.requested_pet_id) await supabase.from('pets').update({ user_id: trade.from_user_id }).eq('id', trade.requested_pet_id);
      }
      const { data, error } = await supabase.from('pet_trades').update({
        status: accept ? 'completed' : 'rejected',
        accepted_at: accept ? new Date().toISOString() : null,
        completed_at: accept ? new Date().toISOString() : null
      }).eq('id', tradeId).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, { accept }) => {
      queryClient.invalidateQueries({ queryKey: ['my-trades'] });
      queryClient.invalidateQueries({ queryKey: ['my-pets'] });
      toast.success(accept ? 'Trade accepted! Pets exchanged. ✅' : 'Trade rejected ❌');
    },
    onError: (error: any) => toast.error(error.message || 'Failed to respond')
  });

  const getStatusVariant = (status: string) => {
    switch (status) { case 'completed': return 'default'; case 'pending': return 'secondary'; case 'rejected': return 'destructive'; default: return 'outline'; }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-black bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent">Trading Post</h2>
          <p className="text-xs text-muted-foreground">Trade rare pets with other players</p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <Button className="gap-2 active:scale-[0.97]" onClick={() => setIsCreateOpen(true)}>
            <Plus className="h-4 w-4" /> New Trade
          </Button>
          <DialogContent>
            <DialogHeader><DialogTitle className="font-black">Create Trade Offer</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Pet to Offer</Label>
                <Select value={offeredPetId} onValueChange={setOfferedPetId}>
                  <SelectTrigger><SelectValue placeholder="Choose a pet..." /></SelectTrigger>
                  <SelectContent>
                    {myPets?.map((pet) => <SelectItem key={pet.id} value={pet.id}>{pet.name} (Lv {pet.level})</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Requested Credits</Label>
                <Input type="number" value={requestedCredits} onChange={(e) => setRequestedCredits(e.target.value)} placeholder="Credits amount..." />
              </div>
              <Button className="w-full active:scale-[0.97]" onClick={() => createTradeMutation.mutate()}
                disabled={!offeredPetId || !requestedCredits || createTradeMutation.isPending}>
                Create Trade
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {myTrades?.map((trade: any, i: number) => (
        <motion.div key={trade.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
          <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-black text-sm">Trade Offer</h3>
                    <Badge variant={getStatusVariant(trade.status)} className="text-[9px]">{trade.status}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <p className="text-[10px] text-muted-foreground">Offering:</p>
                      <p className="font-bold">{trade.offered_pet?.name}</p>
                      <p className="text-[10px] text-muted-foreground">Lv{trade.offered_pet?.level} {trade.offered_pet?.pet_types?.name}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-muted-foreground">Requesting:</p>
                      {trade.requested_pet ? (
                        <><p className="font-bold">{trade.requested_pet.name}</p><p className="text-[10px] text-muted-foreground">Lv{trade.requested_pet.level}</p></>
                      ) : (
                        <p className="font-bold text-primary">{trade.requested_credits} credits</p>
                      )}
                    </div>
                  </div>
                  {trade.message && <p className="text-[10px] text-muted-foreground mt-2 pt-2 border-t border-border/20 italic">"{trade.message}"</p>}
                </div>
                {trade.status === 'pending' && trade.to_user_id === user?.id && (
                  <div className="flex gap-1.5 ml-2">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 active:scale-[0.9]"
                      onClick={() => respondTradeMutation.mutate({ tradeId: trade.id, accept: true })}><Check className="h-4 w-4 text-emerald-500" /></Button>
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 active:scale-[0.9]"
                      onClick={() => respondTradeMutation.mutate({ tradeId: trade.id, accept: false })}><X className="h-4 w-4 text-red-500" /></Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}

      {(!myTrades || myTrades.length === 0) && (
        <Card className="border-border/40 bg-card/80 backdrop-blur-xl">
          <CardContent className="py-12 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center mb-3">
              <ArrowLeftRight className="h-7 w-7 text-orange-500" />
            </div>
            <h3 className="font-black mb-1">No Trades Yet</h3>
            <p className="text-xs text-muted-foreground">Create your first trade offer!</p>
          </CardContent>
        </Card>
      )}
    </motion.div>
  );
};
