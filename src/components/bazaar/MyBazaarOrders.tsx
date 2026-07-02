import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ShoppingBag, Package, Clock, Truck, CheckCircle, MessageCircle, Shield, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import BazaarOrderChat from "./BazaarOrderChat";
import EscrowStatusBadge, { EscrowStatus } from "./EscrowStatusBadge";
import OrderTracker, { OrderStatus } from "./OrderTracker";
import OrderActions from "./OrderActions";
import SellerRatingDialog from "./SellerRatingDialog";
import { toast } from "sonner";

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
  escrow_status: string;
  shipping_address: string | null;
  buyer_notes: string | null;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
  completed_at: string | null;
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

interface Notification {
  id: string;
  order_id: string;
  type: string;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

interface MyBazaarOrdersProps {
  userId: string;
}

export default function MyBazaarOrders({ userId }: MyBazaarOrdersProps) {
  const [purchases, setPurchases] = useState<BazaarOrder[]>([]);
  const [sales, setSales] = useState<BazaarOrder[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<BazaarOrder | null>(null);
  const [ratingOrder, setRatingOrder] = useState<BazaarOrder | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
    loadNotifications();
  }, [userId]);

  const loadOrders = async () => {
    setLoading(true);
    
    // Load purchases (where user is buyer)
    const { data: purchaseData } = await supabase
      .from('bazaar_orders')
      .select(`
        *,
        bazaar_items (title, image_url),
        bazaar_escrow (id, status, auto_release_at)
      `)
      .eq('buyer_id', userId)
      .neq('status', 'pending')
      .order('created_at', { ascending: false });

    // Load sales (where user is seller)
    const { data: salesData } = await supabase
      .from('bazaar_orders')
      .select(`
        *,
        bazaar_items (title, image_url),
        bazaar_escrow (id, status, auto_release_at)
      `)
      .eq('seller_id', userId)
      .neq('status', 'pending')
      .order('created_at', { ascending: false });

    setPurchases(purchaseData || []);
    setSales(salesData || []);
    setLoading(false);
  };

  const loadNotifications = async () => {
    const { data } = await supabase
      .from('bazaar_notifications')
      .select('*')
      .eq('user_id', userId)
      .eq('is_read', false)
      .order('created_at', { ascending: false });

    setNotifications(data || []);
  };

  const markNotificationsAsRead = async () => {
    await supabase
      .from('bazaar_notifications')
      .update({ is_read: true })
      .eq('user_id', userId);
    
    setNotifications([]);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'paid':
        return <Clock className="h-4 w-4" />;
      case 'shipped':
        return <Truck className="h-4 w-4" />;
      case 'delivered':
        return <CheckCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return <Badge variant="secondary" className="gap-1">{getStatusIcon(status)} Awaiting Shipment</Badge>;
      case 'shipped':
        return <Badge variant="outline" className="gap-1 border-blue-500 text-blue-500">{getStatusIcon(status)} Shipped</Badge>;
      case 'delivered':
        return <Badge variant="default" className="gap-1 bg-green-500">{getStatusIcon(status)} Completed</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const OrderCard = ({ order, isSeller }: { order: BazaarOrder; isSeller: boolean }) => {
    const escrowData = order.bazaar_escrow?.[0];
    const escrowStatus = (order.escrow_status || escrowData?.status || 'none') as EscrowStatus;
    
    return (
      <>
        <FloatingHowItWorks title="How My Bazaar Orders works" steps={[
          { title: 'Open this section', desc: 'Review what it offers.' },
          { title: 'Interact', desc: 'Filter, list, buy, sell or manage.' },
          { title: 'Review results', desc: 'Track progress, orders or messages.' },
          { title: 'Iterate', desc: 'Come back anytime — data is saved.' },
        ]} />
        <Card 
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => setSelectedOrder(order)}
      >
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            {order.bazaar_items?.image_url ? (
              <img 
                src={order.bazaar_items.image_url} 
                alt={order.bazaar_items?.title}
                className="w-16 h-16 rounded-lg object-cover"
              />
            ) : (
              <div className="w-16 h-16 rounded-lg bg-muted flex items-center justify-center">
                <Package className="h-6 w-6 text-muted-foreground" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h4 className="font-medium truncate">{order.bazaar_items?.title || 'Item'}</h4>
              <p className="text-sm text-muted-foreground">
                {format(new Date(order.created_at), 'MMM d, yyyy')}
              </p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-semibold">
                  €{isSeller ? order.seller_payout.toFixed(2) : order.amount.toFixed(2)}
                </span>
                <div className="flex items-center gap-2">
                  {getStatusBadge(order.status)}
                  {escrowStatus === 'held' && (
                    <Badge variant="outline" className="gap-1 text-blue-500 border-blue-500">
                      <Shield className="h-3 w-3" />
                      Protected
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); setSelectedOrder(order); }} aria-label="Open chat">
                <MessageCircle className="h-4 w-4" />
              </Button>
              {!isSeller && (order.status === 'delivered' || order.status === 'completed') && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={(e) => { e.stopPropagation(); setRatingOrder(order); }}
                  aria-label="Rate seller"
                >
                  <Star className="h-4 w-4 text-yellow-500" />
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      </>
      );
  };

  return (
    <div className="space-y-6">
      {notifications.length > 0 && (
        <Card className="border-primary/50 bg-primary/5">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">New Notifications</CardTitle>
              <Button variant="ghost" size="sm" onClick={markNotificationsAsRead}>
                Mark all read
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notif) => (
                <div key={notif.id} className="p-2 bg-background rounded-lg">
                  <p className="font-medium text-sm">{notif.title}</p>
                  <p className="text-xs text-muted-foreground">{notif.message}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="purchases" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="purchases" className="gap-2">
            <ShoppingBag className="h-4 w-4" />
            My Purchases ({purchases.length})
          </TabsTrigger>
          <TabsTrigger value="sales" className="gap-2">
            <Package className="h-4 w-4" />
            My Sales ({sales.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="purchases">
          <ScrollArea className="h-[500px]">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : purchases.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No purchases yet</p>
                <p className="text-sm text-muted-foreground mt-1">Items you buy will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {purchases.map((order) => (
                  <OrderCard key={order.id} order={order} isSeller={false} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>

        <TabsContent value="sales">
          <ScrollArea className="h-[500px]">
            {loading ? (
              <p className="text-center text-muted-foreground py-8">Loading...</p>
            ) : sales.length === 0 ? (
              <div className="text-center py-12">
                <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No sales yet</p>
                <p className="text-sm text-muted-foreground mt-1">Items you sell will appear here</p>
              </div>
            ) : (
              <div className="space-y-3">
                {sales.map((order) => (
                  <OrderCard key={order.id} order={order} isSeller={true} />
                ))}
              </div>
            )}
          </ScrollArea>
        </TabsContent>
      </Tabs>

      <Dialog open={!!selectedOrder} onOpenChange={() => setSelectedOrder(null)}>
        <DialogContent className="max-w-2xl p-0">
          {selectedOrder && (
            <BazaarOrderChat
              order={selectedOrder}
              currentUserId={userId}
              onStatusChange={() => {
                loadOrders();
                loadNotifications();
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {ratingOrder && (
        <SellerRatingDialog
          open={!!ratingOrder}
          onOpenChange={(v) => !v && setRatingOrder(null)}
          orderId={ratingOrder.id}
          sellerId={ratingOrder.seller_id}
          buyerId={userId}
        />
      )}
    </div>
  );
}
