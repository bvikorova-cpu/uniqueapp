import { supabase } from "@/integrations/supabase/client";

// Spends purchased credits from user_daily_votes by increasing votes_used.
// Returns true if successful, throws otherwise.
export async function spendBrandCredits(amount: number): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required");

  const today = new Date().toISOString().split("T")[0];
  const { data: row } = await supabase
    .from("user_daily_votes")
    .select("*")
    .eq("user_id", user.id)
    .eq("date", today)
    .maybeSingle();

  const purchased = row?.votes_purchased ?? 0;
  const used = row?.votes_used ?? 0;
  const free = 1;
  const remaining = (free + purchased) - used;
  if (remaining < amount) throw new Error(`Need ${amount} credits (have ${remaining})`);

  if (row) {
    const { error } = await supabase
      .from("user_daily_votes")
      .update({ votes_used: used + amount })
      .eq("id", row.id);
    if (error) throw error;
  } else {
    const { error } = await supabase
      .from("user_daily_votes")
      .insert({ user_id: user.id, date: today, votes_used: amount, votes_purchased: 0 });
    if (error) throw error;
  }
}
