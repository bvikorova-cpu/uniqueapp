import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookMarked, Download, FileText, Video, Image } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const resources = [
  { id: 1, title: "Course Slide Template Pack", type: "Template", format: "PPTX", downloads: 1240, icon: FileText },
  { id: 2, title: "Video Intro/Outro Kit", type: "Video", format: "MP4", downloads: 890, icon: Video },
  { id: 3, title: "Thumbnail Design Templates", type: "Graphics", format: "PSD", downloads: 2100, icon: Image },
  { id: 4, title: "Quiz Question Bank (500+)", type: "Document", format: "PDF", downloads: 760, icon: FileText },
  { id: 5, title: "Student Worksheet Templates", type: "Template", format: "DOCX", downloads: 1450, icon: FileText },
  { id: 6, title: "Course Marketing Checklist", type: "Document", format: "PDF", downloads: 980, icon: FileText },
];

interface Props { onBack: () => void; }

export function ResourceLibraryView({ onBack }: Props) {
  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><BookMarked className="w-6 h-6 text-lime-500" />Resource Library</h2>
      <p className="text-muted-foreground mb-6">Free templates, materials, and tools for course creators.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resources.map(res => {
          const Icon = res.icon;
          return (
            <Card key={res.id} className="hover:shadow-lg transition-all">
              <CardContent className="pt-6">
                <Icon className="w-10 h-10 text-emerald-500 mb-3" />
                <h3 className="font-semibold mb-1">{res.title}</h3>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline">{res.type}</Badge>
                  <Badge variant="outline">{res.format}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-3">{res.downloads.toLocaleString()} downloads</p>
                <Button size="sm" className="w-full"><Download className="w-4 h-4 mr-2" />Download</Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
