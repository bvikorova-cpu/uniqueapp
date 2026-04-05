import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Palette, Plus, GripVertical, Video, FileText, BookOpen } from "lucide-react";

const mockModules = [
  { id: 1, title: "Introduction", type: "video", duration: "5 min" },
  { id: 2, title: "Core Concepts", type: "video", duration: "15 min" },
  { id: 3, title: "Hands-On Exercise", type: "document", duration: "20 min" },
  { id: 4, title: "Quiz: Module 1", type: "quiz", duration: "10 min" },
  { id: 5, title: "Advanced Topics", type: "video", duration: "25 min" },
];

interface Props { onBack: () => void; }

export function VisualCourseBuilderView({ onBack }: Props) {
  const getIcon = (type: string) => {
    switch (type) {
      case "video": return <Video className="w-4 h-4 text-rose-500" />;
      case "document": return <FileText className="w-4 h-4 text-blue-500" />;
      case "quiz": return <BookOpen className="w-4 h-4 text-purple-500" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="max-w-3xl mx-auto">
        <h2 className="text-2xl font-black mb-2 flex items-center gap-2"><Palette className="w-6 h-6 text-emerald-600" />Visual Course Builder</h2>
        <p className="text-muted-foreground mb-6">Drag and drop to organize your course structure.</p>

        <div className="space-y-2 mb-6">
          {mockModules.map(mod => (
            <Card key={mod.id} className="p-3 hover:shadow-md transition-all cursor-grab">
              <div className="flex items-center gap-3">
                <GripVertical className="w-4 h-4 text-muted-foreground" />
                {getIcon(mod.type)}
                <span className="font-medium flex-1">{mod.title}</span>
                <span className="text-xs text-muted-foreground">{mod.duration}</span>
              </div>
            </Card>
          ))}
        </div>

        <Button variant="outline" className="w-full"><Plus className="w-4 h-4 mr-2" />Add Module</Button>
      </div>
    </div>
  );
}
