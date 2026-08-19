import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Palette, Plus, GripVertical, Video, FileText, BookOpen, Trash2, Copy, Clock, Save, Loader2, ChevronDown, ChevronUp, Upload } from "lucide-react";
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
  content?: string;
  attachment_url?: string;
  attachment_name?: string;
}

const initialModules: Module[] = [
  { id: 1, title: "Introduction", type: "video", duration: "5 min" },
  { id: 2, title: "Core Concepts", type: "video", duration: "15 min" },
  { id: 3, title: "Hands-On Exercise", type: "document", duration: "20 min" },
];

interface Props { onBack: () => void; courseId?: string | null; }

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

  // Uploaded file (Supabase Storage signed/public URL)
  if (parsed.pathname.includes("/storage/v1/object/")) {
    return { url: raw };
  }

  return { url: null, error: "Only YouTube and Vimeo links are supported" };
}

/** True when the URL points to an uploaded video file (not an embed). */
export function isDirectVideoFile(url: string) {
  return url.includes("/storage/v1/object/") || /\.(mp4|webm|mov|m4v)(\?|$)/i.test(url);
}

export function VisualCourseBuilderView({ onBack, courseId }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isEdit = !!courseId;
  const [modules, setModules] = useState<Module[]>(isEdit ? [] : initialModules);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("video");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);
  const [expandedId, setExpandedId] = useState<number | null>(isEdit ? null : (initialModules[0]?.id ?? null));
  const [dragId, setDragId] = useState<number | null>(null);
  const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadingDocId, setUploadingDocId] = useState<number | null>(null);
  const [uploadingHero, setUploadingHero] = useState(false);
  const [heroUrl, setHeroUrl] = useState<string>("");
  const idSeedRef = useRef(0);



  const updateModule = (id: number, patch: Partial<Module>) =>
    setModules(prev => prev.map(m => (m.id === id ? { ...m, ...patch } : m)));

  const MAX_VIDEO_BYTES = 500 * 1024 * 1024; // 500 MB

  const handleVideoUpload = async (moduleId: number, file: File) => {
    if (!file.type.startsWith("video/")) {
      toast({ title: "Please select a video file", variant: "destructive" });
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast({ title: "Video is too large (max 500 MB)", variant: "destructive" });
      return;
    }
    setUploadingId(moduleId);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        toast({ title: "Please sign in to upload videos", variant: "destructive" });
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
      const path = `${auth.user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("course-videos")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;

      // Long-lived signed URL (private bucket)
      const { data: signed, error: signErr } = await supabase.storage
        .from("course-videos")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      if (signErr || !signed?.signedUrl) throw signErr || new Error("Could not create video link");

      updateModule(moduleId, { video_url: signed.signedUrl, type: "video" });
      toast({ title: "Video uploaded ✅" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploadingId(null);
    }
  };

  const MAX_DOC_BYTES = 50 * 1024 * 1024; // 50 MB

  const handleDocUpload = async (moduleId: number, file: File) => {
    if (file.size > MAX_DOC_BYTES) {
      toast({ title: "File is too large (max 50 MB)", variant: "destructive" });
      return;
    }
    setUploadingDocId(moduleId);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        toast({ title: "Please sign in to upload files", variant: "destructive" });
        return;
      }
      const safeName = file.name.replace(/[^A-Za-z0-9._-]/g, "_");
      const path = `${auth.user.id}/${Date.now()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("course-files")
        .upload(path, file, { contentType: file.type || "application/octet-stream", upsert: false });
      if (upErr) throw upErr;

      const { data: signed, error: signErr } = await supabase.storage
        .from("course-files")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      if (signErr || !signed?.signedUrl) throw signErr || new Error("Could not create file link");

      updateModule(moduleId, { attachment_url: signed.signedUrl, attachment_name: file.name });
      toast({ title: "Document uploaded ✅" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploadingDocId(null);
    }
  };

  // Course hero / cover image
  const handleHeroUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast({ title: "Please select an image file", variant: "destructive" });
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast({ title: "Image is too large (max 10 MB)", variant: "destructive" });
      return;
    }
    setUploadingHero(true);
    try {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) {
        toast({ title: "Please sign in to upload images", variant: "destructive" });
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${auth.user.id}/hero-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("course-files")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (upErr) throw upErr;
      const { data: signed, error: signErr } = await supabase.storage
        .from("course-files")
        .createSignedUrl(path, 60 * 60 * 24 * 365 * 5);
      if (signErr || !signed?.signedUrl) throw signErr || new Error("Could not create image link");
      setHeroUrl(signed.signedUrl);
      toast({ title: "Cover image uploaded ✅" });
    } catch (e: any) {
      console.error(e);
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploadingHero(false);
    }
  };



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
  const [wasPublished, setWasPublished] = useState(false);

  // Load existing course when editing
  useEffect(() => {
    if (!courseId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const { data: course, error } = await supabase
          .from("courses")
          .select("*")
          .eq("id", courseId)
          .maybeSingle();
        if (error) throw error;
        if (!course) throw new Error("Course not found");
        const { data: lessons, error: lErr } = await supabase
          .from("course_lessons")
          .select("*")
          .eq("course_id", courseId)
          .order("order_index", { ascending: true });
        if (lErr) throw lErr;
        if (cancelled) return;
        setTitle(course.title || "");
        setDescription(course.description || "");
        setCategory(course.category || "Technology");
        setDifficulty(course.difficulty_level || "beginner");
        setPrice(String(course.price ?? 0));
        setWasPublished(!!course.is_published);
        const mapped: Module[] = (lessons || []).map((l: any, i: number) => ({
          id: Date.now() + i,
          title: l.title || `Module ${i + 1}`,
          type: l.video_url ? "video" : "document",
          duration: `${l.duration_minutes ?? 10} min`,
          description: l.description || undefined,
          video_url: l.video_url || undefined,
          content: l.content || undefined,
          attachment_url: l.attachment_url || undefined,
          attachment_name: l.attachment_name || undefined,
        }));
        setModules(mapped);
        setExpandedId(mapped[0]?.id ?? null);
      } catch (e: any) {
        toast({ title: "Could not load course", description: e.message, variant: "destructive" });
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [courseId]);



  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4 text-rose-500" />;
      case "document": return <FileText className="w-4 h-4 text-blue-500" />;
      case "quiz": return <BookOpen className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  // Always-unique module ids (Date.now() alone can collide and make two
  // modules share state, which leaked uploads between lessons).
  const nextId = () => {
    idSeedRef.current += 1;
    return Date.now() * 1000 + idSeedRef.current;
  };


  const addModule = () => {
    if (!newTitle.trim()) return;
    const id = nextId();
    setModules(prev => [...prev, { id, title: newTitle, type: newType, duration: "10 min" }]);
    setExpandedId(id);
    setNewTitle("");
  };

  const removeModule = (id: number) => setModules(prev => prev.filter(m => m.id !== id));
  // Duplicate structure only — never copy the uploaded video/document of another lesson.
  const duplicateModule = (mod: Module) =>
    setModules(prev => [
      ...prev,
      {
        id: nextId(),
        title: `${mod.title} (Copy)`,
        type: mod.type,
        duration: mod.duration,
        description: mod.description,
        content: mod.content,
        video_url: undefined,
        attachment_url: undefined,
        attachment_name: undefined,
      },
    ]);


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

      const lessonRows: any[] = [];
      for (let i = 0; i < modules.length; i++) {
        const m = modules[i];
        const { url: normalizedUrl, error: urlErr } = normalizeVideoUrl(m.video_url || "");
        if (urlErr) {
          toast({ title: `Module ${i + 1}: ${urlErr}`, variant: "destructive" });
          setSaving(false);
          return;
        }
        lessonRows.push({
          title: m.title,
          description: m.description || null,
          video_url: normalizedUrl,
          content: m.content || null,
          attachment_url: m.attachment_url || null,
          attachment_name: m.attachment_name || null,
          duration_minutes: parseInt(m.duration) || 10,
        });
      }

      // ---- EDIT MODE: update existing course, no credit charge ----
      if (courseId) {
        const { error: upErr } = await supabase
          .from("courses")
          .update({
            title,
            description,
            category,
            difficulty_level: difficulty,
            price: parseFloat(price) || 0,
            duration_minutes: totalDuration,
            total_lessons: modules.length,
            is_published: publish ? true : wasPublished,
          })
          .eq("id", courseId);
        if (upErr) throw upErr;

        const { error: delErr } = await supabase.from("course_lessons").delete().eq("course_id", courseId);
        if (delErr) throw delErr;

        const { error: insErr } = await supabase.from("course_lessons").insert(
          lessonRows.map((m, i) => ({
            course_id: courseId,
            title: m.title,
            description: m.description,
            video_url: m.video_url,
            content: m.content,
            attachment_url: m.attachment_url,
            attachment_name: m.attachment_name,
            duration_minutes: m.duration_minutes,
            order_index: i,
            is_preview: i === 0,
          }))
        );
        if (insErr) throw insErr;

        toast({ title: "Course updated ✅" });
        navigate(`/tutorial-course/${courseId}`);
        return;
      }



      if (publish) {
        const { data, error } = await supabase.functions.invoke("create-course-credits", {
          body: {
            publish: true,
            course: {
              title,
              description,
              category,
              difficulty_level: difficulty,
              price: parseFloat(price) || 0,
              duration_minutes: totalDuration,
              total_lessons: modules.length,
            },
            lessons: lessonRows,
          },
        });

        if (error) {
          const msg = error?.message || "";
          if (/402|insufficient|credits/i.test(msg) || data?.cost) {
            toast({
              title: "Not enough credits",
              description: `Publishing a course costs 15 credits. You have ${data?.credits_remaining ?? 0} credits.`,
              variant: "destructive",
            });
          } else {
            toast({ title: "Publishing failed", description: msg || "Unknown error", variant: "destructive" });
          }
          setSaving(false);
          return;
        }

        if (data?.error) {
          toast({ title: "Publishing failed", description: data.error, variant: "destructive" });
          setSaving(false);
          return;
        }

        toast({ title: "Course published 🎉", description: `15 credits used. Remaining: ${data?.credits_remaining ?? 0}` });
        navigate(`/tutorial-course/${data.courseId}`);
        return;
      }

      // Draft save – no credit charge
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
          is_published: false,
        })
        .select()
        .single();

      if (courseErr) throw courseErr;

      const fullLessonRows = lessonRows.map((m, i) => ({
        course_id: course.id,
        title: m.title,
        description: m.description,
        video_url: m.video_url,
        content: m.content,
        attachment_url: m.attachment_url,
        attachment_name: m.attachment_name,
        duration_minutes: m.duration_minutes,
        order_index: i,
        is_preview: i === 0,
      }));
      const { error: lessonsErr } = await supabase.from("course_lessons").insert(fullLessonRows);
      if (lessonsErr) throw lessonsErr;

      toast({ title: "Course saved as draft" });
      navigate(`/tutorial-course/${course.id}`);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Error saving", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
        <div className="py-20 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>
      </div>
    );
  }

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
            <h2 className="text-2xl font-black">{isEdit ? "Edit Course" : "Visual Course Builder"}</h2>
            <p className="text-sm text-muted-foreground">
              {isEdit ? "Update your course details, modules and files — editing is free" : "Create and publish your course"}
            </p>
          </div>
        </div>


        <Card className="p-4 mb-4 space-y-3">
          <Input placeholder="Course name *" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Course description *" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="Category" value={category} onChange={e => setCategory(e.target.value)} />
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="rounded-md border bg-background px-2 text-sm">
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <Input type="number" step="0.01" placeholder="Price €" value={price} onChange={e => setPrice(e.target.value)} />
          </div>
        </Card>

        <div className="flex items-center gap-3 mb-2">
          <Badge variant="outline"><BookOpen className="w-3 h-3 mr-1" />{modules.length} modules</Badge>
          <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{totalDuration} min</Badge>
        </div>
        <p className="text-xs text-muted-foreground mb-4">
          Click a module to expand it. Inside you can write lesson text, upload a video from your device, and attach documents (PDF, DOC, images, etc.).
        </p>

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
                    <div className="flex items-center gap-2">
                      <input
                        id={`video-file-${mod.id}`}
                        type="file"
                        accept="video/mp4,video/webm,video/quicktime,video/*"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) handleVideoUpload(mod.id, f);
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={uploadingId === mod.id}
                        onClick={() => document.getElementById(`video-file-${mod.id}`)?.click()}
                      >
                        {uploadingId === mod.id ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading…</>
                        ) : (
                          <><Upload className="w-4 h-4 mr-2" />Upload video from device</>
                        )}
                      </Button>
                      <span className="text-xs text-muted-foreground">MP4/WebM/MOV, max 500 MB</span>
                    </div>
                    {(() => {
                      const { url } = normalizeVideoUrl(mod.video_url || "");
                      if (!url) return null;
                      if (isDirectVideoFile(url)) {
                        return (
                          <div className="rounded-md overflow-hidden border bg-black aspect-video">
                            <video src={url} controls className="w-full h-full" preload="metadata" />
                          </div>
                        );
                      }
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

                    <Textarea
                      value={mod.content || ""}
                      onChange={(e) => updateModule(mod.id, { content: e.target.value })}
                      placeholder="Lesson text / notes (optional) — students see this in the lesson"
                      rows={4}
                    />

                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        id={`doc-file-${mod.id}`}
                        type="file"
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.txt,.zip,image/*,application/pdf"
                        className="hidden"
                        onChange={(e) => {
                          const f = e.target.files?.[0];
                          e.target.value = "";
                          if (f) handleDocUpload(mod.id, f);
                        }}
                      />
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        disabled={uploadingDocId === mod.id}
                        onClick={() => document.getElementById(`doc-file-${mod.id}`)?.click()}
                      >
                        {uploadingDocId === mod.id ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Uploading…</>
                        ) : (
                          <><FileText className="w-4 h-4 mr-2" />Upload document</>
                        )}
                      </Button>
                      <span className="text-xs text-muted-foreground">PDF/DOC/PPT/XLS/TXT/ZIP/image, max 50 MB</span>
                    </div>
                    {mod.attachment_url && (
                      <div className="flex items-center justify-between gap-2 rounded-md border bg-muted/40 px-3 py-2">
                        <a
                          href={mod.attachment_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm underline truncate"
                        >
                          {mod.attachment_name || "Attached document"}
                        </a>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-red-500"
                          onClick={() => updateModule(mod.id, { attachment_url: undefined, attachment_name: undefined })}
                        >
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        value={mod.duration}
                        onChange={(e) => updateModule(mod.id, { duration: e.target.value })}
                        placeholder="Duration (e.g. 10 min)"
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

        <div className="space-y-2">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={() => saveCourse(false)} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
              Save draft
            </Button>
            <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => saveCourse(true)} disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Publish course
              <span className="ml-2 inline-flex items-center rounded-full bg-white/20 px-2 py-0.5 text-[10px] font-bold">15 CR</span>
            </Button>
          </div>
          <p className="text-center text-xs text-muted-foreground">
            Publishing a course costs <span className="font-semibold text-primary">15 credits</span>. Saving a draft is free.
          </p>
        </div>
      </div>
    </div>
    </>
  );
}
