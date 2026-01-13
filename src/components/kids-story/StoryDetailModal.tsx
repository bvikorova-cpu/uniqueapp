import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Download, X, BookOpen, Users, MapPin, Calendar } from "lucide-react";
import jsPDF from "jspdf";
import { toast } from "sonner";

interface Story {
  id: string;
  title: string;
  characters: string;
  theme: string;
  category: string;
  story_text: string;
  illustration_url: string | null;
  created_at: string;
}

interface StoryDetailModalProps {
  story: Story | null;
  isOpen: boolean;
  onClose: () => void;
}

const CATEGORIES: Record<string, { label: string; emoji: string; color: string }> = {
  adventure: { label: "Adventure", emoji: "🗺️", color: "bg-orange-100 text-orange-800 border-orange-300" },
  fantasy: { label: "Fantasy", emoji: "✨", color: "bg-purple-100 text-purple-800 border-purple-300" },
  educational: { label: "Educational", emoji: "📚", color: "bg-blue-100 text-blue-800 border-blue-300" },
  mystery: { label: "Mystery", emoji: "🔍", color: "bg-gray-100 text-gray-800 border-gray-300" },
  friendship: { label: "Friendship", emoji: "🤝", color: "bg-pink-100 text-pink-800 border-pink-300" },
  animal: { label: "Animal", emoji: "🐾", color: "bg-green-100 text-green-800 border-green-300" },
  space: { label: "Space", emoji: "🚀", color: "bg-indigo-100 text-indigo-800 border-indigo-300" },
  "fairy-tale": { label: "Fairy Tale", emoji: "👑", color: "bg-yellow-100 text-yellow-800 border-yellow-300" },
};

export const StoryDetailModal = ({ story, isOpen, onClose }: StoryDetailModalProps) => {
  if (!story) return null;

  const categoryInfo = CATEGORIES[story.category] || CATEGORIES.adventure;

  const downloadPDF = async () => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = 20;

      // Title
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      const titleLines = pdf.splitTextToSize(story.title, pageWidth - 2 * margin);
      titleLines.forEach((line: string) => {
        pdf.text(line, pageWidth / 2, yPos, { align: "center" });
        yPos += 10;
      });
      yPos += 5;

      // Category badge
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${categoryInfo.emoji} ${categoryInfo.label}`, pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      // Add illustration if available
      if (story.illustration_url && story.illustration_url.startsWith('data:image')) {
        try {
          const imgWidth = pageWidth - 2 * margin;
          const imgHeight = 80;
          pdf.addImage(story.illustration_url, 'PNG', margin, yPos, imgWidth, imgHeight);
          yPos += imgHeight + 10;
        } catch (imgError) {
          console.error('Error adding image to PDF:', imgError);
        }
      }

      // Story text
      pdf.setFontSize(11);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(story.story_text, pageWidth - 2 * margin);
      
      lines.forEach((line: string) => {
        if (yPos > pageHeight - 40) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(line, margin, yPos);
        yPos += 6;
      });

      // Footer with meta info
      yPos += 15;
      if (yPos > pageHeight - 50) {
        pdf.addPage();
        yPos = 20;
      }

      // Draw separator
      pdf.setDrawColor(200, 200, 200);
      pdf.line(margin, yPos, pageWidth - margin, yPos);
      yPos += 10;

      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text("Story Details", margin, yPos);
      yPos += 8;

      pdf.setFont("helvetica", "normal");
      pdf.text(`Characters: ${story.characters}`, margin, yPos);
      yPos += 6;
      pdf.text(`Theme/Setting: ${story.theme}`, margin, yPos);
      yPos += 6;
      pdf.text(`Category: ${categoryInfo.label}`, margin, yPos);
      yPos += 6;
      pdf.text(`Created: ${new Date(story.created_at).toLocaleDateString()}`, margin, yPos);

      // Footer
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.text("Created with AI Story Creator ✨", pageWidth / 2, pageHeight - 10, { align: "center" });

      pdf.save(`${story.title.replace(/\s+/g, '_')}.pdf`);
      toast.success("PDF downloaded!");
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast.error("Failed to create PDF");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <DialogTitle className="text-2xl font-bold flex items-center gap-3">
                <BookOpen className="h-6 w-6 text-primary" />
                {story.title}
              </DialogTitle>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <Badge className={`${categoryInfo.color} border`}>
                  {categoryInfo.emoji} {categoryInfo.label}
                </Badge>
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {new Date(story.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="p-6 pt-4 space-y-6">
            {/* Illustration */}
            {story.illustration_url && (
              <div className="rounded-xl overflow-hidden shadow-lg">
                <img
                  src={story.illustration_url}
                  alt={story.title}
                  className="w-full h-auto max-h-[400px] object-contain bg-muted"
                />
              </div>
            )}

            {/* Story Text */}
            <div className="prose prose-lg max-w-none">
              <p className="text-foreground/90 whitespace-pre-wrap leading-relaxed text-base">
                {story.story_text}
              </p>
            </div>

            {/* Meta Info */}
            <div className="grid gap-4 sm:grid-cols-2 bg-muted/50 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Characters</p>
                  <p className="text-sm text-muted-foreground">{story.characters}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium text-sm">Theme / Setting</p>
                  <p className="text-sm text-muted-foreground">{story.theme}</p>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        <div className="p-6 pt-0 flex gap-3">
          <Button onClick={downloadPDF} className="flex-1">
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-2" />
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
