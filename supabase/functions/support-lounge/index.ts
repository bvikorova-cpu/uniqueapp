import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";
import { z } from "npm:zod@3.23.8";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { callUnifiedAI } from "../_shared/unifiedAI.ts";
import { spendAiCredits } from "../_shared/spendCredits.ts";

const ENTRY_CREDITS = 1;
const AI_MESSAGE_CREDITS = 3;
const DM_CREDITS = 1;
const ROOMS = ["cheated-on", "broken-heart", "left-behind", "lonely", "new-beginnings"] as const;
const RoomSchema = z.enum(ROOMS);
const IdSchema = z.string().uuid();
const ContentSchema = z.string().trim().min(1).max(500);

const AI_SYSTEM_PROMPT = `You are a warm, empathetic support companion inside "Broken Hearts — You Are Not Alone" on the Unique platform. Listen without judging, validate feelings first, and offer small healthy next steps. Never encourage revenge, self-harm, or contact with an abusive ex. You are not a therapist, doctor, crisis service, lawyer, or financial adviser. If the user mentions self-harm, suicide, or immediate danger, urge them to contact local emergency services or a crisis hotline and someone they trust. Keep replies under 180 words.`;

const CONTACT_PATTERNS = [
  /[a-z0-9._%+-]+\s*(?:@|\(at\)|\[at\]|\s+at\s+)\s*[a-z0-9.-]+\s*(?:\.|\(dot\)|\[dot\]|\s+dot\s+)\s*[a-z]{2,}/gi,
  /(?:https?:\/\/|www\.)\S+/gi,
  /[a-z0-9-]+\.(?:com|net|org|sk|cz|eu|io|me|info|shop|online|biz|ru|de|at|hu|pl)(?:\/\S*)?/gi,
  /(?:\+|00)?\s*(?:\(?\d{1,4}\)?[\s.\-/]*){2,}\d{2,}/g,
  /\d{7,}/g,
  /(?:skype|telegram|whats\s*app|whatsapp|wa\.me|viber|signal|messenger|snap\s*chat|snapchat|instagram|insta|facebook|tiktok|discord|imessage|wechat|kik|zalo|threema|icq|e-?mail|mail\s*me|call\s*me|phone|mobil|telefon|tel\.)/gi,
];

function scrubContactInfo(value: string) {
  let output = value;
  for (const pattern of CONTACT_PATTERNS) output = output.replace(pattern, "[contact hidden]");
  output = output.replace(/(^|[^a-z0-9])@[a-z0-9._]{3,}/gi, (_match, prefix) => `${prefix}[contact hidden]`);
  return output.replace(/(\[contact hidden\][\s,;:.–-]*){2,}/g, "[contact hidden] ").trim();
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const token = (req.headers.get("Authorization") ?? "").replace("Bearer ", "");
    if (!token) return json({ error: "Unauthorized" }, 401);

    const authClient = createClient(supabaseUrl, anonKey);
    const { data: { user }, error: authError } = await authClient.auth.getUser(token);
    if (authError || !user) return json({ error: "Unauthorized" }, 401);

    const parsedBody = z.object({ action: z.string().min(1).max(40) }).passthrough().safeParse(await req.json());
    if (!parsedBody.success) return json({ error: "Invalid request" }, 400);
    const { action, ...body } = parsedBody.data;
    const admin = createClient(supabaseUrl, serviceKey);
    const today = new Date().toISOString().slice(0, 10);

    const getIdentity = async () => {
      const { data } = await admin.from("support_lounge_identities").select("lounge_id,nickname").eq("user_id", user.id).maybeSingle();
      return data as { lounge_id: string; nickname: string } | null;
    };
    const ensureIdentity = async () => {
      const current = await getIdentity();
      if (current) return current;
      const { data: legacy } = await admin.from("support_lounge_nicknames").select("nickname").eq("user_id", user.id).maybeSingle();
      const { data, error } = await admin.from("support_lounge_identities").insert({ user_id: user.id, nickname: legacy?.nickname ?? "Anonymous" }).select("lounge_id,nickname").single();
      if (error || !data) throw new Error("identity_create_failed");
      return data as { lounge_id: string; nickname: string };
    };
    const getPass = async () => {
      const { data } = await admin.from("support_lounge_passes").select("id").eq("user_id", user.id).eq("pass_date", today).maybeSingle();
      return data;
    };
    const requirePass = async () => {
      const pass = await getPass();
      if (!pass) return null;
      return ensureIdentity();
    };
    const notify = async (targetLoungeId: string, type: string, title: string, message: string, actionUrl: string) => {
      const { data: target } = await admin.from("support_lounge_identities").select("user_id").eq("lounge_id", targetLoungeId).maybeSingle();
      if (!target?.user_id) return;
      await admin.from("notifications").insert({ user_id: target.user_id, actor_id: null, type, title, message, action_url: actionUrl });
    };

    if (action === "status") {
      const identity = await getIdentity();
      return json({ hasPass: Boolean(await getPass()), nickname: identity?.nickname ?? null });
    }

    if (action === "set_nickname") {
      const nickname = z.string().trim().min(2).max(24).regex(/^[\p{L}\p{N} _.-]+$/u).safeParse(body.nickname);
      if (!nickname.success) return json({ error: "Nickname must be 2–24 supported characters." }, 400);
      const identity = await getIdentity();
      const query = identity
        ? admin.from("support_lounge_identities").update({ nickname: nickname.data, updated_at: new Date().toISOString() }).eq("user_id", user.id)
        : admin.from("support_lounge_identities").insert({ user_id: user.id, nickname: nickname.data });
      const { error } = await query;
      if (error) return json({ error: "Could not save nickname." }, 500);
      await admin.from("support_lounge_nicknames").upsert({ user_id: user.id, nickname: nickname.data });
      return json({ ok: true, nickname: nickname.data });
    }

    if (action === "enter") {
      const identity = await ensureIdentity();
      let charged = false;
      let remaining: number | null = null;
      if (!(await getPass())) {
        const spend = await spendAiCredits(admin, user.id, ENTRY_CREDITS, "Broken Hearts daily entry", "support_lounge");
        if (!spend.ok) return json({ error: "insufficient_credits", required: ENTRY_CREDITS, remaining: spend.remaining }, 402);
        remaining = spend.remaining;
        const { error } = await admin.from("support_lounge_passes").insert({ user_id: user.id, pass_date: today, credits_charged: ENTRY_CREDITS });
        if (error && !String(error.message).includes("duplicate")) {
          await admin.rpc("add_ai_credits", { p_user_id: user.id, p_amount: ENTRY_CREDITS, p_reason: "Broken Hearts entry refund", p_source: "support_lounge_refund" });
          return json({ error: "Failed to create pass" }, 500);
        }
        charged = true;
      }
      return json({ ok: true, charged, remaining, nickname: identity.nickname });
    }

    if (action === "room_history" || action === "visit_room") {
      const identity = await requirePass();
      if (!identity) return json({ error: "no_pass" }, 403);
      const room = RoomSchema.safeParse(body.room);
      if (!room.success) return json({ error: "invalid_room" }, 400);
      await admin.from("support_lounge_attendance").upsert({ lounge_id: identity.lounge_id, room: room.data, last_visited_at: new Date().toISOString() }, { onConflict: "lounge_id,room" });
      if (action === "visit_room") return json({ ok: true });
      const { data, error } = await admin.from("support_lounge_messages_v2").select("id,room,sender_lounge_id,nickname,content,created_at").eq("room", room.data).order("created_at", { ascending: false }).limit(50);
      if (error) return json({ error: "load_failed" }, 500);
      return json({ messages: [...(data ?? [])].reverse().map((m) => ({ id: m.id, room: m.room, memberId: m.sender_lounge_id, nickname: m.nickname, content: scrubContactInfo(m.content), created_at: m.created_at, mine: m.sender_lounge_id === identity.lounge_id })) });
    }

    if (action === "send_room") {
      const identity = await requirePass();
      if (!identity) return json({ error: "no_pass" }, 403);
      const room = RoomSchema.safeParse(body.room);
      const content = ContentSchema.safeParse(body.content);
      if (!room.success || !content.success) return json({ error: "invalid_message" }, 400);
      const safeContent = scrubContactInfo(content.data);
      const { data, error } = await admin.from("support_lounge_messages_v2").insert({ room: room.data, sender_lounge_id: identity.lounge_id, nickname: identity.nickname, content: safeContent }).select("id,room,sender_lounge_id,nickname,content,created_at").single();
      if (error) return json({ error: "send_failed" }, 500);
      await admin.from("support_lounge_attendance").upsert({ lounge_id: identity.lounge_id, room: room.data, last_visited_at: new Date().toISOString() }, { onConflict: "lounge_id,room" });
      return json({ message: { id: data.id, room: data.room, memberId: data.sender_lounge_id, nickname: data.nickname, content: data.content, created_at: data.created_at, mine: true } });
    }

    if (action === "list_dms") {
      const identity = await requirePass();
      if (!identity) return json({ error: "no_pass" }, 403);
      const { data, error } = await admin.from("support_lounge_dms_v2").select("id,from_lounge_id,to_lounge_id,from_nickname,content,created_at").or(`from_lounge_id.eq.${identity.lounge_id},to_lounge_id.eq.${identity.lounge_id}`).order("created_at", { ascending: true }).limit(300);
      if (error) return json({ error: "load_failed" }, 500);
      return json({ messages: (data ?? []).map((m) => ({ id: m.id, otherMemberId: m.from_lounge_id === identity.lounge_id ? m.to_lounge_id : m.from_lounge_id, fromNickname: m.from_nickname, content: scrubContactInfo(m.content), created_at: m.created_at, mine: m.from_lounge_id === identity.lounge_id })) });
    }

    if (action === "dm") {
      const identity = await requirePass();
      if (!identity) return json({ error: "no_pass" }, 403);
      const target = IdSchema.safeParse(body.memberId);
      const content = ContentSchema.safeParse(body.content);
      if (!target.success || !content.success || target.data === identity.lounge_id) return json({ error: "invalid_recipient" }, 400);
      const { data: recipient } = await admin.from("support_lounge_identities").select("lounge_id").eq("lounge_id", target.data).maybeSingle();
      if (!recipient) return json({ error: "invalid_recipient" }, 404);
      const spend = await spendAiCredits(admin, user.id, DM_CREDITS, "Broken Hearts private message", "support_lounge_dm");
      if (!spend.ok) return json({ error: "insufficient_credits", required: DM_CREDITS, remaining: spend.remaining }, 402);
      const { data, error } = await admin.from("support_lounge_dms_v2").insert({ from_lounge_id: identity.lounge_id, to_lounge_id: target.data, from_nickname: identity.nickname, content: scrubContactInfo(content.data), credits_charged: DM_CREDITS }).select("id,from_nickname,content,created_at").single();
      if (error) {
        await admin.rpc("add_ai_credits", { p_user_id: user.id, p_amount: DM_CREDITS, p_reason: "Broken Hearts private message refund", p_source: "support_lounge_dm_refund" });
        return json({ error: "send_failed" }, 500);
      }
      await notify(target.data, "support_lounge_dm", "New private message", `${identity.nickname} sent you a private message in Broken Hearts`, "/support-lounge?tab=private");
      return json({ ok: true, message: { id: data.id, otherMemberId: target.data, fromNickname: data.from_nickname, content: data.content, created_at: data.created_at, mine: true }, credits_used: DM_CREDITS, remaining: spend.remaining });
    }

    if (action === "contacts_list") {
      const identity = await requirePass();
      if (!identity) return json({ error: "no_pass" }, 403);
      const { data } = await admin.from("support_lounge_contacts").select("id,member_a,member_b,requested_by,status,created_at").or(`member_a.eq.${identity.lounge_id},member_b.eq.${identity.lounge_id}`).order("created_at", { ascending: false });
      const rows = data ?? [];
      const otherIds = rows.map((r) => r.member_a === identity.lounge_id ? r.member_b : r.member_a);
      const { data: people } = otherIds.length ? await admin.from("support_lounge_identities").select("lounge_id,nickname").in("lounge_id", otherIds) : { data: [] };
      const nicknameById = new Map((people ?? []).map((p) => [p.lounge_id, p.nickname]));
      const acceptedIds = rows.filter((r) => r.status === "accepted").map((r) => r.member_a === identity.lounge_id ? r.member_b : r.member_a);
      const allAttendanceIds = [identity.lounge_id, ...acceptedIds];
      const { data: attendance } = allAttendanceIds.length ? await admin.from("support_lounge_attendance").select("lounge_id,room").in("lounge_id", allAttendanceIds) : { data: [] };
      const mine = new Set((attendance ?? []).filter((a) => a.lounge_id === identity.lounge_id).map((a) => a.room));
      return json({ contacts: rows.map((r) => {
        const otherMemberId = r.member_a === identity.lounge_id ? r.member_b : r.member_a;
        return { id: r.id, otherMemberId, nickname: nicknameById.get(otherMemberId) ?? "Anonymous", status: r.status, direction: r.requested_by === identity.lounge_id ? "outgoing" : "incoming", sharedRooms: r.status === "accepted" ? (attendance ?? []).filter((a) => a.lounge_id === otherMemberId && mine.has(a.room)).map((a) => a.room) : [] };
      }) });
    }

    if (action === "contact_request") {
      const identity = await requirePass();
      if (!identity) return json({ error: "no_pass" }, 403);
      const target = IdSchema.safeParse(body.memberId);
      if (!target.success || target.data === identity.lounge_id) return json({ error: "invalid_member" }, 400);
      const [memberA, memberB] = [identity.lounge_id, target.data].sort();
      const { data: recipient } = await admin.from("support_lounge_identities").select("lounge_id").eq("lounge_id", target.data).maybeSingle();
      if (!recipient) return json({ error: "invalid_member" }, 404);
      const { error } = await admin.from("support_lounge_contacts").insert({ member_a: memberA, member_b: memberB, requested_by: identity.lounge_id, status: "pending" });
      if (error) return json({ error: String(error.code) === "23505" ? "request_exists" : "request_failed" }, String(error.code) === "23505" ? 409 : 500);
      await notify(target.data, "support_lounge_contact_request", "New Known People request", `${identity.nickname} wants to add you to Known People in Broken Hearts`, "/support-lounge?tab=known");
      return json({ ok: true });
    }

    if (action === "contact_respond") {
      const identity = await requirePass();
      if (!identity) return json({ error: "no_pass" }, 403);
      const contactId = IdSchema.safeParse(body.contactId);
      const decision = z.enum(["accept", "decline"]).safeParse(body.decision);
      if (!contactId.success || !decision.success) return json({ error: "invalid_request" }, 400);
      const { data: contact } = await admin.from("support_lounge_contacts").select("id,member_a,member_b,requested_by,status").eq("id", contactId.data).maybeSingle();
      if (!contact || contact.status !== "pending") return json({ error: "request_not_found" }, 404);
      const isRecipient = (contact.member_a === identity.lounge_id || contact.member_b === identity.lounge_id) && contact.requested_by !== identity.lounge_id;
      if (!isRecipient) return json({ error: "forbidden" }, 403);
      if (decision.data === "decline") await admin.from("support_lounge_contacts").delete().eq("id", contact.id);
      else {
        await admin.from("support_lounge_contacts").update({ status: "accepted", updated_at: new Date().toISOString() }).eq("id", contact.id);
        await notify(contact.requested_by, "support_lounge_contact_accepted", "Known People request accepted", `${identity.nickname} accepted your Known People request`, "/support-lounge?tab=known");
      }
      return json({ ok: true });
    }

    if (action === "ai") {
      const identity = await requirePass();
      if (!identity) return json({ error: "no_pass" }, 403);
      const messages = z.array(z.object({ role: z.enum(["user", "assistant"]), content: z.string().max(2000) })).min(1).max(20).safeParse(body.messages);
      if (!messages.success) return json({ error: "messages required" }, 400);
      const spend = await spendAiCredits(admin, user.id, AI_MESSAGE_CREDITS, "Broken Hearts AI Companion reply", "support_lounge_ai");
      if (!spend.ok) return json({ error: "insufficient_credits", required: AI_MESSAGE_CREDITS, remaining: spend.remaining }, 402);
      try {
        const reply = await callUnifiedAI([{ role: "system", content: AI_SYSTEM_PROMPT }, ...messages.data], { max_tokens: 700 });
        return json({ reply, credits_used: AI_MESSAGE_CREDITS, remaining: spend.remaining });
      } catch (error) {
        await admin.rpc("add_ai_credits", { p_user_id: user.id, p_amount: AI_MESSAGE_CREDITS, p_reason: "Broken Hearts AI Companion refund", p_source: "support_lounge_ai_refund" });
        throw error;
      }
    }

    return json({ error: "Unknown action" }, 400);
  } catch (error) {
    console.error("support-lounge error:", error);
    return json({ error: "Something went wrong. Please try again." }, 500);
  }
});