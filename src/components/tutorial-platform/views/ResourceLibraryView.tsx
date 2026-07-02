import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, BookMarked, Download, FileText, Video, Image, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const resources = [
  { id: 1, title: "Course Slide Template Pack", type: "Template", format: "PPTX", downloads: 1240, icon: FileText, rating: 4.8, free: true },
  { id: 2, title: "Video Intro/Outro Kit", type: "Video", format: "MP4", downloads: 890, icon: Video, rating: 4.6, free: true },
  { id: 3, title: "Thumbnail Design Templates", type: "Graphics", format: "PSD", downloads: 2100, icon: Image, rating: 4.9, free: true },
  { id: 4, title: "Quiz Question Bank (500+)", type: "Document", format: "PDF", downloads: 760, icon: FileText, rating: 4.7, free: false },
  { id: 5, title: "Student Worksheet Templates", type: "Template", format: "DOCX", downloads: 1450, icon: FileText, rating: 4.5, free: true },
  { id: 6, title: "Course Marketing Checklist", type: "Document", format: "PDF", downloads: 980, icon: FileText, rating: 4.8, free: true },
  { id: 7, title: "Certificate Template Pack", type: "Graphics", format: "PSD", downloads: 680, icon: Image, rating: 4.4, free: false },
  { id: 8, title: "Screen Recording Guide", type: "Document", format: "PDF", downloads: 520, icon: FileText, rating: 4.3, free: true },
];

interface Props { onBack: () => void; }

export function ResourceLibraryView({ onBack }: Props) {
  const handleDownload = (res: typeof resources[0]) => {
    if (!res.free) {
      toast.info(`${res.title} is a Premium resource. Subscribe to unlock.`);
      return;
    }
    const content = `${res.title}\nFormat: ${res.format}\nType: ${res.type}\n\nDownloaded from Unique Resource Library.\n`;
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${res.title.replace(/\s+/g, "_")}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloading ${res.title}`);
  };

  return (
    <>
      <FloatingHowItWorks title={"Resource Library View - How it works"} steps={[{ title: 'Open', desc: 'Access the Resource Library View section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Resource Library View.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div>
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="w-4 h-4 mr-2" />Back</Button>
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center shadow-lg">
          <BookMarked className="w-5 h-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-black">Resource Library</h2>
          <p className="text-sm text-muted-foreground">{resources.length} free templates, materials & tools</p>
        </div>
      </div>
      <p className="text-muted-foreground mb-6 ml-[52px]">Everything you need to create professional courses.</p>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-3">
        {resources.map(res => {
          const Icon = res.icon;
          return (
            <Card key={res.id} className="hover:shadow-xl transition-all group overflow-hidden">
              <CardContent className="pt-5 pb-4 px-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5 text-emerald-500" />
                  </div>
                  {res.free ? (
                    <Badge className="bg-emerald-500/10 text-emerald-600 text-[10px]">FREE</Badge>
                  ) : (
                    <Badge className="bg-amber-500/10 text-amber-600 text-[10px]">PREMIUM</Badge>
                  )}
                </div>
                <h3 className="font-bold text-sm mb-1 line-clamp-2">{res.title}</h3>
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="text-[10px] px-1.5">{res.format}</Badge>
                  <div className="flex items-center gap-0.5">
                    <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                    <span className="text-[10px] font-bold">{res.rating}</span>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground mb-3">{res.downloads.toLocaleString()} downloads</p>
                <Button size="sm" className="w-full h-8 text-xs bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700" onClick={() => handleDownload(res)}>
                  <Download className="w-3 h-3 mr-1" />Download
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
    </>
  );
}