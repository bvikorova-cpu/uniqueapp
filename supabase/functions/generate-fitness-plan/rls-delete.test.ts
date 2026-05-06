// E2E test: verifies fitness_plans DELETE RLS policy
// - Regular user can delete only their own plan
// - Admin user can delete any plan
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import {
  assertEquals,
  assert,
} from "https://deno.land/std@0.224.0/assert/mod.ts";

const SUPABASE_URL =
  Deno.env.get("SUPABASE_URL") ?? Deno.env.get("VITE_SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON_KEY =
  Deno.env.get("SUPABASE_ANON_KEY") ??
  Deno.env.get("VITE_SUPABASE_PUBLISHABLE_KEY")!;

assert(SUPABASE_URL, "SUPABASE_URL missing");
assert(SERVICE_ROLE, "SUPABASE_SERVICE_ROLE_KEY missing");
assert(ANON_KEY, "ANON key missing");

const admin = createClient(SUPABASE_URL, SERVICE_ROLE, {
  auth: { persistSession: false },
});

async function makeUser(email: string) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: "Test1234!xx",
    email_confirm: true,
  });
  if (error) throw error;
  return data.user!;
}

async function signIn(email: string) {
  const c = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false },
  });
  const { data, error } = await c.auth.signInWithPassword({
    email,
    password: "Test1234!xx",
  });
  if (error) throw error;
  return { client: c, token: data.session!.access_token };
}

async function insertPlan(userId: string) {
  const { data, error } = await admin
    .from("fitness_plans")
    .insert({
      user_id: userId,
      plan_type: "weekly",
      status: "pending",
      age: 30,
      gender: "male",
      height_cm: 180,
      weight_kg: 80,
      activity_level: "moderate",
      fitness_goal: "lose_weight",
    })
    .select()
    .single();
  if (error) throw error;
  return data.id as string;
}

async function planExists(id: string) {
  const { data } = await admin
    .from("fitness_plans")
    .select("id")
    .eq("id", id)
    .maybeSingle();
  return !!data;
}

Deno.test("fitness_plans DELETE RLS — user vs admin", async () => {
  const stamp = Date.now();
  const userA_email = `rls-user-a-${stamp}@test.local`;
  const userB_email = `rls-user-b-${stamp}@test.local`;
  const adminEmail = `rls-admin-${stamp}@test.local`;

  const userA = await makeUser(userA_email);
  const userB = await makeUser(userB_email);
  const adminUser = await makeUser(adminEmail);

  // grant admin role
  const { error: roleErr } = await admin
    .from("user_roles")
    .insert({ user_id: adminUser.id, role: "admin" });
  if (roleErr) throw roleErr;

  try {
    // --- Scenario 1: user A tries to delete user B's plan (must fail silently) ---
    const planB = await insertPlan(userB.id);
    const { client: a } = await signIn(userA_email);
    const { error: delForeignErr } = await a
      .from("fitness_plans")
      .delete()
      .eq("id", planB);
    assertEquals(delForeignErr, null, "delete returns no error (RLS filters)");
    assertEquals(
      await planExists(planB),
      true,
      "user A must NOT be able to delete user B's plan",
    );

    // --- Scenario 2: user A deletes own plan (must succeed) ---
    const planA = await insertPlan(userA.id);
    const { error: delOwnErr } = await a
      .from("fitness_plans")
      .delete()
      .eq("id", planA);
    assertEquals(delOwnErr, null);
    assertEquals(
      await planExists(planA),
      false,
      "user A must be able to delete own plan",
    );

    // --- Scenario 3: admin deletes user B's plan (must succeed) ---
    const { client: ad } = await signIn(adminEmail);
    const { error: delAdminErr } = await ad
      .from("fitness_plans")
      .delete()
      .eq("id", planB);
    assertEquals(delAdminErr, null);
    assertEquals(
      await planExists(planB),
      false,
      "admin must be able to delete any plan",
    );
  } finally {
    // cleanup
    await admin.from("fitness_plans").delete().in("user_id", [
      userA.id,
      userB.id,
      adminUser.id,
    ]);
    await admin.from("user_roles").delete().eq("user_id", adminUser.id);
    await admin.auth.admin.deleteUser(userA.id);
    await admin.auth.admin.deleteUser(userB.id);
    await admin.auth.admin.deleteUser(adminUser.id);
  }
});
