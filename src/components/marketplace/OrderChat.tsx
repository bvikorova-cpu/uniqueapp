import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Send, Package, CheckCircle, Loader2, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Message {
  id: string;
  sender_id: string;
  message: string;
  is_delivery: boolean;
  created_at: string;
}

interface OrderChatProps {
  order: {
    id: string;
    buyer_id: string;
    seller_id: string;
    status: string;
    requirements: string;
    total_amount: number;
    delivery_deadline: string;
    offering?: { title: string };
  };
  currentUserId: string;
  otherUser: { id: string; full_name: string | null; avatar_url: string | null };
  onBack: () => void;
  onStatusChange?: () => void;
}

export function OrderChat({ order, currentUserId, otherUser, onBack, onStatusChange }: OrderChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const isSeller = currentUserId === order.seller_id;
  const isBuyer = currentUserId === order.buyer_id;

  useEffect(() => {
    loadMessages();
    
    // Subscribe to new messages
    const channel = supabase
      .channel(`order-chat-${order.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "service_order_messages",
          filter: `order_id=eq.${order.id}`
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [order.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const loadMessages = async () => {
    const { data, error } = await supabase
      .from("service_order_messages")
      .select("*")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setMessages(data);
    }
  };

  const sendMessage = async (isDelivery = false) => {
    if (!newMessage.trim() && !isDelivery) return;

    setIsSending(true);
    const messageText = isDelivery 
      ? `📦 DELIVERY: ${newMessage || "Work has been delivered. Please review and approve."}`
      : newMessage;

    const { error } = await supabase
      .from("service_order_messages")
      .insert({
        order_id: order.id,
        sender_id: currentUserId,
        message: messageText,
        is_delivery: isDelivery
      });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive"
      });
    } else {
      setNewMessage("");
      
      if (isDelivery) {
        await updateOrderStatus("delivered");
      }
    }
    setIsSending(false);
  };

  const updateOrderStatus = async (status: string) => {
    setIsUpdating(true);
    const updateData: any = { status };
    
    if (status === "delivered") {
      updateData.delivered_at = new Date().toISOString();
    } else if (status === "completed") {
      updateData.completed_at = new Date().toISOString();
    }

    const { error } = await supabase
      .from("service_orders")
      .update(updateData)
      .eq("id", order.id);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to update order status",
        variant: "destructive"
      });
    } else {
      toast({
        title: "Success",
        description: status === "completed" 
          ? "Order completed! Payment released to provider."
          : "Order status updated"
      });
      onStatusChange?.();
    }
    setIsUpdating(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/10 text-yellow-500";
      case "accepted": return "bg-blue-500/10 text-blue-500";
      case "in_progress": return "bg-purple-500/10 text-purple-500";
      case "delivered": return "bg-orange-500/10 text-orange-500";
      case "completed": return "bg-green-500/10 text-green-500";
      case "cancelled": return "bg-red-500/10 text-red-500";
      default: return "bg-muted";
    }
  };

  return (
    <>
      <FloatingHowItWorks title="How Order Chat works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
      <Card className="flex flex-col h-[600px]">
      <CardHeader className="border-b py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Avatar className="h-10 w-10">
            <AvatarImage src={otherUser.avatar_url || undefined} />
            <AvatarFallback>{otherUser.full_name?.[0] || "U"}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <CardTitle className="text-base">{otherUser.full_name || "User"}</CardTitle>
            <p className="text-xs text-muted-foreground">{order.offering?.title}</p>
          </div>
          <Badge className={getStatusColor(order.status)}>
            {order.status.replace("_", " ")}
          </Badge>
        </div>
      </CardHeader>

      <div className="p-3 bg-muted/30 border-b text-xs space-y-1">
        <p><strong>Requirements:</strong> {order.requirements}</p>
        <p><strong>Amount:</strong> €{order.total_amount} | <strong>Deadline:</strong> {format(new Date(order.delivery_deadline), "PPP")}</p>
      </div>

      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        <div className="space-y-3">
          {messages.map((msg) => {
            const isOwn = msg.sender_id === currentUserId;
            return (
              <div
                key={msg.id}
                className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.is_delivery 
                      ? "bg-primary/10 border border-primary/20" 
                      : isOwn 
                        ? "bg-primary text-primary-foreground" 
                        : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-60 mt-1">
                    {format(new Date(msg.created_at), "HH:mm")}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <div className="p-3 border-t space-y-2">
        {/* Action buttons based on role and status */}
        {isSeller && order.status === "pending" && (
          <Button 
            onClick={() => updateOrderStatus("accepted")} 
            disabled={isUpdating}
            className="w-full"
            variant="outline"
          >
            {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Accept Order
          </Button>
        )}
        
        {isSeller && ["accepted", "in_progress"].includes(order.status) && (
          <Button 
            onClick={() => sendMessage(true)} 
            disabled={isSending}
            className="w-full"
            variant="secondary"
          >
            <Package className="mr-2 h-4 w-4" />
            Mark as Delivered
          </Button>
        )}

        {isBuyer && order.status === "delivered" && (
          <Button 
            onClick={() => updateOrderStatus("completed")} 
            disabled={isUpdating}
            className="w-full"
          >
            <CheckCircle className="mr-2 h-4 w-4" />
            Approve & Complete Order
          </Button>
        )}

        {order.status !== "completed" && order.status !== "cancelled" && (
          <div className="flex gap-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <Button onClick={() => sendMessage()} disabled={isSending || !newMessage.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </Card>
    </>
    );
}
