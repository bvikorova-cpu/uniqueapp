import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Loader2, MessageCircle, ShieldCheck, GraduationCap, Inbox } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { CourseChatDialog } from "../CourseChatDialog";

interface Msg {
  id: string;
  course_id: string;
  sender_id: string;
  receiver_id: string;
  message: string;
  is_read: boolean | null;
  created_at: string;
}

interface CourseRow {
  id: string;
  title: string;
  price: number;
  creator_id: string;
}

interface Profile {
  id: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface Req {
  id: string;
  course_id: string;
  buyer_id: string;
  creator_id: string;
  status: string;
  created_at: string;
}

interface Thread {
  courseId: string;
  otherId: string;
  course: CourseRow | null;
  other: Profile | null;
  last: Msg;
  unread: number;
  iAmCreator: boolean;
}

interface Props {
  onBack: () => void;
}

export function CourseMessagesView({ onBack }: Props) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [courses, setCourses] = useState<Record<string, CourseRow>>({});
  const [profiles, setProfiles] = useState<Record<string, Profile>>({});
  const [requests, setRequests] = useState<Req[]>([]);
  const [active, setActive] = useState<Thread | null>(null);
  const [granting, setGranting] = useState<string | null>(null);
  const [tab, setTab] = useState("all");

  const load = async () => {
    if (!user) return;
    setLoading(true);

    const [{ data: msgs }, { data: reqs }] = await Promise.all([
      (supabase as any)
        .from("course_messages")
        .select("id, course_id, sender_id, receiver_id, message, is_read, created_at")
        .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
        .order("created_at", { ascending: false })
        .limit(500),
      (supabase as any)
        .from("course_access_requests")
        .select("id, course_id, buyer_id, creator_id, status, created_at")
        .order("created_at", { ascending: false }),
    ]);

    const rows: Msg[] = msgs || [];
    setMessages(rows);
    setRequests((reqs || []) as Req[]);

    const courseIds = [...new Set([...rows.map((m) => m.course_id), ...((reqs || []) as Req[]).map((r) => r.course_id)])];
    const userIds = [
      ...new Set([
        ...rows.flatMap((m) => [m.sender_id, m.receiver_id]),
        ...((reqs || []) as Req[]).flatMap((r) => [r.buyer_id, r.creator_id]),
      ]),
    ].filter((id) => id !== user.id);

    if (courseIds.length) {
      const { data } = await supabase.from("courses").select("id, title, price, creator_id").in("id", courseIds);
      setCourses(Object.fromEntries(((data || []) as any[]).map((c) => [c.id, c as CourseRow])));
    }
    if (userIds.length) {
      const { data } = await supabase
        .from("public_profiles")
        .select("id, full_name, username, avatar_url")
        .in("id", userIds);
      setProfiles(Object.fromEntries(((data || []) as any[]).map((p) => [p.id, p as Profile])));
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    if (!user) return;
    const channel = supabase
      .channel(`course-inbox-${user.id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "course_messages" }, () => load())
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const threads = useMemo<Thread[]>(() => {
    if (!user) return [];
    const map = new Map<string, Thread>();
    for (const m of messages) {
      const otherId = m.sender_id === user.id ? m.receiver_id : m.sender_id;
      const key = `${m.course_id}:${otherId}`;
      const course = courses[m.course_id] || null;
      const existing = map.get(key);
      const unreadInc = m.receiver_id === user.id && !m.is_read ? 1 : 0;
      if (existing) {
        existing.unread += unreadInc;
      } else {
        map.set(key, {
          courseId: m.course_id,
          otherId,
          course,
          other: profiles[otherId] || null,
          last: m,
          unread: unreadInc,
          iAmCreator: !!course && course.creator_id === user.id,
        });
      }
    }
    return [...map.values()];
  }, [messages, courses, profiles, user]);

  const incomingRequests = useMemo(
    () => requests.filter((r) => user && r.creator_id === user.id),
    [requests, user],
  );

  const nameOf = (p: Profile | null) => p?.full_name || p?.username || "User";

  const grant = async (requestId: string) => {
    setGranting(requestId);
    const { data, error } = await (supabase as any).rpc("grant_course_access", { p_request_id: requestId });
    setGranting(null);
    if (error) {
      toast.error(error.message);
      return;
    }
    if (!data?.success) {
      toast.error("Could not grant access");
      return;
    }
    toast.success("Access granted — the student now has the course in their library");
    load();
  };

  const visible = threads.filter((t) => (tab === "all" ? true : tab === "selling" ? t.iAmCreator : !t.iAmCreator));

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to Dashboard
      </Button>

      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-primary/20 bg-gradient-to-br from-primary/20 to-accent/15">
          <MessageCircle className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight">Course Messages</h2>
          <p className="text-sm text-muted-foreground">Arrange payment directly and grant access with one click</p>
        </div>
      </div>

      {/* Access requests for my courses */}
      {incomingRequests.length > 0 && (
        <Card className="mb-6 border-primary/20 bg-card/60 p-4 backdrop-blur-xl">
          <p className="mb-3 flex items-center gap-2 text-sm font-bold">
            <Inbox className="h-4 w-4 text-primary" />
            Access requests ({incomingRequests.filter((r) => r.status === "pending").length} pending)
          </p>
          <div className="space-y-2">
            {incomingRequests.map((r) => (
              <div
                key={r.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border/60 bg-background/60 p-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">{courses[r.course_id]?.title || "Course"}</p>
                  <p className="text-xs text-muted-foreground">
                    {nameOf(profiles[r.buyer_id] || null)} ·{" "}
                    {courses[r.course_id]?.price ? `€${Number(courses[r.course_id].price).toFixed(2)}` : "Free"}
                  </p>
                </div>
                {r.status === "granted" ? (
                  <Badge className="text-[10px]">Granted</Badge>
                ) : (
                  <Button size="sm" onClick={() => grant(r.id)} disabled={granting === r.id}>
                    {granting === r.id ? (
                      <Loader2 className="mr-1 h-3 w-3 animate-spin" />
                    ) : (
                      <ShieldCheck className="mr-1 h-3 w-3" />
                    )}
                    Grant access
                  </Button>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="buying">Learning</TabsTrigger>
          <TabsTrigger value="selling">Teaching</TabsTrigger>
        </TabsList>
        <TabsContent value={tab} className="space-y-2">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : visible.length === 0 ? (
            <Card className="p-12 text-center">
              <GraduationCap className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">No conversations yet</p>
            </Card>
          ) : (
            visible.map((t) => (
              <Card
                key={`${t.courseId}:${t.otherId}`}
                onClick={() => setActive(t)}
                className="flex cursor-pointer items-center gap-3 border-border/60 bg-card/60 p-3 backdrop-blur-xl transition-all hover:border-primary/40"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage src={t.other?.avatar_url || undefined} />
                  <AvatarFallback>{nameOf(t.other).charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-bold">{t.course?.title || "Course"}</p>
                    <Badge variant="secondary" className="text-[9px]">
                      {t.iAmCreator ? "Teaching" : "Learning"}
                    </Badge>
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {nameOf(t.other)}: {t.last.message}
                  </p>
                </div>
                {t.unread > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1.5 text-[10px] font-bold text-destructive-foreground">
                    {t.unread}
                  </span>
                )}
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {active && (
        <CourseChatDialog
          open={!!active}
          onOpenChange={(o) => {
            if (!o) {
              setActive(null);
              load();
            }
          }}
          courseId={active.courseId}
          courseTitle={active.course?.title || "Course"}
          coursePrice={active.course?.price}
          otherId={active.otherId}
          otherName={nameOf(active.other)}
        />
      )}
    </div>
  );
}
