import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export type CharityModule = "eco" | "healthy" | "megatalent";

export type CharityOrgType =
  | "animal_shelter"
  | "childrens_home"
  | "oncology_center"
  | "visually_impaired_center"
  | "hearing_impaired_center"
  | "disability_center";

export const CHARITY_ORG_TYPES: { value: CharityOrgType; label: string }[] = [
  { value: "animal_shelter", label: "Animal shelter" },
  { value: "childrens_home", label: "Children's home" },
  { value: "oncology_center", label: "Oncology centre" },
  { value: "visually_impaired_center", label: "Centre for the visually impaired" },
  { value: "hearing_impaired_center", label: "Centre for the hearing impaired" },
  { value: "disability_center", label: "Centre for people with disabilities" },
];

export interface CharityBeneficiary {
  id: string;
  user_id: string;
  module: CharityModule;
  org_type: CharityOrgType;
  org_name: string;
  org_city: string | null;
  org_website: string | null;
  org_iban: string | null;
}

export function useCharityBeneficiary(module: CharityModule) {
  const { user } = useAuth();
  const [beneficiary, setBeneficiary] = useState<CharityBeneficiary | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) {
      setBeneficiary(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await (supabase as any)
      .from("charity_beneficiaries")
      .select("*")
      .eq("user_id", user.id)
      .eq("module", module)
      .maybeSingle();
    setBeneficiary((data as CharityBeneficiary) || null);
    setLoading(false);
  }, [user, module]);

  useEffect(() => {
    load();
  }, [load]);

  const save = useCallback(
    async (values: {
      org_type: CharityBeneficiary["org_type"];
      org_name: string;
      org_city?: string;
      org_website?: string;
      org_iban?: string;
    }) => {
      if (!user) throw new Error("Sign in required");
      const { error } = await (supabase as any).from("charity_beneficiaries").upsert(
        {
          user_id: user.id,
          module,
          org_type: values.org_type,
          org_name: values.org_name.trim(),
          org_city: values.org_city?.trim() || null,
          org_website: values.org_website?.trim() || null,
          org_iban: values.org_iban?.trim().replace(/\s+/g, "") || null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,module" },
      );
      if (error) throw error;
      await load();
    },
    [user, module, load],
  );

  return { beneficiary, loading, save, reload: load, hasBeneficiary: !!beneficiary };
}
