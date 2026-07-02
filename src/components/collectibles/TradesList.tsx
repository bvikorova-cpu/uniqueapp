import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeftRight, Check, Plus, X, Send, Coins } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface TradesListProps {
  userId: string;
}

export default function TradesList({ userId }: TradesListProps) {
  const [incomingTrades, setIncomingTrades] = useState<any[]>([]);
  const [outgoingTrades, setOutgoingTrades] = useState<any[]>([]);
  const [userCollectibles, setUserCollectibles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [newTrade, setNewTrade] = useState({
    receiverId: "",
    offeredCollectibleId: "",
    offeredCredits: "",
    requestedCollectibleId: "",
    requestedCredits: "",
    message: ""
  });

  useEffect(() => {
    fetchTrades();
    fetchUserCollectibles();
  }, [userId]);

  const fetchTrades = async () => {
    try {
      // Incoming trades
      const { data: incoming, error: inError } = await supabase
        .from('collectible_trades')
        .select('*')
        .eq('receiver_id', userId)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (inError) throw inError;

      // Outgoing trades
      const { data: outgoing, error: outError } = await supabase
        .from('collectible_trades')
        .select('*')
        .eq('sender_id', userId)
        .order('created_at', { ascending: false });

      if (outError) throw outError;

      setIncomingTrades(incoming || []);
      setOutgoingTrades(outgoing || []);
    } catch (error) {
      console.error('Error fetching trades:', error);
      toast.error("Failed to load trades");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserCollectibles = async () => {
    try {
      const { data, error } = await supabase
        .from('user_collectibles')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;
      setUserCollectibles(data || []);
    } catch (error) {
      console.error('Error fetching collectibles:', error);
    }
  };

  const handleCreateTrade = async () => {
    if (!newTrade.receiverId) {
      toast.error("Please enter receiver user ID");
      return;
    }

    if (!newTrade.offeredCollectibleId && !newTrade.offeredCredits) {
      toast.error("Please offer something");
      return;
    }

    setIsCreating(true);
    try {
      const { error } = await supabase
        .from('collectible_trades')
        .insert({
          sender_id: userId,
          receiver_id: newTrade.receiverId,
          offered_badge_id: newTrade.offeredCollectibleId || null,
          offered_credits: newTrade.offeredCredits ? parseInt(newTrade.offeredCredits) : null,
          requested_badge_id: newTrade.requestedCollectibleId || null,
          requested_credits: newTrade.requestedCredits ? parseInt(newTrade.requestedCredits) : null,
          message: newTrade.message || null,
          status: 'pending'
        });

      if (error) throw error;

      toast.success("Trade offer sent!");
      setNewTrade({
        receiverId: "",
        offeredCollectibleId: "",
        offeredCredits: "",
        requestedCollectibleId: "",
        requestedCredits: "",
        message: ""
      });
      fetchTrades();
    } catch (error) {
      console.error('Error creating trade:', error);
      toast.error("Failed to send trade offer");
    } finally {
      setIsCreating(false);
    }
  };

  const handleAcceptTrade = async (tradeId: string) => {
    try {
      const { error } = await supabase
        .from('collectible_trades')
        .update({ status: 'accepted' })
        .eq('id', tradeId);

      if (error) throw error;

      toast.success("Trade accepted!");
      fetchTrades();
    } catch (error) {
      console.error('Error accepting trade:', error);
      toast.error("Failed to accept trade");
    }
  };

  const handleRejectTrade = async (tradeId: string) => {
    try {
      const { error } = await supabase
        .from('collectible_trades')
        .update({ status: 'rejected' })
        .eq('id', tradeId);

      if (error) throw error;

      toast.success("Trade rejected");
      fetchTrades();
    } catch (error) {
      console.error('Error rejecting trade:', error);
      toast.error("Failed to reject trade");
    }
  };

  const handleCancelTrade = async (tradeId: string) => {
    try {
      const { error } = await supabase
        .from('collectible_trades')
        .delete()
        .eq('id', tradeId);

      if (error) throw error;

      toast.success("Trade cancelled");
      fetchTrades();
    } catch (error) {
      console.error('Error cancelling trade:', error);
      toast.error("Failed to cancel trade");
    }
  };

  const TradeCard = ({ trade, isIncoming }: { trade: any; isIncoming: boolean }) => (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">Trade Offer</CardTitle>
          <Badge variant={
            trade.status === 'accepted' ? 'default' : 
            trade.status === 'rejected' ? 'destructive' : 
            'secondary'
          }>
            {trade.status}
          </Badge>
        </div>
        <CardDescription>
          {new Date(trade.created_at).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <p className="text-sm font-medium">Offering</p>
            {trade.offered_badge_id && (
              <Badge variant="outline">Badge #{trade.offered_badge_id.slice(0, 8)}</Badge>
            )}
            {trade.offered_credits && (
              <div className="flex items-center gap-1 text-sm">
                <Coins className="h-3 w-3 text-primary" />
                {trade.offered_credits} credits
              </div>
            )}
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Requesting</p>
            {trade.requested_badge_id && (
              <Badge variant="outline">Badge #{trade.requested_badge_id.slice(0, 8)}</Badge>
            )}
            {trade.requested_credits && (
              <div className="flex items-center gap-1 text-sm">
                <Coins className="h-3 w-3 text-primary" />
                {trade.requested_credits} credits
              </div>
            )}
          </div>
        </div>

        {trade.message && (
          <div className="text-sm text-muted-foreground border-l-2 border-primary pl-3">
            {trade.message}
          </div>
        )}

        {isIncoming && trade.status === 'pending' && (
          <div className="flex gap-2">
            <Button onClick={() => handleAcceptTrade(trade.id)} className="flex-1">
              <Check className="h-4 w-4 mr-2" />
              Accept
            </Button>
            <Button 
              onClick={() => handleRejectTrade(trade.id)} 
              variant="destructive"
              className="flex-1"
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
          </div>
        )}

        {!isIncoming && trade.status === 'pending' && (
          <Button 
            onClick={() => handleCancelTrade(trade.id)} 
            variant="outline"
            className="w-full"
          >
            Cancel Trade
          </Button>
        )}
      </CardContent>
    </Card>
  );

  if (loading) {
    return <div className="text-center py-8">Loading trades...</div>;
  }

  return (
    <>
      <FloatingHowItWorks title={"Trades List - How it works"} steps={[{ title: 'Open', desc: 'Access the Trades List section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Trades List.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-semibold">Trade Offers</h3>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Trade
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Trade Offer</DialogTitle>
              <DialogDescription>
                Propose a trade with another player
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Receiver User ID</Label>
                <Input
                  value={newTrade.receiverId}
                  onChange={(e) => setNewTrade({ ...newTrade, receiverId: e.target.value })}
                  placeholder="Enter user ID"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h4 className="font-medium">You Offer</h4>
                  
                  <div>
                    <Label>Collectible (optional)</Label>
                    <Select
                      value={newTrade.offeredCollectibleId}
                      onValueChange={(value) => setNewTrade({ ...newTrade, offeredCollectibleId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select collectible" />
                      </SelectTrigger>
                      <SelectContent>
                        {userCollectibles.map((item) => (
                          <SelectItem key={item.id} value={item.id}>
                            {item.collectible_type} - Level {item.level}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Credits (optional)</Label>
                    <Input
                      type="number"
                      value={newTrade.offeredCredits}
                      onChange={(e) => setNewTrade({ ...newTrade, offeredCredits: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">You Request</h4>
                  
                  <div>
                    <Label>Collectible (optional)</Label>
                    <Input
                      value={newTrade.requestedCollectibleId}
                      onChange={(e) => setNewTrade({ ...newTrade, requestedCollectibleId: e.target.value })}
                      placeholder="Badge ID"
                    />
                  </div>

                  <div>
                    <Label>Credits (optional)</Label>
                    <Input
                      type="number"
                      value={newTrade.requestedCredits}
                      onChange={(e) => setNewTrade({ ...newTrade, requestedCredits: e.target.value })}
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div>
                <Label>Message (optional)</Label>
                <Textarea
                  value={newTrade.message}
                  onChange={(e) => setNewTrade({ ...newTrade, message: e.target.value })}
                  placeholder="Add a message to your trade offer..."
                />
              </div>

              <Button 
                onClick={handleCreateTrade} 
                disabled={isCreating}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {isCreating ? "Sending..." : "Send Trade Offer"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="incoming">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="incoming">
            Incoming ({incomingTrades.length})
          </TabsTrigger>
          <TabsTrigger value="outgoing">
            Outgoing ({outgoingTrades.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="incoming" className="space-y-4 mt-6">
          {incomingTrades.length === 0 ? (
            <Card className="p-12 text-center">
              <ArrowLeftRight className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No incoming trade offers</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {incomingTrades.map((trade) => (
                <TradeCard key={trade.id} trade={trade} isIncoming={true} />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="outgoing" className="space-y-4 mt-6">
          {outgoingTrades.length === 0 ? (
            <Card className="p-12 text-center">
              <ArrowLeftRight className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No outgoing trade offers</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {outgoingTrades.map((trade) => (
                <TradeCard key={trade.id} trade={trade} isIncoming={false} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
    </>
  );
}
