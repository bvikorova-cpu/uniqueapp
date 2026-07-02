import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { format } from "date-fns";
import { ShoppingBag, Box } from "lucide-react";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Purchase {
  id: string;
  product_type: string;
  stripe_payment_id: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  user_id: string;
}

export default function PurchaseHistory({ userId }: { userId: string }) {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPurchases();
  }, [userId]);

  const loadPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('collectible_purchases')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error loading purchases:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Purchase History - How it works"} steps={[{ title: 'Open', desc: 'Access the Purchase History section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Purchase History.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-8">
        <p className="text-center text-muted-foreground">Loading...</p>
      </Card>
    </>
  );
  }

  if (purchases.length === 0) {
    return (
      <Card className="p-8">
        <div className="text-center">
          <ShoppingBag className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No purchases yet</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold mb-4">Purchase History</h2>
      {purchases.map((purchase) => (
        <Card key={purchase.id} className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Box className="h-5 w-5 text-primary" />
              <div>
                <p className="font-medium">
                  {purchase.product_type || 'Purchase'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(purchase.created_at), 'PPP')}
                </p>
              </div>
            </div>
            <p className="font-bold">{(purchase.amount / 100).toFixed(2)} €</p>
          </div>
        </Card>
      ))}
    </div>
  );
}
