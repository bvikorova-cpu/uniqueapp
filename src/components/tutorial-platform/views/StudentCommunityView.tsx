import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Users, Send, MessageCircle, Clock, Pin, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { formatDistanceToNow } from "date-fns";

interface Thread {
  id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  views_count: number;
  created_at: string;
  course_id: string;
  user_id: string;
  course_title?: string;
  author?: string;
}

interface Props { onBack: () => void; }

export function StudentCommunityView({ onBack }: Props) {
  const [newThread, setNewThread] = useState(false);
  const [threads, setThreads] = useState<Thread[]>([]);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [posting, setPosting] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("course_discussions")
      .select("id,title,content,is_pinned,views_count,created_at,course_id,user_id")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(30);
    const rows = (data ?? []) as Thread[];
    if (rows.length) {
      const courseIds = [...new Set(rows.map(r => r.course_id))];
      const userIds = [...new Set(rows.map(r => r.user_id))];
      const [{ data: courses }, { data: profs }] = await Promise.all([
        supabase.from("courses").select("id,title").in("id", courseIds),
        (supabase as any).from("profiles_public").select("id,username,full_name").in("id", userIds),
      ]);
      const cMap = new Map<string, any>((courses ?? []).map((c: any) => [c.id, c.title]));
      const pMap = new Map<string, any>((profs ?? []).map((p: any) => [p.id, p.username || p.full_name || "Student"]));
      rows.forEach(r => { r.course_title = cMap.get(r.course_id) || "General"; r.author = pMap.get(r.user_id) || "Student"; });
    }
    setThreads(rows);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handlePost = async () => {
    if (!title.trim() || !body.trim()) { toast.error("Title and content required"); return; }
    setPosting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast.error("Sign in first"); setPosting(false); return; }
    // Pick any course the user is enrolled in, else first published
    const { data: enr } = await supabase.from("course_enrollments").select("course_id").eq("user_id", user.id).limit(1).maybeSingle();
    let courseId = enr?.course_id;
    if (!courseId) {
      const { data: anyCourse } = await supabase.from("courses").select("id").eq("is_published", true).limit(1).maybeSingle();
      courseId = anyCourse?.id;
    }
    if (!courseId) { toast.error("No courses available yet"); setPosting(false); return; }
    const { error } = await supabase.from("course_discussions").insert({ title: title.trim(), content: body.trim(), course_id: courseId, user_id: user.id });
    setPosting(false);
    if (error) { toast.error(error.message); return; }
    setTitle(""); setBody(""); setNewThread(false);
    toast.success("Thread posted!");
    load();
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Users className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Student Community</h2>
            <p className="text-sm text-muted-foreground">{threads.length} active discussions</p>
          </div>
        </div>
        <Button onClick={() => setNewThread(!newThread)} className="bg-gradient-to-r from-sky-500 to-blue-600">
          <MessageCircle className="w-4 h-4 mr-2" />New Thread
        </Button>
      </div>

      {newThread && (
        <Card className="mb-6 border-sky-500/20">
          <CardContent className="pt-6 space-y-3">
            <Input placeholder="Thread title..." value={title} onChange={e => setTitle(e.target.value)} className="h-11" />
            <Textarea placeholder="Share your question or insight..." value={body} onChange={e => setBody(e.target.value)} rows={4} />
            <div className="flex gap-2">
              <Button className="bg-gradient-to-r from-sky-500 to-blue-600" onClick={handlePost} disabled={posting}>
                {posting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}Post Thread
              </Button>
              <Button variant="outline" onClick={() => setNewThread(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      ) : threads.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">No discussions yet. Be the first to start one!</Card>
      ) : (
        <div className="space-y-2">
          {threads.map(thread => (
            <Card key={thread.id} className={`p-4 hover:shadow-lg cursor-pointer transition-all ${thread.is_pinned ? "border-amber-500/20 bg-amber-500/5" : ""}`}>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500/20 to-blue-500/20 flex items-center justify-center shrink-0 mt-0.5 text-sm font-bold">
                  {(thread.author || "?").charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    {thread.is_pinned && <Pin className="w-3.5 h-3.5 text-amber-500" />}
                    <h3 className="font-bold">{thread.title}</h3>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1.5">
                    <span className="font-medium">{thread.author}</span>
                    <span className="flex items-center gap-1"><MessageCircle className="w-3 h-3" />{thread.views_count} views</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(thread.created_at), { addSuffix: true })}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5">{thread.course_title}</Badge>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
