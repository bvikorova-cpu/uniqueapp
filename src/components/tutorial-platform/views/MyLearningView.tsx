import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Loader2, GraduationCap, Eye, MessageCircle, Clock, CheckCircle2, PlayCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";
import { CourseChatDialog } from "../CourseChatDialog";

interface Props {
  onBack: () => void;
}

interface CourseInfo {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  thumbnail_url: string | null;
  creator_id: string;
  total_lessons: number | null;
}

interface Row {
  courseId: string;
  course: CourseInfo | null;
  status: "pending" | "granted" | "declined" | "enrolled";
  createdAt: string;
  progress: number;
}

export function MyLearningView({ onBack }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [chat, setChat] = useState<{ courseId: string; creatorId: string; title: string } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setRows([]); return; }

      const [{ data: reqs }, { data: enrolls }] = await Promise.all([
        (supabase as any)
          .from("course_access_requests")
          .select("id, course_id, status, created_at")
          .eq("buyer_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("course_enrollments")
          .select("course_id, enrolled_at, progress_percentage")
          .eq("user_id", user.id),
      ]);

      const enrollMap = new Map<string, { enrolled_at: string; progress_percentage: number | null }>(
        ((enrolls || []) as any[]).map((e) => [e.course_id, e]),
      );

      const merged = new Map<string, Row>();
      for (const e of enrollMap.entries()) {
        merged.set(e[0], {
          courseId: e[0],
          course: null,
          status: "enrolled",
          createdAt: e[1].enrolled_at,
          progress: e[1].progress_percentage ?? 0,
        });
      }
      for (const r of (reqs || []) as any[]) {
        const enrolled = enrollMap.get(r.course_id);
        merged.set(r.course_id, {
          courseId: r.course_id,
          course: null,
          status: enrolled || r.status === "granted" ? (enrolled ? "enrolled" : "granted") : r.status,
          createdAt: r.created_at,
          progress: enrolled?.progress_percentage ?? 0,
        });
      }

      const ids = [...merged.keys()];
      if (ids.length) {
        const { data: courses } = await supabase
          .from("courses")
          .select("id, title, description, category, thumbnail_url, creator_id, total_lessons")
          .in("id", ids);
        for (const c of ((courses || []) as any[]) as CourseInfo[]) {
          const row = merged.get(c.id);
          if (row) row.course = c;
        }
      }

      setRows([...merged.values()].sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)));
    } catch (e: any) {
      toast({ title: "Could not load your courses", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const active = useMemo(() => rows.filter((r) => r.status === "enrolled" || r.status === "granted"), [rows]);
  const waiting = useMemo(() => rows.filter((r) => r.status === "pending"), [rows]);
  const declined = useMemo(() => rows.filter((r) => r.status === "declined"), [rows]);

  const statusBadge = (status: Row["status"]) => {
    if (status === "enrolled" || status === "granted")
      return <Badge className="gap-1"><CheckCircle2 className="h-3 w-3" /> Access granted</Badge>;
    if (status === "pending")
      return <Badge variant="secondary" className="gap-1"><Clock className="h-3 w-3" /> Waiting for creator</Badge>;
    return <Badge variant="outline">Declined</Badge>;
  };

  const renderRow = (r: Row) => (
    <Card key={r.courseId} className="p-4 backdrop-blur-xl bg-card/70">
      <div className="flex gap-3">
        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-xl bg-secondary/30">
          {r.course?.thumbnail_url ? (
            <img src={r.course.thumbnail_url} alt={r.course.title} className="h-full w-full object-cover" loading="lazy" />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <GraduationCap className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate font-bold">{r.course?.title || "Course"}</h3>
            {statusBadge(r.status)}
          </div>
          <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{r.course?.description}</p>
          <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
            {r.course?.category && <Badge variant="outline">{r.course.category}</Badge>}
            <Badge variant="outline">{r.course?.total_lessons ?? 0} lessons</Badge>
            {r.status === "enrolled" && <Badge variant="outline">{r.progress}% done</Badge>}
          </div>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:flex">
        {(r.status === "enrolled" || r.status === "granted") && (
          <Button size="sm" onClick={() => navigate(`/course-learn/${r.courseId}`)}>
            <PlayCircle className="mr-2 h-4 w-4" />Start learning
          </Button>
        )}
        <Button size="sm" variant="outline" onClick={() => navigate(`/tutorial-course/${r.courseId}`)}>
          <Eye className="mr-2 h-4 w-4" />View course
        </Button>
        {r.course && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setChat({ courseId: r.courseId, creatorId: r.course!.creator_id, title: r.course!.title })}
          >
            <MessageCircle className="mr-2 h-4 w-4" />Chat with creator
          </Button>
        )}
      </div>
    </Card>
  );

  return (
    <>
      <FloatingHowItWorks
        title="My Learning - How it works"
        steps={[
          { title: "Requests", desc: "Every course you asked access for appears here right after you pay 3 credits." },
          { title: "Waiting", desc: "Pending requests show while the creator agrees with you in chat." },
          { title: "Granted", desc: "Once the creator grants access, the course moves to Access granted." },
          { title: "Learn", desc: "Tap Start learning to open lessons, videos and documents." },
        ]}
      />
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="mr-2 h-4 w-4" />Back</Button>
        <div className="mx-auto max-w-3xl">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 shadow-lg">
              <GraduationCap className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-black">My Learning</h2>
              <p className="text-sm text-muted-foreground">Courses you bought or requested access to</p>
            </div>
          </div>

          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
          ) : rows.length === 0 ? (
            <Card className="p-8 text-center text-muted-foreground">
              You have no courses yet. Open Browse Courses, view a course for free and request access.
            </Card>
          ) : (
            <div className="space-y-6">
              {active.length > 0 && (
                <section className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-primary">Ready to learn</p>
                  {active.map(renderRow)}
                </section>
              )}
              {waiting.length > 0 && (
                <section className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Waiting for access</p>
                  {waiting.map(renderRow)}
                </section>
              )}
              {declined.length > 0 && (
                <section className="space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Declined</p>
                  {declined.map(renderRow)}
                </section>
              )}
            </div>
          )}
        </div>
      </div>

      {chat && (
        <CourseChatDialog
          open={!!chat}
          onOpenChange={(o) => { if (!o) { setChat(null); load(); } }}
          courseId={chat.courseId}
          courseTitle={chat.title}
          creatorId={chat.creatorId}
        />
      )}
    </>
  );
}
