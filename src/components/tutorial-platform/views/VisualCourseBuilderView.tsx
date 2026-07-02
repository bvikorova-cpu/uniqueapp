import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Palette, Plus, GripVertical, Video, FileText, BookOpen, Trash2, Copy, Clock, Save, Loader2, ChevronDown, ChevronUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Module {
  id: number;
  title: string;
  type: string;
  duration: string;
  description?: string;
  video_url?: string;
}

const initialModules: Module[] = [
  { id: 1, title: "Introduction", type: "video", duration: "5 min" },
  { id: 2, title: "Core Concepts", type: "video", duration: "15 min" },
  { id: 3, title: "Hands-On Exercise", type: "document", duration: "20 min" },
];

interface Props { onBack: () => void; }

/**
 * Validate & normalize a video URL.
 * Returns a canonical embed URL for supported providers (YouTube, Vimeo),
 * null for empty input, or { error } for invalid input.
 */
export function normalizeVideoUrl(input: string): { url: string | null; error?: string } {
  const raw = (input || "").trim();
  if (!raw) return { url: null };

  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return { url: null, error: "Invalid URL address" };
  }
  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    return { url: null, error: "URL must use http(s)" };
  }

  const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

  // YouTube
  if (host === "youtube.com" || host === "m.youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") {
    let id = "";
    if (host === "youtu.be") {
      id = parsed.pathname.slice(1).split("/")[0];
    } else if (parsed.pathname.startsWith("/embed/")) {
      id = parsed.pathname.split("/embed/")[1].split("/")[0];
    } else if (parsed.pathname === "/watch") {
      id = parsed.searchParams.get("v") || "";
    } else if (parsed.pathname.startsWith("/shorts/")) {
      id = parsed.pathname.split("/shorts/")[1].split("/")[0];
    }
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
      return { url: null, error: "Invalid YouTube video ID" };
    }
    return { url: `https://www.youtube.com/embed/${id}` };
  }

  // Vimeo
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const segments = parsed.pathname.split("/").filter(Boolean);
    const idSeg = host === "player.vimeo.com" && segments[0] === "video" ? segments[1] : segments[0];
    if (!idSeg || !/^\d+$/.test(idSeg)) {
      return { url: null, error: "Invalid Vimeo video ID" };
    }
    return { url: `https://player.vimeo.com/video/${idSeg}` };
  }

  return { url: null, error: "Only YouTube and Vimeo links are supported" };
}

export function VisualCourseBuilderView({ onBack }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("video");
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [dragId, setDragId] = useState<number | null>(null);

  const updateModule = (id: number, patch: Partial<Module>) =>
    setModules(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)));

  const onDragStart = (id: number) => setDragId(id);
  const onDragOver = (e: React.DragEvent, overId: number) => {
    e.preventDefault();
    if (dragId === null || dragId === overId) return;
    setModules(prev => {
      const from = prev.findIndex(m => m.id === dragId);
      const to = prev.findIndex(m => m.id === overId);
      if (from < 0 || to < 0) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  };
  const onDragEnd = () => setDragId(null);

  const move = (id: number, dir: -1 | 1) => {
    setModules(prev => {
      const i = prev.findIndex(m => m.id === id);
      const j = i + dir;
      if (i < 0 || j < 0 || j >= prev.length) return prev;
      const next = [...prev];
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  // Course meta
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("Technology");
  const [difficulty, setDifficulty] = useState("beginner");
  const [price, setPrice] = useState("29.99");

  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4 text-rose-500" />;
      case "document": return <FileText className="w-4 h-4 text-blue-500" />;
      case "quiz": return <BookOpen className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const addModule = () => {
    if (!newTitle.trim()) return;
    setModules(prev => [...prev, { id: Date.now(), title: newTitle, type: newType, duration: "10 min" }]);
    setNewTitle("");
  };

  const removeModule = (id: number) => setModules(prev => prev.filter(m => m.id !== id));
  const duplicateModule = (mod: Module) => setModules(prev => [...prev, { ...mod, id: Date.now(), title: `${mod.title} (Copy)` }]);

  const totalDuration = modules.reduce((sum, m) => sum + (parseInt(m.duration) || 0), 0);

  const saveCourse = async (publish: boolean) => {
    if (!title.trim() || !description.trim()) {
      toast({ title: "Fill in the name and description", variant: "destructive" });
      return;
    }
    if (modules.length === 0) {
      toast({ title: "Add at least one module", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "You must be logged in", variant: "destructive" });
        setSaving(false);
        return;
      }

      const { data: course, error: courseErr } = await supabase
        .from("courses")
        .insert({
          creator_id: user.id,
          title,
          description,
          category,
          difficulty_level: difficulty,
          price: parseFloat(price) || 0,
          duration_minutes: totalDuration,
          total_lessons: modules.length,
          is_published: publish,
        })
        .select()
        .single();

      if (courseErr) throw courseErr;

      const lessonRows: any[] = [];
      for (let i = 0; i < modules.length; i++) {
        const m = modules[i];
        const { url: normalizedUrl, error: urlErr } = normalizeVideoUrl(m.video_url || "");
        if (urlErr) {
          toast({ title: `Modul ${i + 1}: ${urlErr}`, variant: "destructive" });
          setSaving(false);
          return;
        }
        lessonRows.push({
          course_id: course.id,
          title: m.title,
          description: m.description || null,
          video_url: normalizedUrl,
          duration_minutes: parseInt(m.duration) || 10,
          order_index: i,
          is_preview: i === 0,
        });
      }
      const { error: lessonsErr } = await supabase.from("course_lessons").insert(lessonRows);
      if (lessonsErr) throw lessonsErr;

      toast({ title: publish ? "Course published 🎉" : "Course saved as draft" });
      navigate(`/tutorial-course/${course.id}`);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <FloatingHowItWorks title={"Visual Course Builder View - How it works"} steps={[{ title: 'Open', desc: 'Access the Visual Course Builder View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Visual Course Builder View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Visual Course Builder</h2>
            <p className="text-sm text-muted-foreground">Create and publish your course</p>
          </div>
        </div>

        <Card className="p-4 mb-4 space-y-3">
          <Input placeholder="Course name *" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Popis kurzu *" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="rounded-md border bg-background px-2 text-sm">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <Input type="number" step="0.01" placeholder="Cena €" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
        </Card>

        <div className="flex items-center gap-3 mb-4">
          <Badge variant="outline"><BookOpen className="w-3 h-3 mr-1" />{modules.length} modulov</Badge>
          <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{totalDuration} min</Badge>
        </div>

        <div className="space-y-2 mb-4">
          {modules.map((mod, i) => {
            const expanded = expandedId === mod.id;
            return (
              <Card
                key={mod.id}
                draggable
                onDragStart={() => onDragStart(mod.id)}
                onDragOver={(e) => onDragOver(e, mod.id)}
                onDragEnd={onDragEnd}
                className={`p-3 hover:shadow-md transition-all group ${dragId === mod.id ? "opacity-50" : ""}`}
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab active:cursor-grabbing" />
                  <span className="text-xs font-bold text-muted-foreground w-6">{i + 1}.</span>
                  {getIcon(mod.type)}
                  <button onClick={() => setExpandedId(expanded ? null : mod.id)} className="font-semibold flex-1 text-sm text-left truncate">
                    {mod.title}
                  </button>
                  <Badge variant="outline" className="text-[10px]">{mod.type}</Badge>
                  <span className="text-xs text-muted-foreground">{mod.duration}</span>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(mod.id, -1)} disabled={i === 0}>
                      <ChevronUp className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => move(mod.id, 1)} disabled={i === modules.length - 1}>
                      <ChevronDown className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateModule(mod)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeModule(mod.id)}>
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                {expanded && (
                  <div className="mt-3 pt-3 border-t space-y-2">
                    <Input
                      value={mod.title}
                      onChange={(e) => updateModule(mod.id, { title: e.target.value })}
                      placeholder="Module name"
                    />
                    <Textarea
                      value={mod.description || ""}
                      onChange={(e) => updateModule(mod.id, { description: e.target.value })}
                      placeholder="Module description (optional)"
                      rows={2}
                    />
                    <Input
                      value={mod.video_url || ""}
                      onChange={(e) => updateModule(mod.id, { video_url: e.target.value })}
                      onBlur={(e) => {
                        const v = e.target.value.trim();
                        if (!v) return;
                        const { url, error } = normalizeVideoUrl(v);
                        if (error) {
                          toast({ title: error, variant: "destructive" });
                          return;
                        }
                        if (url && url !== v) updateModule(mod.id, { video_url: url });
                      }}
                      placeholder="Video URL (YouTube/Vimeo, optional)"
                    />
                    {(() => {
                      const { url } = normalizeVideoUrl(mod.video_url || "");
                      if (!url) return null;
                      return (
                        <div className="rounded-md overflow-hidden border bg-black aspect-video">
                          <iframe
                            src={url}
                            title={`Preview: ${mod.title}`}
                            className="w-full h-full"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            loading="lazy"
                          />
                        </div>
                      );
                    })()}
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={mod.duration}
                        onChange={(e) => updateModule(mod.id, { duration: e.target.value })}
                        placeholder="Trvanie (napr. 10 min)"
                      />
                      <select
                        value={mod.type}
                        onChange={(e) => updateModule(mod.id, { type: e.target.value })}
                        className="rounded-md border bg-background px-2 text-sm"
                      >
                        <option value="video">Video</option>
                        <option value="document">Document</option>
                        <option value="quiz">Quiz</option>
                      </select>
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>

        <Card className="border-dashed border-2 border-emerald-500/30 mb-4">
          <CardContent className="py-4 px-4">
            <div className="flex gap-2">
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="New module..." className="flex-1 h-10" onKeyDown={e => e.key === "Enter" && addModule()} />
              <select value={newType} onChange={e => setNewType(e.target.value)} className="rounded-md border bg-background px-2 text-sm w-24">
                <option value="video">Video</option>
                <option value="document">Doc</option>
                <option value="quiz">Quiz</option>
              </select>
              <Button onClick={addModule} className="bg-gradient-to-r from-emerald-500 to-teal-600"><Plus className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={() => saveCourse(false)} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Save draft
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => saveCourse(true)} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Publish course
          </Button>
        </div>
      </div>
    </div>
    </>
  );
}
