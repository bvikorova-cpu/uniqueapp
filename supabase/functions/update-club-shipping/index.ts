// Let a member update their physical-card shipping recipient/address/phone
// as long as the card hasn't been shipped yet.

import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ShippingPayload {
  recipient_name: string;
  phone: string;
  line1: string;
  line2?: string;
  city: string;
  postal_code: string;
  state?: string;
  country: string; // ISO alpha-2
  note?: string;
}

function validate(p: Partial<ShippingPayload>): string | null {
  if (!p.recipient_name || p.recipient_name.trim().length < 2) return "Recipient name required";
  if (!p.phone || p.phone.trim().length < 5) return "Phone required";
  if (!p.line1) return "Address line 1 required";
  if (!p.city) return "City required";
  if (!p.postal_code) return "Postal code required";
  if (!p.country || p.country.length !== 2) return "Country (ISO code) required";
  if ((p.note ?? "").length > 300) return "Note too long";
  return null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Not authenticated");
    const anon = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    );
    const { data: uData } = await anon.auth.getUser(authHeader.replace("Bearer ", ""));
    if (!uData.user) throw new Error("Not authenticated");
    const user = uData.user;

    const payload = (await req.json()) as Partial<ShippingPayload>;
    const invalid = validate(payload);
    if (invalid) {
      return new Response(JSON.stringify({ error: invalid }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const admin = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
      { auth: { persistSession: false } },
    );

    const { data: m } = await admin
      .from("club_memberships")
      .select("id, tier, shipping_status")
      .eq("user_id", user.id)
      .maybeSingle();
    if (!m) throw new Error("No club membership found");
    if ((m as any).tier !== "physical") {
      throw new Error("Digital cards have no shipping.");
    }
    if ((m as any).shipping_status === "shipped" || (m as any).shipping_status === "delivered") {
      throw new Error("Card already shipped — contact support to update.");
    }

    const address = {
      name: payload.recipient_name!.trim(),
      phone: payload.phone!.trim(),
      address: {
        line1: payload.line1!.trim(),
        line2: (payload.line2 ?? "").trim(),
        city: payload.city!.trim(),
        postal_code: payload.postal_code!.trim(),
        state: (payload.state ?? "").trim(),
        country: payload.country!.trim().toUpperCase(),
      },
    };

    const { error } = await admin
      .from("club_memberships")
      .update({
        recipient_name: address.name,
        phone: address.phone,
        shipping_address: address,
        shipping_note: (payload.note ?? "").trim(),
        shipping_status: "pending",
      })
      .eq("id", (m as any).id);
    if (error) throw error;

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("[update-club-shipping]", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
