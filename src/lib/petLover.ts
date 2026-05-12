import { supabase } from "@/integrations/supabase/client";

const KEY = "pet_lover_unlocked_v1";

/**
 * Unlocks the cross-app "Pet Lover" achievement when the user has been
 * active in BOTH Virtual Pet and AI Pet Translator.
 * Idempotent — safe to call from both flows.
 */
export async function trackPetActivity(source: "virtual" | "translator") {
  const flagKey = `pet_activity_${source}`;
  localStorage.setItem(flagKey, "1");
  if (localStorage.getItem(KEY)) return;
  if (!localStorage.getItem("pet_activity_virtual") || !localStorage.getItem("pet_activity_translator")) return;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: ach } = await supabase.from("achievements").select("id").eq("code", "pet_lover").maybeSingle();
  if (!ach?.id) return;

  const { data: existing } = await supabase
    .from("user_achievements")
    .select("id")
    .eq("user_id", user.id)
    .eq("achievement_id", ach.id)
    .maybeSingle();
  if (existing) { localStorage.setItem(KEY, "1"); return; }

  await supabase.from("user_achievements").insert({ user_id: user.id, achievement_id: ach.id });
  localStorage.setItem(KEY, "1");
}
