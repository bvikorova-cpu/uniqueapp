import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Send, Package, CheckCircle, Truck, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface BazaarOrder {
  id: string;
  item_id: string;
  buyer_id: string;
  seller_id: string;
  amount: number;
  commission_amount: number;
  seller_payout: number;
  status: string;
  shipping_address: string | null;
  buyer_notes: string | null;
  created_at: string;
  shipped_at: string | null;
  delivered_at: string | null;
  bazaar_items?: {
    title: string;
    image_url: string | null;
  };
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

  const markAsShipped = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('bazaar_orders')
        .update({ 
          status: 'shipped',
          shipped_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (error) throw error;

      toast({
        title: "Item Shipped!",
        description: "Buyer has been notified."
      });
      
      onStatusChange();
    } catch (error) {
      console.error('Error marking as shipped:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const markAsDelivered = async () => {
    setLoading(true);
    try {
      // Update order status to delivered
      const { error: orderError } = await supabase
        .from('bazaar_orders')
        .update({ 
          status: 'delivered',
          delivered_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', order.id);

      if (orderError) throw orderError;

      // Mark item as sold and inactive
      const { error: itemError } = await supabase
        .from('bazaar_items')
        .update({ 
          is_sold: true,
          is_active: false
        })
        .eq('id', order.item_id);

      if (itemError) throw itemError;

      toast({
        title: "Item Received!",
        description: "Transaction completed. Seller will receive their payout."
      });
      
      onStatusChange();
    } catch (error) {
      console.error('Error marking as delivered:', error);
      toast({
        title: "Error",
        description: "Failed to update status",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    switch (order.status) {
      case 'paid':
        return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Awaiting Shipment</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="gap-1 border-blue-500 text-blue-500"><Truck className="h-3 w-3" /> Shipped</Badge>;
      case 'delivered':
        return <Badge variant="default" className="gap-1 bg-green-500"><CheckCircle className="h-3 w-3" /> Delivered</Badge>;
      default:
        return <Badge variant="outline">{order.status}</Badge>;
    }
  };

  return (
    <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b pb-4">
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
          {getStatusBadge()}
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          {isSeller && order.status === 'paid' && (
            <Button onClick={markAsShipped} disabled={loading} className="gap-2">
              <Package className="h-4 w-4" />
              Mark as Shipped
            </Button>
          )}
          {isBuyer && order.status === 'shipped' && (
            <Button onClick={markAsDelivered} disabled={loading} className="gap-2">
              <CheckCircle className="h-4 w-4" />
              Confirm Received
            </Button>
          )}
        </div>

        {order.shipping_address && (
          <div className="mt-3 p-3 bg-muted rounded-lg text-sm">
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
  );
}
