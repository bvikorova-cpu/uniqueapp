import { Image as ImageIcon, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaGallery } from "@/hooks/useMediaGallery";

interface MediaGalleryDialogProps {
  userId?: string;
}

export const MediaGalleryDialog = ({ userId }: MediaGalleryDialogProps) => {
  const { photos, videos, albums, isLoading } = useMediaGallery(userId);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="gap-2 border-2 border-violet-600/50 bg-violet-50 dark:bg-violet-950/30 hover:bg-violet-100 dark:hover:bg-violet-900/40 text-violet-700 dark:text-violet-300 hover:shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:border-violet-600 transition-all duration-300 hover:scale-105"
        >
          <ImageIcon className="w-4 h-4 animate-pulse" />
          Media Gallery
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Media Gallery</DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="photos" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="photos" className="gap-2">
              <ImageIcon className="w-4 h-4" />
              Photos ({photos.length})
            </TabsTrigger>
            <TabsTrigger value="videos" className="gap-2">
              <Video className="w-4 h-4" />
              Videos ({videos.length})
            </TabsTrigger>
            <TabsTrigger value="albums">Albums ({albums.length})</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-96 mt-4">
            <TabsContent value="photos">
              <div className="grid grid-cols-3 gap-2">
                {photos.map((photo) => (
                  <div
                    key={photo.id}
                    className="aspect-square rounded-lg overflow-hidden bg-accent cursor-pointer hover:opacity-80 transition-opacity"
                  >
                    <img
                      src={photo.media_url}
                      alt={photo.description || "Photo"}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              {photos.length === 0 && (
                <div className="text-center text-muted-foreground py-8">No photos yet</div>
              )}
            </TabsContent>

            <TabsContent value="videos">
              <div className="grid grid-cols-2 gap-3">
                {videos.map((video) => (
                  <div
                    key={video.id}
                    className="aspect-video rounded-lg overflow-hidden bg-accent"
                  >
                    <video src={video.media_url} controls className="w-full h-full" />
                  </div>
                ))}
              </div>
              {videos.length === 0 && (
                <div className="text-center text-muted-foreground py-8">No videos yet</div>
              )}
            </TabsContent>

            <TabsContent value="albums">
              <div className="space-y-3">
                {albums.map((album) => (
                  <div
                    key={album}
                    className="p-4 border rounded-lg hover:bg-accent cursor-pointer transition-colors"
                  >
                    <h4 className="font-semibold">{album}</h4>
                    <p className="text-sm text-muted-foreground">
                      {photos.filter((p) => p.album_name === album).length} items
                    </p>
                  </div>
                ))}
              </div>
              {albums.length === 0 && (
                <div className="text-center text-muted-foreground py-8">No albums yet</div>
              )}
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
