import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface CommissionSetting {
  id: string;
  service_type: string;
  commission_rate: number;
  description: string;
  is_active: boolean;
}

export function useCommissionSettings() {
  return useQuery({
    queryKey: ["platform-commission-settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("platform_commission_settings")
        .select("*")
        .eq("is_active", true)
        .order("service_type");

      if (error) throw error;
      return data as CommissionSetting[];
    },
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}

export type CommissionServiceType =
  | 'bazaar' | 'marketplace' | 'skill_swap' | 'job_portal'
  | 'service_order' | 'creator_subscription' | 'tip_jar'
  | 'brand_collaboration' | 'megatalent' | 'auction'
  | 'antique' | 'collectible' | 'coupon' | 'crystal'
  | 'home_decor' | 'property' | 'phobia';

export function useCommissionRate(serviceType: CommissionServiceType) {
  const { data: settings, ...rest } = useCommissionSettings();
  
  const setting = settings?.find(s => s.service_type === serviceType);
  
  return {
    commissionRate: setting?.commission_rate ?? null,
    sellerPayout: setting ? 100 - setting.commission_rate : null,
    setting,
    ...rest,
  };
}

export function calculateCommission(amount: number, commissionRate: number) {
  const commissionAmount = (amount * commissionRate) / 100;
  const sellerPayout = amount - commissionAmount;
  
  return {
    total: amount,
    commission: commissionAmount,
    payout: sellerPayout,
    commissionRate,
  };
}
