import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Download, Trash2, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import AddColoringPageDialog from "./AddColoringPageDialog";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface ColoringPage {
  id: string;
  title: string;
  image_url: string;
  created_at: string;
}

interface CollectionColoringPagesProps {
  collectionId: string;
  collectionName: string;
}

export default function CollectionColoringPages({
  collectionId,
  collectionName
}: CollectionColoringPagesProps) {
  const [pages, setPages] = useState<ColoringPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);

  useEffect(() => {
    loadPages();
  }, [collectionId]);

  const loadPages = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('teacher_coloring_pages')
        .select('*')
        .eq('collection_id', collectionId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPages(data || []);
    } catch (error: any) {
      console.error("Error loading pages:", error);
      toast.error("Failed to load coloring pages");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (imageUrl: string, title: string) => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `${title}.png`;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Download started");
  };

  const handleDelete = async (pageId: string) => {
    if (!confirm("Are you sure you want to delete this coloring page?")) return;

    try {
      const { error } = await supabase
        .from('teacher_coloring_pages')
        .delete()
        .eq('id', pageId);

      if (error) throw error;

      setPages(pages.filter(p => p.id !== pageId));
      toast.success("Coloring page deleted");
    } catch (error: any) {
      console.error("Error deleting page:", error);
      toast.error("Failed to delete coloring page");
    }
  };

  if (loading) {
    return (
    <>
      <FloatingHowItWorks title={"Collection Coloring Pages - How it works"} steps={[{ title: 'Open', desc: 'Access the Collection Coloring Pages section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Collection Coloring Pages.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </>
  );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">{collectionName}</h3>
          <p className="text-sm text-muted-foreground">{pages.length} coloring pages</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Coloring Page
        </Button>
      </div>

      {pages.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ImageIcon className="w-12 h-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">No coloring pages yet</p>
            <Button onClick={() => setShowAddDialog(true)} variant="outline">
              <Plus className="w-4 h-4 mr-2" />
              Create Your First Page
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {pages.map((page) => (
            <Card key={page.id} className="overflow-hidden">
              <div className="aspect-square bg-muted relative">
                <img
                  src={page.image_url}
                  alt={page.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">{page.title}</CardTitle>
                <p className="text-xs text-muted-foreground">
                  {new Date(page.created_at).toLocaleDateString()}
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    onClick={() => handleDownload(page.image_url, page.title)}
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(page.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AddColoringPageDialog
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
        collectionId={collectionId}
        onSuccess={loadPages}
      />
    </div>
  );
}
