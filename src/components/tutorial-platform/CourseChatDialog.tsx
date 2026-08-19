import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Loader2, Send, ShieldCheck, GraduationCap } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { ChatAttachmentPicker, ChatAttachmentPreview, ChatAttachmentView, uploadChatMedia } from "@/components/chat/ChatAttachment";

interface Msg {
  id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  created_at: string;
  attachment_path?: string | null;
  attachment_type?: string | null;
}

interface Props {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  courseId: string;
  courseTitle: string;
  coursePrice?: number;
  /** The other participant (creator when the student writes, student when the creator replies) */
  otherId: string;
  otherName?: string;
  /** Prefill the first message with the interest template */
  prefillInterest?: boolean;
}

export function CourseChatDialog({
  open,
  onOpenChange,
  courseId,
  courseTitle,
  coursePrice,
  otherId,
  otherName,
  prefillInterest,
}: Props) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Msg[]>([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [request, setRequest] = useState<{ id: string; status: string } | null>(null);
  const [granting, setGranting] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [creatorId, setCreatorId] = useState<string | null>(null);
  const iAmCreator = !!user && !!creatorId && creatorId === user.id;

  const markRead = async () => {
    if (!user) return;
    await (supabase as any)
      .from("course_messages")
      .update({ is_read: true })
      .eq("course_id", courseId)
      .eq("sender_id", otherId)
      .eq("receiver_id", user.id)
      .eq("is_read", false);
  };

  // Prefill template
  useEffect(() => {
    if (!open) return;
    if (prefillInterest) {
      const price = coursePrice && coursePrice > 0 ? `€${Number(coursePrice).toFixed(2)}` : "the price";
      setContent(`Hi, I'm interested in your course "${courseTitle}". How can I send you ${price}?`);
    }
  }, [open, prefillInterest, courseTitle, coursePrice]);

  // Load course owner + request state
  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    (async () => {
      const { data: course } = await supabase.from("courses").select("creator_id").eq("id", courseId).maybeSingle();
      if (cancelled) return;
      setCreatorId((course as any)?.creator_id ?? null);

      const buyerId = (course as any)?.creator_id === user.id ? otherId : user.id;
      const { data: req } = await (supabase as any)
        .from("course_access_requests")
        .select("id, status")
        .eq("course_id", courseId)
        .eq("buyer_id", buyerId)
        .maybeSingle();
      if (cancelled) return;
      setRequest(req ? { id: req.id, status: req.status } : null);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, user, courseId, otherId]);

  // Messages + realtime
  useEffect(() => {
    if (!open || !user) return;
    let cancelled = false;
    setLoading(true);

    const fetchMessages = async (initial = false) => {
      const { data } = await (supabase as any)
        .from("course_messages")
        .select("id, sender_id, receiver_id, message, created_at, attachment_path, attachment_type")
        .eq("course_id", courseId)
        .order("created_at", { ascending: true });
      if (cancelled) return;
      const rows = ((data || []) as Msg[]).filter(
        (m) =>
          (m.sender_id === user.id && m.receiver_id === otherId) ||
          (m.sender_id === otherId && m.receiver_id === user.id),
      );
      setMessages(rows);
      if (initial) setLoading(false);
      markRead();
    };

    fetchMessages(true);

    const channel = supabase
      .channel(`coursemsg-${courseId}-${otherId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "course_messages", filter: `course_id=eq.${courseId}` },
        (payload) => {
          const m = payload.new as Msg;
          const relevant =
            (m.sender_id === user.id && m.receiver_id === otherId) ||
            (m.sender_id === otherId && m.receiver_id === user.id);
          if (!relevant) return;
          setMessages((prev) => (prev.some((x) => x.id === m.id) ? prev : [...prev, m]));
          if (m.sender_id !== user.id) markRead();
        },
      )
      .subscribe();

    const poll = window.setInterval(() => fetchMessages(), 5000);
    return () => {
      cancelled = true;
      window.clearInterval(poll);
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, user, courseId, otherId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  /**
   * Buyers pay 3 credits once per course to open the access request.
   * Returns false when the charge failed (no message is sent in that case).
   */
  const ensureRequest = async (): Promise<boolean> => {
    if (!user || !creatorId || creatorId === user.id || request) return true;
    const { data, error } = await (supabase as any).rpc("request_course_access", { p_course_id: courseId });
    if (error) {
      const msg = String(error.message || "");
      if (/INSUFFICIENT|credits/i.test(msg)) {
        toast.error("Not enough credits — buying a course costs 3 credits");
      } else {
        toast.error(msg || "Could not create the access request");
      }
      return false;
    }
    if (data?.request_id) setRequest({ id: data.request_id, status: data.status ?? "pending" });
    if (data?.charged) toast.success("3 credits used — access request sent to the creator");
    return true;
  };

  const send = async () => {
    if (!user) {
      toast.error("Please sign in");
      return;
    }
    const trimmed = content.trim();
    if (!file && trimmed.length < 2) {
      toast.error("Message is too short");
      return;
    }
    setSending(true);

    // Charge the 3-credit buyer fee before the first message goes out.
    const ok = await ensureRequest();
    if (!ok) {
      setSending(false);
      return;
    }

    let attachment_path: string | null = null;
    let attachment_type: string | null = null;
    if (file) {
      try {
        attachment_path = await uploadChatMedia(file, user.id);
        attachment_type = file.type;
      } catch (e: any) {
        setSending(false);
        toast.error(e?.message || "Upload failed");
        return;
      }
    }

    const body = trimmed || `📷 ${file?.name ?? "photo"}`;
    const { error } = await (supabase as any).from("course_messages").insert({
      course_id: courseId,
      sender_id: user.id,
      receiver_id: otherId,
      message: body,
      attachment_path,
      attachment_type,
    });
    setSending(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    setContent("");
    setFile(null);
  };


  const grantAccess = async () => {
    if (!request) return;
    setGranting(true);
    const { data, error } = await (supabase as any).rpc("grant_course_access", { p_request_id: request.id });
    setGranting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data?.success) {
      toast.error(data?.error === "NOT_OWNER" ? "Only the course creator can grant access" : "Could not grant access");
      return;
    }
    setRequest({ ...request, status: "granted" });
    toast.success("Access granted — the course is now in the student's library");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg p-0 overflow-hidden">
        <DialogHeader className="border-b border-border/60 bg-card/60 p-4 backdrop-blur-xl">
          <DialogTitle className="flex items-center gap-2 text-base">
            <GraduationCap className="h-4 w-4 text-primary" />
            {courseTitle}
          </DialogTitle>
          <DialogDescription className="text-xs">
            {otherName ? `Chat with ${otherName}` : "Chat"} · payment is arranged directly between you, outside the platform.
          </DialogDescription>
          {request && (
            <div className="flex items-center gap-2 pt-1">
              <Badge variant={request.status === "granted" ? "default" : "secondary"} className="text-[10px]">
                {request.status === "granted" ? "Access granted" : "Access requested"}
              </Badge>
              {iAmCreator && request.status !== "granted" && (
                <Button size="sm" className="h-7 text-xs" onClick={grantAccess} disabled={granting}>
                  {granting ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : <ShieldCheck className="mr-1 h-3 w-3" />}
                  Grant access
                </Button>
              )}
            </div>
          )}
        </DialogHeader>

        <ScrollArea className="h-[320px] p-4" ref={scrollRef as any}>
          {loading ? (
            <div className="flex h-full items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <p className="py-10 text-center text-xs text-muted-foreground">
              No messages yet. Send the first message to arrange the payment.
            </p>
          ) : (
            <div className="space-y-2">
              {messages.map((m) => {
                const mine = m.sender_id === user?.id;
                return (
                  <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${
                        mine ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                      }`}
                    >
                      {m.attachment_path && (
                        <ChatAttachmentView path={m.attachment_path} type={m.attachment_type ?? undefined} />
                      )}
                      <p className="whitespace-pre-wrap break-words">{m.message}</p>
                      <p className="mt-1 text-[10px] opacity-70">
                        {new Date(m.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <div className="space-y-2 border-t border-border/60 p-3">
          {file && <ChatAttachmentPreview file={file} onRemove={() => setFile(null)} />}
          <div className="flex items-end gap-2">
            <ChatAttachmentPicker file={file} onFileChange={setFile} disabled={sending} />
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a message…"
              className="min-h-[44px] max-h-28 resize-none text-sm"
            />
            <Button onClick={send} disabled={sending} size="icon" className="shrink-0">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
