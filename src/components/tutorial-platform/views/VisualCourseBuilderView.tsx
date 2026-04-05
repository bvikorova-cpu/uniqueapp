import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Palette, Plus, GripVertical, Video, FileText, BookOpen, Trash2, Copy, Clock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface Module {
  id: number;
  title: string;
  type: string;
  duration: string;
}

const initialModules: Module[] = [
  { id: 1, title: "Introduction", type: "video", duration: "5 min" },
  { id: 2, title: "Core Concepts", type: "video", duration: "15 min" },
  { id: 3, title: "Hands-On Exercise", type: "document", duration: "20 min" },
  { id: 4, title: "Quiz: Module 1", type: "quiz", duration: "10 min" },
  { id: 5, title: "Advanced Topics", type: "video", duration: "25 min" },
];

interface Props { onBack: () => void; }

export function VisualCourseBuilderView({ onBack }: Props) {
  const { toast } = useToast();
  const [modules, setModules] = useState<Module[]>(initialModules);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("video");

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
    toast({ title: "Module Added", description: `"${newTitle}" added to course` });
  };

  const removeModule = (id: number) => {
    setModules(prev => prev.filter(m => m.id !== id));
    toast({ title: "Module Removed" });
  };

  const duplicateModule = (mod: Module) => {
    setModules(prev => [...prev, { ...mod, id: Date.now(), title: `${mod.title} (Copy)` }]);
    toast({ title: "Module Duplicated" });
  };

  const totalDuration = modules.reduce((sum, m) => sum + parseInt(m.duration), 0);

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-green-700 flex items-center justify-center shadow-lg">
            <Palette className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-black">Visual Course Builder</h2>
            <p className="text-sm text-muted-foreground">Organize your course structure</p>
          </div>
        </div>

        <div className="flex items-center gap-3 mb-6 ml-[52px]">
          <Badge variant="outline"><BookOpen className="w-3 h-3 mr-1" />{modules.length} modules</Badge>
          <Badge variant="outline"><Clock className="w-3 h-3 mr-1" />{totalDuration} min total</Badge>
        </div>

        <div className="space-y-2 mb-4">
          {modules.map((mod, i) => (
            <Card key={mod.id} className="p-3 hover:shadow-md transition-all group">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                <span className="text-xs font-bold text-muted-foreground w-6">{i + 1}.</span>
                {getIcon(mod.type)}
                <span className="font-semibold flex-1 text-sm">{mod.title}</span>
                <Badge variant="outline" className="text-[10px]">{mod.type}</Badge>
                <span className="text-xs text-muted-foreground">{mod.duration}</span>
                <div className="opacity-0 group-hover:opacity-100 flex gap-1 transition-opacity">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => duplicateModule(mod)}>
                    <Copy className="w-3 h-3" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:text-red-600" onClick={() => removeModule(mod.id)}>
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card className="border-dashed border-2 border-emerald-500/30">
          <CardContent className="py-4 px-4">
            <div className="flex gap-2">
              <Input value={newTitle} onChange={e => setNewTitle(e.target.value)} placeholder="New module title..." className="flex-1 h-10" onKeyDown={e => e.key === "Enter" && addModule()} />
              <select value={newType} onChange={e => setNewType(e.target.value)} className="rounded-md border bg-background px-2 text-sm w-24">
                <option value="video">Video</option>
                <option value="document">Doc</option>
                <option value="quiz">Quiz</option>
              </select>
              <Button onClick={addModule} className="bg-gradient-to-r from-emerald-500 to-teal-600"><Plus className="w-4 h-4" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}