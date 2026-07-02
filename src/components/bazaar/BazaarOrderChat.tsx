import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import OrderTracker, { OrderStatus } from "./OrderTracker";
import OrderActions from "./OrderActions";
import EscrowStatusBadge, { EscrowStatus } from "./EscrowStatusBadge";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface BazaarOrder {
  id: string;
  item_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  commission_amount: number;
  seller_payout: number;
  status: string;
  escrow_status?: string;
  shipping_address: string | null;
  buyer_notes: string | null;
  created_at: string;
  paid_at?: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  completed_at?: string | null;
  bazaar_items?: {
    title: string;
    image_url: string | null;
  };
  bazaar_escrow?: Array<{
    id: string;
    status: string;
    auto_release_at: string;
  }>;
}

interface Message {
  id: string;
  order_id: string;
  sender_id: string;
  content: string;
  is_read: boolean;
  created_at: string;
}

interface BazaarOrderChatProps {
  order: BazaarOrder;
  currentUserId: string;
  onStatusChange: () => void;
}

export default function BazaarOrderChat({ order, currentUserId, onStatusChange }: BazaarOrderChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isSeller = currentUserId === order.seller_id;
  const isBuyer = currentUserId === order.buyer_id;

  useEffect(() => {
    loadMessages();
    
    const channel = supabase
      .channel(`bazaar-order-${order.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'bazaar_order_messages',
          filter: `order_id=eq.${order.id}`
        },
        (payload) => {
          setMessages(prev => [...prev, payload.new as Message]);
          scrollToBottom();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from('bazaar_order_messages')
      .select('*')
      .eq('order_id', order.id)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error loading messages:', error);
      return;
    }

    setMessages(data || []);
  };

  const sendMessage = async () => {
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('bazaar_order_messages')
        .insert({
          order_id: order.id,
          sender_id: currentUserId,
          content: newMessage.trim()
        });

      if (error) throw error;
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const escrowData = order.bazaar_escrow?.[0];
  const escrowStatus = (order.escrow_status || escrowData?.status || 'none') as EscrowStatus;

  return (
    <>
      <FloatingHowItWorks title="How Bazaar Order Chat works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Card className="flex flex-col h-[700px]">
      <CardHeader className="border-b pb-4 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            {order.bazaar_items?.image_url && (
              <img 
                src={order.bazaar_items.image_url} 
                alt={order.bazaar_items?.title}
                className="w-12 h-12 rounded-lg object-cover"
              />
            )}
            <div>
              <CardTitle className="text-lg">{order.bazaar_items?.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                €{order.amount.toFixed(2)} • {isSeller ? 'You receive' : 'Seller receives'}: €{order.seller_payout.toFixed(2)}
              </p>
            </div>
          </div>
          <EscrowStatusBadge 
            status={escrowStatus} 
            autoReleaseAt={escrowData?.auto_release_at}
          />
        </div>

        {/* Order Tracker */}
        <OrderTracker
          status={order.status as OrderStatus}
          escrowStatus={escrowStatus}
          paidAt={order.paid_at}
          shippedAt={order.shipped_at}
          deliveredAt={order.delivered_at}
          completedAt={order.completed_at}
        />

        {/* Action buttons */}
        <OrderActions
          orderId={order.id}
          status={order.status}
          escrowStatus={escrowStatus}
          isBuyer={isBuyer}
          isSeller={isSeller}
          onStatusChange={onStatusChange}
        />

        {order.shipping_address && (
          <div className="p-3 bg-muted rounded-lg text-sm">
            <p className="font-medium">Shipping Address:</p>
            <p className="text-muted-foreground">{order.shipping_address}</p>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <ScrollArea className="flex-1 p-4" ref={scrollRef}>
          <div className="space-y-3">
            {messages.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No messages yet. Start the conversation!
              </p>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-3 py-2 ${
                      message.sender_id === currentUserId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === currentUserId
                        ? 'text-primary-foreground/70'
                        : 'text-muted-foreground'
                    }`}>
                      {format(new Date(message.created_at), 'HH:mm')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        <div className="p-4 border-t">
          <div className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              onKeyPress={(e) => e.key === 'Enter' && !loading && sendMessage()}
              disabled={loading || order.status === 'delivered'}
            />
            <Button 
              onClick={sendMessage} 
              disabled={loading || !newMessage.trim() || order.status === 'delivered'}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
    );
}
