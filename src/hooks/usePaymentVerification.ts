import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const usePaymentVerification = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentStatus = searchParams.get("payment");
      const sessionId = searchParams.get("session_id");

      if (paymentStatus === "success" && sessionId && !isVerified && !isVerifying) {
        setIsVerifying(true);
        
        try {
          const { data, error } = await supabase.functions.invoke("verify-credits-payment", {
            body: { session_id: sessionId },
          });

          if (error) throw error;

          if (data?.success) {
            toast.success(`Successfully added ${data.credits_added} credits to your account!`);
            setIsVerified(true);
            
            // Clean up URL params after successful verification
            const newSearchParams = new URLSearchParams(searchParams);
            newSearchParams.delete("payment");
            newSearchParams.delete("session_id");
            setSearchParams(newSearchParams, { replace: true });
          } else {
            toast.error(data?.message || "Failed to verify payment");
          }
        } catch (error) {
          console.error("Payment verification error:", error);
          toast.error("Failed to verify payment. Please contact support.");
        } finally {
          setIsVerifying(false);
        }
      } else if (paymentStatus === "canceled") {
        toast.info("Payment was canceled");
        
        // Clean up URL params
        const newSearchParams = new URLSearchParams(searchParams);
        newSearchParams.delete("payment");
        setSearchParams(newSearchParams, { replace: true });
      }
    };

    verifyPayment();
  }, [searchParams, setSearchParams, isVerified, isVerifying]);

  return { isVerifying, isVerified };
};
