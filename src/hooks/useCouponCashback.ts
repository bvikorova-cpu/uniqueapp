import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCouponCashback() {
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const uploadAndScan = async (file: File, coupon_id?: string) => {
    setUploading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { toast.error("Sign in first"); return null; }
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error: upErr } = await supabase.storage.from("coupon-receipts").upload(path, file);
      if (upErr) throw upErr;
      const { data: signed } = await supabase.storage.from("coupon-receipts").createSignedUrl(path, 60 * 60);
      const url = signed?.signedUrl;

      const { data, error } = await supabase.functions.invoke("coupon-receipt-cashback", {
        body: { receipt_url: url, coupon_id },
      });
      if (error) throw error;
      if (data?.error === "insufficient_credits") {
        toast.error("Need 5 AI credits for receipt scan.");
        return null;
      }
      setResult(data);
      toast.success(`Cashback pending: €${data?.cashback ?? 0}`);
      return data;
    } catch (e: any) {
      toast.error(e.message ?? "Receipt scan failed");
      return null;
    } finally {
      setUploading(false);
    }
  };

  return { uploading, result, uploadAndScan };
}
