import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Zap, Award, Download, Star, Eye } from "lucide-react";
import { toast } from "sonner";

const certificates = [
  { id: 1, course: "Complete Web Development Bootcamp", student: "John Doe", date: "Mar 15, 2026", style: "Classic Academic", views: 234 },
  { id: 2, course: "Machine Learning Fundamentals", student: "Jane Smith", date: "Mar 20, 2026", style: "Tech Professional", views: 189 },
  { id: 3, course: "Digital Marketing Mastery", student: "Mike Johnson", date: "Apr 1, 2026", style: "Modern Minimal", views: 156 },
  { id: 4, course: "UX Design Principles", student: "Sarah Wilson", date: "Apr 3, 2026", style: "Elegant Gold", views: 312 },
  { id: 5, course: "Data Science with Python", student: "Alex Chen", date: "Apr 4, 2026", style: "Classic Academic", views: 98 },
  { id: 6, course: "Business Strategy", student: "Lisa Park", date: "Apr 5, 2026", style: "Tech Professional", views: 67 },
];

interface Props { onBack: () => void; }

const styleColors: Record<string, string> = {
  "Classic Academic": "from-amber-500/20 to-amber-600/5",
  "Tech Professional": "from-blue-500/20 to-indigo-600/5",
  "Modern Minimal": "from-slate-500/20 to-gray-600/5",
  "Elegant Gold": "from-yellow-500/20 to-amber-600/5",
};

export function CertificateGalleryView({ onBack }: Props) {
  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
          <Zap className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Certificate Gallery</h2>
          <p className="text-sm text-muted-foreground">{certificates.length} certificates issued</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {certificates.map(cert => (
          <Card key={cert.id} className="overflow-hidden hover:shadow-xl transition-all group">
            <div className={`h-36 bg-gradient-to-br ${styleColors[cert.style] || "from-amber-500/20 to-amber-600/5"} flex items-center justify-center relative`}>
              <Award className="w-16 h-16 text-amber-500/30 group-hover:scale-110 transition-transform" />
              <div className="absolute top-2 right-2 flex items-center gap-1 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm rounded-full px-2 py-1">
                <Eye className="w-3 h-3" />{cert.views}
              </div>
            </div>
            <CardContent className="pt-4">
              <h3 className="font-bold text-sm mb-1 line-clamp-1">{cert.course}</h3>
              <p className="text-sm text-muted-foreground">Awarded to: <strong>{cert.student}</strong></p>
              <div className="flex items-center gap-2 mt-2 mb-3">
                <Badge variant="outline" className="text-[10px]">{cert.style}</Badge>
                <span className="text-xs text-muted-foreground">{cert.date}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full h-8 text-xs" onClick={() => toast.info("Download Certificate — coming soon")}>
                <Download className="w-3 h-3 mr-1" />Download Certificate
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}