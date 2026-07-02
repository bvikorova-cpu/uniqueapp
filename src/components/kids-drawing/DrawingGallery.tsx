import { Image, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useKidsDrawingGallery } from "@/hooks/useKidsDrawingGallery";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

export const DrawingGallery = () => {
  const { drawings, isLoading, deleteDrawing, isDeleting } = useKidsDrawingGallery();

  if (isLoading) {
    return (
    <>
      <FloatingHowItWorks title={"Drawing Gallery - How it works"} steps={[{ title: 'Open', desc: 'Access the Drawing Gallery section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Drawing Gallery.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card>
        <CardContent className="py-8 flex justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    </>
  );
  }

  if (!drawings || drawings.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            My Drawing Gallery
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center py-8 text-muted-foreground">
          <p>No saved drawings yet. Save your drawings to see them here! 🎨</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          My Drawing Gallery ({drawings.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {drawings.map((drawing) => (
            <div key={drawing.id} className="relative group">
              <Card className="overflow-hidden">
                <div className="aspect-video relative bg-muted">
                  <img
                    src={drawing.drawing_url}
                    alt={drawing.title}
                    className="object-contain w-full h-full"
                  />
                </div>
                <div className="p-3">
                  <h3 className="font-semibold text-sm truncate">{drawing.title}</h3>
                  <p className="text-xs text-muted-foreground">
                    {new Date(drawing.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="icon"
                        className="h-8 w-8"
                        disabled={isDeleting}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Drawing?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete "{drawing.title}"? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteDrawing(drawing.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </Card>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};