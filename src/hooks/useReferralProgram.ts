import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface ReferralEarning {
  id: string;
  referred_user_id: string;
  amount: number;
  paid: boolean;
  created_at: string;
  period_start: string;
  period_end: string;
  source_kind?: string | null;
  profiles?: {
    full_name: string | null;
  };
}

export interface ReferralStats {
  code: string;
  totalEarnings: number;
  totalReferrals: number;
  pendingEarnings: number;
  paidEarnings: number;
  recentReferrals: ReferralEarning[];
}

export const useReferralProgram = () => {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchReferralStats = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get or create referral code
      let { data: codeData, error: codeError } = await supabase
        .from("megatalent_referral_codes")
        .select("code")
        .eq("user_id", user.id)
        .single();

      if (codeError && codeError.code === "PGRST116") {
        // Generate new code
        const { data: newCode } = await supabase.rpc("generate_referral_code");
        
        const { data: insertedCode } = await supabase
          .from("megatalent_referral_codes")
          .insert({ user_id: user.id, code: newCode })
          .select("code")
          .single();
        
        codeData = insertedCode;
      }

      // Get earnings data
      const { data: earnings, error: earningsError } = await supabase
        .from("megatalent_referral_earnings")
        .select("*")
        .eq("referrer_id", user.id)
        .order("created_at", { ascending: false });

      if (earningsError) throw earningsError;

      // Fetch profile data separately for each referred user
      const earningsWithProfiles = await Promise.all(
        (earnings || []).map(async (earning) => {
          const { data: profile } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", earning.referred_user_id)
            .single();
          
          return {
            ...earning,
            profiles: profile || { full_name: null }
          };
        })
      );

      const totalEarnings = earningsWithProfiles?.reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const paidEarnings = earningsWithProfiles?.filter(e => e.paid).reduce((sum, e) => sum + Number(e.amount), 0) || 0;
      const pendingEarnings = totalEarnings - paidEarnings;

      setStats({
        code: codeData?.code || "",
        totalEarnings,
        totalReferrals: earningsWithProfiles?.length || 0,
        pendingEarnings,
        paidEarnings,
        recentReferrals: earningsWithProfiles?.slice(0, 10) || [],
      });
    } catch (error: any) {
      console.error("Error fetching referral stats:", error);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralStats();
  }, []);

  return { stats, loading, refreshStats: fetchReferralStats };
};
