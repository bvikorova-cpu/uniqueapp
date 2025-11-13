import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useKidsDrawingGallery = () => {
  const queryClient = useQueryClient();

  const { data: drawings, isLoading } = useQuery({
    queryKey: ["kids-drawing-gallery"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("kids_drawings")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const saveDrawing = useMutation({
    mutationFn: async ({ 
      imageDataURL, 
      title, 
      stepNumber 
    }: { 
      imageDataURL: string; 
      title: string; 
      stepNumber?: number;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Convert data URL to blob
      const response = await fetch(imageDataURL);
      const blob = await response.blob();

      // Create unique filename
      const fileName = `${user.id}/${Date.now()}.png`;

      // Upload to storage
      const { error: uploadError } = await supabase.storage
        .from("kids-drawings")
        .upload(fileName, blob, {
          contentType: "image/png",
          upsert: false,
        });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("kids-drawings")
        .getPublicUrl(fileName);

      // Save metadata to database
      const { error: dbError } = await supabase
        .from("kids_drawings")
        .insert([{
          user_id: user.id,
          title,
          drawing_url: urlData.publicUrl,
          tutorial_topic: "Custom Drawing",
          steps_completed: stepNumber || 0,
          total_steps: stepNumber || 0,
          difficulty: "custom",
        }]);

      if (dbError) throw dbError;

      return urlData.publicUrl;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kids-drawing-gallery"] });
      toast.success("Drawing saved to gallery! 🎨");
    },
    onError: (error) => {
      console.error("Error saving drawing:", error);
      toast.error("Failed to save drawing");
    },
  });

  const deleteDrawing = useMutation({
    mutationFn: async (drawingId: string) => {
      const drawing = drawings?.find(d => d.id === drawingId);
      if (!drawing) throw new Error("Drawing not found");

      // Extract filename from URL
      const url = new URL(drawing.drawing_url);
      const fileName = url.pathname.split("/kids-drawings/")[1];

      // Delete from storage
      const { error: storageError } = await supabase.storage
        .from("kids-drawings")
        .remove([fileName]);

      if (storageError) throw storageError;

      // Delete from database
      const { error: dbError } = await supabase
        .from("kids_drawings")
        .delete()
        .eq("id", drawingId);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kids-drawing-gallery"] });
      toast.success("Drawing deleted");
    },
    onError: (error) => {
      console.error("Error deleting drawing:", error);
      toast.error("Failed to delete drawing");
    },
  });

  return {
    drawings,
    isLoading,
    saveDrawing: saveDrawing.mutate,
    isSaving: saveDrawing.isPending,
    deleteDrawing: deleteDrawing.mutate,
    isDeleting: deleteDrawing.isPending,
  };
};