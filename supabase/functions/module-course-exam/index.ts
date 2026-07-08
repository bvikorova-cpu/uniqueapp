// Universal edge function for module-course curriculum, final exam and
// certificate PDF issuing. Actions:
//   - "curriculum"   : returns rich structured curriculum (cached)
//   - "exam"         : returns 10 MCQs (cached quiz pool)
//   - "submit"       : scores answers; if >=70% issues certificate + PDF
//
// No AI credits are charged (users already paid for the course).
// Requires: LOVABLE_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.

import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PDFDocument, StandardFonts, rgb } from "npm:pdf-lib@1.17.1";
import QRCode from "npm:qrcode@1.5.4";

// ---- simple in-memory rate limiter (per isolate) ----
const rlBuckets = new Map<string, { count: number; resetAt: number }>();
function rateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const b = rlBuckets.get(key);
  if (!b || now > b.resetAt) {
    rlBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: max - 1, resetIn: windowMs };
  }
  if (b.count >= max) return { ok: false, remaining: 0, resetIn: b.resetAt - now };
  b.count++;
  return { ok: true, remaining: max - b.count, resetIn: b.resetAt - now };
}


const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

async function aiJson(system: string, user: string): Promise<any> {
  const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      response_format: { type: "json_object" },
    }),
  });
  if (res.status === 402) throw new Error("ai_credits_exhausted");
  if (!res.ok) throw new Error(`ai_error_${res.status}`);
  const data = await res.json();
  const raw = data?.choices?.[0]?.message?.content ?? "{}";
  try {
    return JSON.parse(raw);
  } catch {
    // Try to extract JSON block
    const m = raw.match(/\{[\s\S]*\}/);
    return m ? JSON.parse(m[0]) : {};
  }
}

async function generateCurriculum(meta: any) {
  const sys =
    "You are a senior curriculum designer. Return STRICT JSON with schema: " +
    '{"overview":"string (2-3 rich paragraphs)","learning_outcomes":["..."],"modules":[{"title":"Module title","summary":"1 paragraph","lessons":[{"title":"Lesson title","content":"3-5 detailed paragraphs, concrete examples, numbers, tools, exercises","key_points":["...","..."],"exercise":"a practical exercise for the learner"}]}],"final_project":"detailed final capstone project brief","resources":[{"label":"...","hint":"..."}]}. ' +
    "Write 6 modules with 3 lessons each (18 lessons total). Content must be rich, practical, worth the course price, in English.";
  const usr =
    `Course: ${meta.course_title}\nDescription: ${meta.description}\n` +
    `Level: ${meta.level}\nDuration: ${meta.duration}\nSkills: ${meta.skills?.join(", ")}\nPrice paid: €${meta.price}\n\n` +
    "Design an in-depth curriculum that fully justifies the price paid.";
  return await aiJson(sys, usr);
}

async function generateQuizPool(meta: any, curriculum: any) {
  const sys =
    "You are an assessment designer. Return STRICT JSON: " +
    '{"questions":[{"q":"question text","options":["A","B","C","D"],"answer_index":0,"explanation":"brief"}]}. ' +
    "Produce EXACTLY 20 rigorous multiple-choice questions covering the full curriculum. " +
    "Each question has 4 options and exactly one correct answer. Vary difficulty. No trick questions. Use English.";
  const usr = `Course: ${meta.course_title}\nCurriculum modules & lessons:\n` +
    (curriculum?.modules || [])
      .map((m: any, i: number) =>
        `Module ${i + 1}: ${m.title}\n` +
        (m.lessons || []).map((l: any) => ` - ${l.title}: ${l.key_points?.slice(0, 3).join("; ")}`).join("\n")
      )
      .join("\n");
  const out = await aiJson(sys, usr);
  const arr = Array.isArray(out?.questions) ? out.questions : [];
  return arr.filter(
    (q: any) => q && typeof q.q === "string" && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer_index)
  );
}

async function loadOrCreateCache(meta: any) {
  const course_key = `${meta.module_key}:${meta.course_slug}`;
  const { data: cached } = await admin
    .from("module_course_content_cache")
    .select("*")
    .eq("course_key", course_key)
    .maybeSingle();
  if (cached && cached.content && Array.isArray(cached.quiz_pool) && cached.quiz_pool.length >= 10) {
    return cached;
  }
  const content = cached?.content ?? (await generateCurriculum(meta));
  const quiz_pool =
    cached?.quiz_pool && Array.isArray(cached.quiz_pool) && cached.quiz_pool.length >= 10
      ? cached.quiz_pool
      : await generateQuizPool(meta, content);
  const row = {
    course_key,
    module_key: meta.module_key,
    course_slug: meta.course_slug,
    course_title: meta.course_title,
    content,
    quiz_pool,
    updated_at: new Date().toISOString(),
  };
  await admin.from("module_course_content_cache").upsert(row);
  return row;
}

function pickExamQuestions(pool: any[]): any[] {
  const shuffled = [...pool].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 10);
}

function makeCertNumber(): string {
  const rand = crypto.getRandomValues(new Uint8Array(4));
  const hex = Array.from(rand).map((b) => b.toString(16).padStart(2, "0")).join("").toUpperCase();
  const yr = new Date().getFullYear();
  return `UNIQ-${yr}-${hex}`;
}

async function generatePdf(opts: {
  recipient: string;
  course: string;
  module: string;
  score: number;
  certNumber: string;
  verifyUrl: string;
}) {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([842, 595]); // A4 landscape
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const fontLight = await pdf.embedFont(StandardFonts.Helvetica);
  const fontItalic = await pdf.embedFont(StandardFonts.HelveticaOblique);

  const purple = rgb(0.396, 0.169, 0.827);
  const pink = rgb(1.0, 0.078, 0.576);
  const dark = rgb(0.09, 0.09, 0.15);
  const grey = rgb(0.42, 0.42, 0.46);

  const M = 24;
  page.drawRectangle({ x: M, y: M, width: 842 - 2 * M, height: 595 - 2 * M, borderColor: purple, borderWidth: 2 });
  page.drawRectangle({ x: M + 8, y: M + 8, width: 842 - 2 * (M + 8), height: 595 - 2 * (M + 8), borderColor: pink, borderWidth: 1 });

  page.drawRectangle({ x: M + 16, y: 595 - M - 60, width: 842 - 2 * (M + 16), height: 46, color: purple });
  page.drawText("UNIQUE", { x: M + 32, y: 595 - M - 46, size: 22, font, color: rgb(1, 1, 1) });
  page.drawText("CERTIFICATE OF COMPLETION", { x: M + 130, y: 595 - M - 42, size: 14, font: fontLight, color: rgb(1, 1, 1) });
  page.drawText("uniqueapp.fun", { x: 842 - M - 120, y: 595 - M - 42, size: 11, font: fontLight, color: rgb(1, 1, 1) });

  page.drawText("This is to certify that", { x: 421 - 90, y: 420, size: 14, font: fontItalic, color: grey });

  const nameSize = 34;
  const nameWidth = font.widthOfTextAtSize(opts.recipient, nameSize);
  page.drawText(opts.recipient, { x: 421 - nameWidth / 2, y: 370, size: nameSize, font, color: dark });
  page.drawLine({ start: { x: 421 - nameWidth / 2 - 20, y: 362 }, end: { x: 421 + nameWidth / 2 + 20, y: 362 }, thickness: 1.5, color: purple });

  page.drawText("has successfully completed the course", { x: 421 - 130, y: 330, size: 13, font: fontLight, color: grey });

  const courseSize = 22;
  const courseWidth = font.widthOfTextAtSize(opts.course, courseSize);
  page.drawText(opts.course, { x: 421 - courseWidth / 2, y: 290, size: courseSize, font, color: purple });

  const modText = `in the ${opts.module} track`;
  const modWidth = fontItalic.widthOfTextAtSize(modText, 12);
  page.drawText(modText, { x: 421 - modWidth / 2, y: 268, size: 12, font: fontItalic, color: grey });

  page.drawCircle({ x: 421, y: 200, size: 38, color: pink });
  const scoreText = `${Math.round(opts.score)}%`;
  const scoreW = font.widthOfTextAtSize(scoreText, 22);
  page.drawText(scoreText, { x: 421 - scoreW / 2, y: 192, size: 22, font, color: rgb(1, 1, 1) });
  page.drawText("Final Exam Score", { x: 421 - 45, y: 155, size: 10, font: fontLight, color: grey });

  // QR code (verify URL)
  try {
    const qrDataUrl: string = await QRCode.toDataURL(opts.verifyUrl, {
      errorCorrectionLevel: "M",
      margin: 0,
      width: 220,
      color: { dark: "#1a1a26", light: "#ffffff" },
    });
    const b64 = qrDataUrl.split(",")[1];
    const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
    const qrImg = await pdf.embedPng(bin);
    const qrSize = 90;
    page.drawImage(qrImg, { x: 842 - M - 40 - qrSize, y: 130, width: qrSize, height: qrSize });
    page.drawText("Scan to verify", { x: 842 - M - 40 - qrSize + 8, y: 118, size: 9, font: fontLight, color: grey });
  } catch (_e) { /* skip QR on failure */ }

  const dateStr = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
  page.drawText(`Issued: ${dateStr}`, { x: M + 40, y: 90, size: 11, font: fontLight, color: dark });
  page.drawText(`Certificate No: ${opts.certNumber}`, { x: M + 40, y: 72, size: 11, font, color: dark });
  page.drawText(`Verify: ${opts.verifyUrl}`, { x: M + 40, y: 54, size: 10, font: fontLight, color: purple });

  page.drawText("Unique Learning", { x: M + 300, y: 90, size: 12, font, color: dark });
  page.drawText("Authorised Signatory", { x: M + 300, y: 76, size: 9, font: fontLight, color: grey });
  page.drawLine({ start: { x: M + 300, y: 100 }, end: { x: M + 440, y: 100 }, thickness: 0.8, color: dark });

  const bytes = await pdf.save();
  return bytes;
}


Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const token = authHeader.replace("Bearer ", "");
    const userClient = createClient(SUPABASE_URL, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: `Bearer ${token}` } },
    });
    const { data: userRes } = await userClient.auth.getUser(token);
    const user = userRes?.user ?? null;

    const body = await req.json().catch(() => ({}));
    const action = body.action as string;
    const meta = body.meta as any;

    if (!action) return json({ error: "action required" }, 400);
    if (!["curriculum", "exam", "submit"].includes(action)) return json({ error: "unknown action" }, 400);
    if (!meta || !meta.module_key || !meta.course_slug || !meta.course_title) {
      return json({ error: "meta.module_key / course_slug / course_title required" }, 400);
    }

    if (action === "curriculum") {
      const cached = await loadOrCreateCache(meta);
      return json({ content: cached.content });
    }

    if (action === "exam") {
      if (!user) return json({ error: "auth required" }, 401);
      const rl = rateLimit(`exam:${user.id}`, 10, 60 * 60 * 1000); // 10 exam starts/hour
      if (!rl.ok) return json({ error: "rate_limited", retry_in_ms: rl.resetIn }, 429);
      const cached = await loadOrCreateCache(meta);
      const questions = pickExamQuestions(cached.quiz_pool as any[]).map((q: any, i: number) => ({
        id: i,
        q: q.q,
        options: q.options,
      }));
      const answerKey = pickAnswerKey(cached.quiz_pool, questions);
      const sig = await signKey(answerKey);
      return json({ questions, exam_token: sig });
    }

    if (action === "submit") {
      if (!user) return json({ error: "auth required" }, 401);
      const rl = rateLimit(`submit:${user.id}`, 20, 60 * 60 * 1000);
      if (!rl.ok) return json({ error: "rate_limited", retry_in_ms: rl.resetIn }, 429);


    if (action === "submit") {
      if (!user) return json({ error: "auth required" }, 401);
      const answers = body.answers as number[];
      const exam_token = body.exam_token as string;
      const recipient = String(body.recipient_name ?? "").trim().slice(0, 80) || "Learner";
      if (!Array.isArray(answers) || !exam_token) return json({ error: "answers & exam_token required" }, 400);
      const key = await verifyKey(exam_token);
      if (!key) return json({ error: "invalid exam_token" }, 400);
      if (answers.length !== key.length) return json({ error: "answer count mismatch" }, 400);

      let correct = 0;
      for (let i = 0; i < key.length; i++) {
        if (Number(answers[i]) === Number(key[i])) correct++;
      }
      const score = Math.round((correct / key.length) * 100);
      const passed = score >= 70;

      if (!passed) {
        return json({ passed: false, score, correct, total: key.length });
      }

      const certNumber = makeCertNumber();
      const originHeader = req.headers.get("origin") || "https://uniqueapp.fun";
      const verifyUrl = `${originHeader.replace(/\/$/, "")}/cert/${certNumber}`;

      const pdfBytes = await generatePdf({
        recipient,
        course: meta.course_title,
        module: meta.module_label ?? meta.module_key,
        score,
        certNumber,
        verifyUrl,
      });

      const objectPath = `${user.id}/${certNumber}.pdf`;
      const { error: upErr } = await admin.storage
        .from("certificates")
        .upload(objectPath, pdfBytes, { contentType: "application/pdf", upsert: true });
      if (upErr) throw upErr;
      const { data: pub } = admin.storage.from("certificates").getPublicUrl(objectPath);
      const pdf_url = pub.publicUrl;

      const { data: certRow, error: insErr } = await admin
        .from("education_certificates")
        .insert({
          user_id: user.id,
          course_title: `${meta.module_label ?? meta.module_key} · ${meta.course_title}`,
          score,
          recipient_name: recipient,
          certificate_code: certNumber,
          pdf_url,
        })
        .select()
        .single();
      if (insErr) throw insErr;

      return json({ passed: true, score, correct, total: key.length, certificate: certRow, verify_url: verifyUrl });
    }

    return json({ error: "unhandled" }, 400);
  } catch (e: any) {
    console.error("module-course-exam error", e);
    return json({ error: e?.message ?? "server_error" }, 500);
  }
});

// --------- helpers: pick + sign / verify answer key ---------
function pickAnswerKey(pool: any[], picked: any[]): number[] {
  return picked.map((q: any) => {
    const found = pool.find((p: any) => p.q === q.q);
    return found ? Number(found.answer_index) : 0;
  });
}

const SIGNING_SECRET = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "unique-fallback-secret";
async function signKey(key: number[]): Promise<string> {
  const payload = JSON.stringify({ k: key, t: Date.now() });
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(SIGNING_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(payload));
  const b64 = btoa(payload) + "." + btoa(String.fromCharCode(...new Uint8Array(sig)));
  return b64;
}
async function verifyKey(token: string): Promise<number[] | null> {
  try {
    const [payloadB64, sigB64] = token.split(".");
    if (!payloadB64 || !sigB64) return null;
    const payload = atob(payloadB64);
    const enc = new TextEncoder();
    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      enc.encode(SIGNING_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const sigBytes = Uint8Array.from(atob(sigB64), (c) => c.charCodeAt(0));
    const ok = await crypto.subtle.verify("HMAC", cryptoKey, sigBytes, enc.encode(payload));
    if (!ok) return null;
    const parsed = JSON.parse(payload);
    if (!Array.isArray(parsed.k)) return null;
    // Optional: reject tokens older than 2 hours
    if (typeof parsed.t === "number" && Date.now() - parsed.t > 2 * 60 * 60 * 1000) return null;
    return parsed.k.map((n: any) => Number(n));
  } catch {
    return null;
  }
}
