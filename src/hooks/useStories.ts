import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { trackChallengeAction } from "@/lib/trackChallenge";

const SUPABASE_URL = "https://jufrdzeonywluwutvyxz.supabase.co";
const STORAGE_BUCKET = "media";

async function uploadWithProgress(
  path: string,
  file: File,
  onProgress?: (pct: number) => void,
): Promise<void> {
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const url = `${SUPABASE_URL}/storage/v1/object/${STORAGE_BUCKET}/${path}`;

  await new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("x-upsert", "false");
    xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable && onProgress) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else {
        let msg = `Upload failed (${xhr.status})`;
        try {
          const j = JSON.parse(xhr.responseText);
          if (j?.message) msg = j.message;
        } catch {}
        reject(new Error(msg));
      }
    };
    xhr.onerror = () => reject(new Error("Network error during upload"));
    xhr.send(file);
  });
}

export const useStories = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: stories, isLoading } = useQuery({
    queryKey: ["stories"],
    queryFn: async () => {
      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from("stories")
        .select("*")
        .gt("expires_at", now)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = Array.from(new Set((data || []).map((s) => s.user_id)));
      if (userIds.length === 0) return [];

      const { data: profiles } = await (supabase as any)
        .from("public_profiles")
        .select("id,full_name,username,avatar_url")
        .in("id", userIds);

      const profileMap = new Map<string, any>((profiles || []).map((p: any) => [p.id, p]));
      return (data || []).map((story) => ({
        ...story,
        profiles: profileMap.get(story.user_id) ?? null,
      }));
    },
  });

  const createStory = useMutation({
    mutationFn: async ({
      mediaFile,
      caption,
      onProgress,
    }: {
      mediaFile: File;
      caption?: string;
      onProgress?: (pct: number) => void;
    }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = mediaFile.name.split(".").pop() || "bin";
      const fileName = `${user.id}/stories/${Date.now()}.${fileExt}`;
      const mediaType: "image" | "video" =
        mediaFile.type.startsWith("video/") ? "video" : "image";

      await uploadWithProgress(fileName, mediaFile, onProgress);

      const { data: { publicUrl } } = supabase.storage
        .from(STORAGE_BUCKET)
        .getPublicUrl(fileName);

      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24);

      const { error } = await supabase.from("stories").insert({
        user_id: user.id,
        media_url: publicUrl,
        media_type: mediaType,
        caption,
        expires_at: expiresAt.toISOString(),
      });

      if (error) throw error;

      await trackChallengeAction("story", 15);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["tiktok-feed"] });
      toast({ title: "Story created!", description: "+15 XP earned" });
    },
    onError: (err: any) => {
      const msg = err?.message || "Could not create story";
      const friendly = /exceeded the maximum allowed size|413/i.test(msg)
        ? "File too large. Try a smaller file."
        : msg;
      toast({ title: "Story upload failed", description: friendly, variant: "destructive" });
    },
  });

  const deleteStory = useMutation({
    mutationFn: async (story: { id: string; media_url?: string | null; storage_path?: string | null }) => {
      // Best-effort storage cleanup
      let path = (story as any).storage_path as string | null | undefined;
      if (!path && story.media_url) {
        const marker = `/storage/v1/object/public/${STORAGE_BUCKET}/`;
        const idx = story.media_url.indexOf(marker);
        if (idx >= 0) path = decodeURIComponent(story.media_url.slice(idx + marker.length));
      }
      if (path) {
        await supabase.storage.from(STORAGE_BUCKET).remove([path]).catch(() => {});
      }
      const { error } = await supabase.from("stories").delete().eq("id", story.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stories"] });
      queryClient.invalidateQueries({ queryKey: ["tiktok-feed"] });
      toast({ title: "Story deleted" });
    },
    onError: (err: any) => {
      toast({ title: "Could not delete", description: err?.message ?? "Try again", variant: "destructive" });
    },
  });

  const viewStory = useMutation({
    mutationFn: async (storyId: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      await supabase.from("story_views").insert({
        story_id: storyId,
        user_id: user.id,
      });
    },
  });

  return {
    stories: stories || [],
    isLoading,
    createStory: createStory.mutate,
    createStoryAsync: createStory.mutateAsync,
    isCreating: createStory.isPending,
    deleteStory: deleteStory.mutate,
    isDeleting: deleteStory.isPending,
    viewStory: viewStory.mutate,
  };
};
