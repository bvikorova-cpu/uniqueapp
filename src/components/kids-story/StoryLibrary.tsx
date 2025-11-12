import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Download, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import jsPDF from "jspdf";

interface Story {
  id: string;
  title: string;
  characters: string;
  theme: string;
  story_text: string;
  illustration_url: string | null;
  created_at: string;
  updated_at: string;
}

export const StoryLibrary = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStories();
    }
  }, [user]);

  const fetchStories = async () => {
    try {
      const { data, error } = await supabase
        .from('kids_stories')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setStories((data as any) || []);
    } catch (error) {
      console.error('Error fetching stories:', error);
      toast.error("Failed to load stories");
    } finally {
      setLoading(false);
    }
  };

  const deleteStory = async (storyId: string) => {
    try {
      const { error } = await supabase
        .from('kids_stories')
        .delete()
        .eq('id', storyId);

      if (error) throw error;
      
      setStories(stories.filter(s => s.id !== storyId));
      toast.success("Story deleted");
    } catch (error) {
      console.error('Error deleting story:', error);
      toast.error("Failed to delete story");
    }
  };

  const downloadPDF = async (story: Story) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const margin = 20;
      let yPos = 20;

      // Title
      pdf.setFontSize(22);
      pdf.setFont("helvetica", "bold");
      pdf.text(story.title, pageWidth / 2, yPos, { align: "center" });
      yPos += 15;

      // Add illustration if available
      if (story.illustration_url && story.illustration_url.startsWith('data:image')) {
        try {
          pdf.addImage(story.illustration_url, 'PNG', margin, yPos, pageWidth - 2 * margin, 80);
          yPos += 90;
        } catch (imgError) {
          console.error('Error adding image to PDF:', imgError);
        }
      }

      // Story text
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      const lines = pdf.splitTextToSize(story.story_text, pageWidth - 2 * margin);
      
      lines.forEach((line: string) => {
        if (yPos > 270) {
          pdf.addPage();
          yPos = 20;
        }
        pdf.text(line, margin, yPos);
        yPos += 7;
      });

      // Footer
      yPos += 10;
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "italic");
      pdf.text(`Characters: ${story.characters}`, margin, yPos);
      yPos += 6;
      pdf.text(`Theme: ${story.theme}`, margin, yPos);

      pdf.save(`${story.title.replace(/\s+/g, '_')}.pdf`);
      toast.success("PDF downloaded!");
    } catch (error) {
      console.error('Error creating PDF:', error);
      toast.error("Failed to create PDF");
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading your stories...</div>;
  }

  if (stories.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No stories yet. Create your first magical story!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Your Story Library</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {stories.map((story) => (
          <Card key={story.id} className="overflow-hidden">
            {story.illustration_url && (
              <div className="h-48 overflow-hidden bg-muted">
                <img
                  src={story.illustration_url}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <CardHeader>
              <CardTitle className="text-lg">{story.title}</CardTitle>
              <CardDescription>
                {new Date(story.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                {story.story_text}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => downloadPDF(story)}
                  variant="outline"
                  size="sm"
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  onClick={() => deleteStory(story.id)}
                  variant="outline"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
