import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { BookOpen, Download, Trash2, Eye, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import jsPDF from "jspdf";
import { StoryDetailModal } from "./StoryDetailModal";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface Story {
  id: string;
  title: string;
  characters: string;
  theme: string;
  category: string;
  story_text: string;
  illustration_url: string | null;
  created_at: string;
  updated_at: string;
}

const CATEGORIES = [
  { value: "all", label: "All Stories", emoji: "📚" },
  { value: "adventure", label: "Adventure", emoji: "🗺️" },
  { value: "fantasy", label: "Fantasy", emoji: "✨" },
  { value: "educational", label: "Educational", emoji: "📚" },
  { value: "mystery", label: "Mystery", emoji: "🔍" },
  { value: "friendship", label: "Friendship", emoji: "🤝" },
  { value: "animal", label: "Animal", emoji: "🐾" },
  { value: "space", label: "Space", emoji: "🚀" },
  { value: "fairy-tale", label: "Fairy Tale", emoji: "👑" },
];

const CATEGORY_COLORS: Record<string, string> = {
  adventure: "bg-orange-100 text-orange-800 border-orange-300",
  fantasy: "bg-purple-100 text-purple-800 border-purple-300",
  educational: "bg-blue-100 text-blue-800 border-blue-300",
  mystery: "bg-gray-100 text-gray-800 border-gray-300",
  friendship: "bg-pink-100 text-pink-800 border-pink-300",
  animal: "bg-green-100 text-green-800 border-green-300",
  space: "bg-indigo-100 text-indigo-800 border-indigo-300",
  "fairy-tale": "bg-yellow-100 text-yellow-800 border-yellow-300",
};

export const StoryLibrary = () => {
  const { user } = useAuth();
  const [stories, setStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);
  const [storyToDelete, setStoryToDelete] = useState<Story | null>(null);

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
    } finally {
      setStoryToDelete(null);
    }
  };

  const downloadPDF = async (story: Story) => {
    try {
      const pdf = new jsPDF();
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      let yPos = 20;

      const categoryInfo = CATEGORIES.find(c => c.value === story.category);

      // Title
      pdf.setFontSize(24);
      pdf.setFont("helvetica", "bold");
      const titleLines = pdf.splitTextToSize(story.title, pageWidth - 2 * margin);
      titleLines.forEach((line: string) => {
        pdf.text(line, pageWidth / 2, yPos, { align: "center" });
        yPos += 10;
      });
      yPos += 5;

      // Category
      pdf.setFontSize(12);
      pdf.setFont("helvetica", "normal");
      pdf.text(`${categoryInfo?.emoji || "📖"} ${categoryInfo?.label || story.category}`, pageWidth / 2, yPos, { align: "center" });
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

  if (loading) {
    return <div className="text-center py-8">Loading your stories...</div>;
  }

  const filteredStories = selectedCategory === "all" 
    ? stories 
    : stories.filter(story => story.category === selectedCategory);

  // Count stories per category
  const categoryCounts = stories.reduce((acc, story) => {
    acc[story.category] = (acc[story.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (stories.length === 0) {
    return (
    <>
      <FloatingHowItWorks title={"Story Library - How it works"} steps={[{ title: 'Open', desc: 'Access the Story Library section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Story Library.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
        <CardContent className="py-8 text-center">
          <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No stories yet. Create your first magical story!</p>
        </CardContent>
      </Card>
    </>
  );
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Your Story Library</h2>
          <Badge variant="outline" className="text-sm">
            {stories.length} {stories.length === 1 ? 'story' : 'stories'}
          </Badge>
        </div>
        
        <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-9 h-auto gap-1">
            {CATEGORIES.map((cat) => (
              <TabsTrigger 
                key={cat.value} 
                value={cat.value}
                className="text-xs sm:text-sm relative"
              >
                <span className="mr-1">{cat.emoji}</span>
                <span className="hidden sm:inline">{cat.label}</span>
                {cat.value !== "all" && categoryCounts[cat.value] && (
                  <span className="ml-1 text-[10px] opacity-70">
                    ({categoryCounts[cat.value]})
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {filteredStories.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">No stories in this category yet.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredStories.map((story) => {
            const categoryInfo = CATEGORIES.find(c => c.value === story.category);
            return (
              <Card 
                key={story.id} 
                className="overflow-hidden group hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => setSelectedStory(story)}
              >
                {story.illustration_url && (
                  <div className="h-40 overflow-hidden bg-muted relative">
                    <img
                      src={story.illustration_url}
                      alt={story.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                      <Eye className="h-8 w-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" />
                    </div>
                  </div>
                )}
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-base line-clamp-1 flex-1">{story.title}</CardTitle>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={`text-xs ${CATEGORY_COLORS[story.category] || ''} border`}>
                      {categoryInfo?.emoji} {categoryInfo?.label}
                    </Badge>
                    <CardDescription className="text-xs">
                      {new Date(story.created_at).toLocaleDateString()}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                    {story.story_text}
                  </p>
                  <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                    <Button
                      onClick={() => downloadPDF(story)}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="h-3.5 w-3.5 mr-1.5" />
                      PDF
                    </Button>
                    <Button
                      onClick={() => setStoryToDelete(story)}
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Story Detail Modal */}
      <StoryDetailModal
        story={selectedStory}
        isOpen={!!selectedStory}
        onClose={() => setSelectedStory(null)}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!storyToDelete} onOpenChange={() => setStoryToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Delete Story?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{storyToDelete?.title}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => storyToDelete && deleteStory(storyToDelete.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
