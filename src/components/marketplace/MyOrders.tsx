import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { OrderChat } from "./OrderChat";
import { ShoppingBag, Package, Clock, Euro, MessageCircle, Bell } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
interface Order {
  id: string;
  buyer_id: string;
  seller_id: string;
  status: string;
  requirements: string;
  total_amount: number;
  seller_payout: number;
  delivery_deadline: string;
  created_at: string;
  offering: { id: string; title: string };
  buyer_profile?: { full_name: string | null; avatar_url: string | null };
  seller_profile?: { full_name: string | null; avatar_url: string | null };
}

interface MyOrdersProps {
  userId: string;
}

export function MyOrders({ userId }: MyOrdersProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    loadNotifications();
  }, [userId]);

  const loadOrders = async () => {
    setIsLoading(true);
    
    // Load orders where user is buyer or seller
    const { data: ordersData, error } = await supabase
      .from("service_orders")
      .select(`
        *,
        offering:skill_offerings(id, title)
      `)
      .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error loading orders:", error);
      setIsLoading(false);
      return;
    }

    if (!ordersData) {
      setOrders([]);
      setIsLoading(false);
      return;
    }

    // Get all unique user IDs
    const buyerIds = [...new Set(ordersData.map(o => o.buyer_id))];
    const sellerIds = [...new Set(ordersData.map(o => o.seller_id))];
    const allUserIds = [...new Set([...buyerIds, ...sellerIds])];

    // Fetch profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, avatar_url")
      .in("id", allUserIds);

    // Combine data
    const ordersWithProfiles = ordersData.map(order => ({
      ...order,
      buyer_profile: profiles?.find(p => p.id === order.buyer_id),
      seller_profile: profiles?.find(p => p.id === order.seller_id)
    }));

    setOrders(ordersWithProfiles);
    setIsLoading(false);
  };

  const loadNotifications = async () => {
    const { data } = await supabase
      .from("marketplace_notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false });

    if (data) {
      setNotifications(data);
    }
  };

  const markNotificationRead = async (id: string) => {
    await supabase
      .from("marketplace_notifications")
      .update({ is_read: true })
      .eq("id", id);
    
    setNotifications(prev => prev.filter(n => n.id !== id));
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

  const buyerOrders = orders.filter(o => o.buyer_id === userId);
  const sellerOrders = orders.filter(o => o.seller_id === userId);

  if (selectedOrder) {
    const otherUserId = selectedOrder.buyer_id === userId 
      ? selectedOrder.seller_id 
      : selectedOrder.buyer_id;
    const otherUserProfile = selectedOrder.buyer_id === userId 
      ? selectedOrder.seller_profile 
      : selectedOrder.buyer_profile;

    return (
      <>
        <FloatingHowItWorks title="How My Orders works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
        <OrderChat
        order={{
          ...selectedOrder,
          offering: selectedOrder.offering
        }}
        currentUserId={userId}
        otherUser={{ 
          id: otherUserId, 
          full_name: otherUserProfile?.full_name || null, 
          avatar_url: otherUserProfile?.avatar_url || null 
        }}
        onBack={() => {
          setSelectedOrder(null);
          loadOrders();
        }}
        onStatusChange={loadOrders}
      />
      </>
      );
  }

  const OrderCard = ({ order, role }: { order: Order; role: "buyer" | "seller" }) => {
    const otherUser = role === "buyer" ? order.seller_profile : order.buyer_profile;
    const amount = role === "seller" ? order.seller_payout : order.total_amount;
    
    return (
      <Card 
        className="cursor-pointer hover:border-primary/50 transition-colors"
        onClick={() => setSelectedOrder(order)}
      >
        <CardContent className="p-4">
          <div className="flex justify-between items-start mb-2">
            <div>
              <h4 className="font-medium">{order.offering?.title || "Service"}</h4>
              <p className="text-sm text-muted-foreground">
                {role === "buyer" ? "From" : "To"}: {otherUser?.full_name || "User"}
              </p>
            </div>
            <Badge className={getStatusColor(order.status)}>
              {order.status.replace("_", " ")}
            </Badge>
          </div>
          
          <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
            {order.requirements}
          </p>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-4 text-muted-foreground">
              <span className="flex items-center gap-1">
                <Euro className="h-3.5 w-3.5" />
                €{amount.toFixed(2)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                {format(new Date(order.delivery_deadline), "MMM d")}
              </span>
            </div>
            <Button size="sm" variant="ghost" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }}>
              <MessageCircle className="h-4 w-4 mr-1" />
              Chat
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-4">
      {/* Notifications */}
      {notifications.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-3">
              <Bell className="h-4 w-4 text-primary" />
              <span className="font-medium">New Notifications</span>
            </div>
            <div className="space-y-2">
              {notifications.map((notif) => (
                <div 
                  key={notif.id} 
                  className="flex items-center justify-between p-2 bg-background rounded-lg"
                >
                  <div>
                    <p className="font-medium text-sm">{notif.title}</p>
                    <p className="text-xs text-muted-foreground">{notif.message}</p>
                  </div>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      markNotificationRead(notif.id);
                      const order = orders.find(o => o.id === notif.order_id);
                      if (order) setSelectedOrder(order);
                    }}
                  >
                    View
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="purchases">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchases" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            My Purchases ({buyerOrders.length})
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <Package className="h-4 w-4" />
            My Sales ({sellerOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases" className="space-y-3 mt-4">
          {buyerOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No purchases yet</p>
            </Card>
          ) : (
            buyerOrders.map(order => (
              <OrderCard key={order.id} order={order} role="buyer" />
            ))
          )}
        </TabsContent>

        <TabsContent value="sales" className="space-y-3 mt-4">
          {sellerOrders.length === 0 ? (
            <Card className="p-8 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
              <p className="text-muted-foreground">No sales yet</p>
            </Card>
          ) : (
            sellerOrders.map(order => (
              <OrderCard key={order.id} order={order} role="seller" />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
