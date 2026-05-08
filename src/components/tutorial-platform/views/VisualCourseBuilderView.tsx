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

export function VisualCourseBuilderView({ onBack }: Props) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("video");
  const [saving, setSaving] = useState(false);

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
      toast({ title: "Vyplň názov a popis", variant: "destructive" });
      return;
    }
    if (modules.length === 0) {
      toast({ title: "Pridaj aspoň jeden modul", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({ title: "Musíš byť prihlásený", variant: "destructive" });
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

      const lessonRows = modules.map((m, i) => ({
        course_id: course.id,
        title: m.title,
        description: m.description || null,
        video_url: m.video_url || null,
        duration_minutes: parseInt(m.duration) || 10,
        order_index: i,
        is_preview: i === 0,
      }));
      const { error: lessonsErr } = await supabase.from("course_lessons").insert(lessonRows);
      if (lessonsErr) throw lessonsErr;

      toast({ title: publish ? "Kurz publikovaný 🎉" : "Kurz uložený ako koncept" });
      navigate(`/tutorial-course/${course.id}`);
    } catch (e: any) {
      console.error(e);
      toast({ title: "Chyba pri ukladaní", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Visual Course Builder</h2>
            <p className="text-sm text-muted-foreground">Vytvor a publikuj svoj kurz</p>
          </div>
        </div>

        <Card className="p-4 mb-4 space-y-3">
          <Input placeholder="Názov kurzu *" value={title} onChange={e => setTitle(e.target.value)} />
          <Textarea placeholder="Popis kurzu *" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
          <div className="grid grid-cols-3 gap-2">
            <Input placeholder="Kategória" value={category} onChange={e => setCategory(e.target.value)} />
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
          {modules.map((mod, i) => (
            <Card key={mod.id} className="p-3 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs font-bold text-muted-foreground w-6">{i + 1}.</span>
                {getIcon(mod.type)}
                <span className="font-semibold flex-1 text-sm">{mod.title}</span>
                <Badge variant="outline" className="text-[10px]">{mod.type}</Badge>
                <span className="text-xs text-muted-foreground">{mod.duration}</span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateModule(mod)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500" onClick={() => removeModule(mod.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="border-dashed border-2 border-emerald-500/30 mb-4">
          <CardContent className="py-4 px-4">
            <div className="flex gap-2">
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="Nový modul..." className="flex-1 h-10" onKeyDown={e => e.key === "Enter" && addModule()} />
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
            Uložiť koncept
          </Button>
          <Button className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600" onClick={() => saveCourse(true)} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
            Publikovať kurz
          </Button>
        </div>
      </div>
    </div>
  );
}
