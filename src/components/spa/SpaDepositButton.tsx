import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  amountCents: number;
  salonId?: string;
  bookingId?: string;
  description?: string;
}

export const SpaDepositButton = ({ amountCents, salonId, bookingId, description }: Props) => {
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-spa-deposit", {
        body: { amount_cents: amountCents, salon_id: salonId, booking_id: bookingId, description },
      });
      if (error) throw error;
      const url = (data as any)?.url;
      if (!url) throw new Error("No checkout URL");
      window.open(url, "_blank");
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button onClick={pay} disabled={loading}>
      {loading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CreditCard className="w-4 h-4 mr-2" />}
      Zaplatiť zálohu €{(amountCents / 100).toFixed(2)}
    </Button>
  );
};
