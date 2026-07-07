// Doctor creates a prescription for a completed/confirmed appointment.
// Generates a minimal PDF (pdf-lib) with a QR code URL and stores it in `prescriptions/{doctor_id}/{rx_id}.pdf`.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { z } from "npm:zod@3";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";

const Med = z.object({
  name: z.string().min(1).max(200),
  dose: z.string().min(1).max(100),
  frequency: z.string().min(1).max(100),
  duration: z.string().max(100).optional(),
});
const Body = z.object({
  appointment_id: z.string().uuid(),
  medications: z.array(Med).min(1).max(20),
  dosage_instructions: z.string().max(2000).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const jwt = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    const { data: u } = await admin.auth.getUser(jwt);
    const user = u.user;
    if (!user) return json({ error: "unauthorized" }, 401);

    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) return json({ error: parsed.error.flatten() }, 400);
    const { appointment_id, medications, dosage_instructions } = parsed.data;

    const { data: appt } = await admin
      .from("healthcare_appointments")
      .select("id,patient_id,provider_id,status")
      .eq("id", appointment_id)
      .maybeSingle();
    if (!appt) return json({ error: "not_found" }, 404);
    if (appt.provider_id !== user.id) return json({ error: "forbidden" }, 403);
    if (!["confirmed", "completed"].includes(appt.status ?? ""))
      return json({ error: "invalid_status" }, 400);

    const { data: rx, error: insErr } = await admin
      .from("prescriptions")
      .insert({
        appointment_id,
        doctor_id: user.id,
        patient_id: appt.patient_id,
        medications,
        dosage_instructions: dosage_instructions ?? null,
      })
      .select("id, qr_token, issued_at")
      .single();
    if (insErr || !rx) return json({ error: insErr?.message ?? "insert_failed" }, 500);

    // Build a minimal PDF
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]);
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    let y = 800;
    page.drawText("E-Prescription", { x: 50, y, size: 22, font: bold, color: rgb(0.3, 0.1, 0.6) });
    y -= 30;
    page.drawText(`Issued: ${new Date(rx.issued_at).toISOString().slice(0, 16).replace("T", " ")}`, {
      x: 50, y, size: 10, font,
    });
    y -= 20;
    page.drawText(`Doctor ID: ${user.id}`, { x: 50, y, size: 9, font });
    y -= 14;
    page.drawText(`Patient ID: ${appt.patient_id}`, { x: 50, y, size: 9, font });
    y -= 30;
    page.drawText("Medications", { x: 50, y, size: 14, font: bold });
    y -= 20;
    for (const m of medications) {
      const line = `• ${m.name} — ${m.dose}, ${m.frequency}${m.duration ? `, for ${m.duration}` : ""}`;
      page.drawText(line, { x: 50, y, size: 11, font });
      y -= 16;
    }
    if (dosage_instructions) {
      y -= 10;
      page.drawText("Instructions:", { x: 50, y, size: 12, font: bold });
      y -= 16;
      for (const line of dosage_instructions.match(/.{1,80}/g) ?? []) {
        page.drawText(line, { x: 50, y, size: 10, font });
        y -= 14;
      }
    }
    y -= 20;
    page.drawText(`Verify: ${Deno.env.get("PUBLIC_APP_URL") ?? "https://uniqueapp.fun"}/rx/${rx.qr_token}`, {
      x: 50, y, size: 8, font,
    });

    const bytes = await pdf.save();
    const path = `${user.id}/${rx.id}.pdf`;
    const { error: upErr } = await admin.storage.from("prescriptions").upload(path, bytes, {
      contentType: "application/pdf",
      upsert: true,
    });
    if (upErr) return json({ error: upErr.message }, 500);

    const { data: signed } = await admin.storage
      .from("prescriptions")
      .createSignedUrl(path, 300);

    await admin.from("prescriptions").update({ pdf_url: path }).eq("id", rx.id);

    return json({
      id: rx.id,
      qr_token: rx.qr_token,
      pdf_signed_url: signed?.signedUrl ?? null,
    });
  } catch (e) {
    console.error("create-prescription error", e);
    return json({ error: "internal" }, 500);
  }
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
