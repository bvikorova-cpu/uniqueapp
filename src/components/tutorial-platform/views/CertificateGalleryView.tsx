import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Zap, Award, Download } from "lucide-react";

const certificates = [
  { id: 1, course: "Complete Web Development Bootcamp", student: "John Doe", date: "Mar 15, 2026", style: "Classic Academic" },
  { id: 2, course: "Machine Learning Fundamentals", student: "Jane Smith", date: "Mar 20, 2026", style: "Tech Professional" },
  { id: 3, course: "Digital Marketing Mastery", student: "Mike Johnson", date: "Apr 1, 2026", style: "Modern Minimal" },
  { id: 4, course: "UX Design Principles", student: "Sarah Wilson", date: "Apr 3, 2026", style: "Elegant Gold" },
];

interface Props { onBack: () => void; }

export function CertificateGalleryView({ onBack }: Props) {
  return (
    <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <h2 className="text-2xl font-black mb-6 flex items-center gap-2"><Zap className="w-6 h-6 text-yellow-600" />Certificate Gallery</h2>

      <div className="grid md:grid-cols-2 gap-4">
        {certificates.map(cert => (
          <Card key={cert.id} className="overflow-hidden hover:shadow-lg transition-all">
            <div className="h-32 bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-950/30 dark:to-amber-900/20 flex items-center justify-center">
              <Award className="w-16 h-16 text-amber-500/50" />
            </div>
            <CardContent className="pt-4">
              <h3 className="font-semibold mb-1">{cert.course}</h3>
              <p className="text-sm text-muted-foreground">Awarded to: {cert.student}</p>
              <div className="flex items-center gap-2 mt-2 mb-3">
                <Badge variant="outline">{cert.style}</Badge>
                <span className="text-xs text-muted-foreground">{cert.date}</span>
              </div>
              <Button size="sm" variant="outline" className="w-full"><Download className="w-4 h-4 mr-2" />Download</Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
