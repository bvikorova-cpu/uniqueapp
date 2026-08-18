import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ImagePlus, Loader2, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const CHAT_MEDIA_BUCKET = "chat-media";
const MAX_BYTES = 25 * 1024 * 1024;

/** Uploads an image/video to the private chat bucket and returns its storage path. */
export async function uploadChatMedia(file: File, userId: string): Promise<string> {
  const isImage = file.type.startsWith("image/");
  const isVideo = file.type.startsWith("video/");
  if (!isImage && !isVideo) throw new Error("Only images and videos can be sent");
  if (file.size > MAX_BYTES) throw new Error("File is too large (max 25 MB)");
  const ext = file.name.split(".").pop()?.toLowerCase() || (isImage ? "jpg" : "mp4");
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(CHAT_MEDIA_BUCKET).upload(path, file, {
    contentType: file.type,
    upsert: false,
  });
  if (error) throw error;
  return path;
}

/** Renders an inline image/video attachment from a private storage path. */
export function ChatAttachmentView({ path, type }: { path: string; type?: string | null }) {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    supabase.storage
      .from(CHAT_MEDIA_BUCKET)
      .createSignedUrl(path, 60 * 60)
      .then(({ data }) => {
        if (!cancelled) setUrl(data?.signedUrl ?? null);
      });
    return () => {
      cancelled = true;
    };
  }, [path]);

  if (!url) {
    return (
      <div className="flex h-24 w-40 items-center justify-center rounded-lg bg-background/40">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  if (type?.startsWith("video/")) {
    return <video src={url} controls className="mt-1 max-h-64 w-full rounded-lg" />;
  }

  return (
    <a href={url} target="_blank" rel="noreferrer">
      <img src={url} alt="Chat attachment" loading="lazy" className="mt-1 max-h-64 rounded-lg object-cover" />
    </a>
  );
}

interface PickerProps {
  file: File | null;
  onFileChange: (f: File | null) => void;
  disabled?: boolean;
}

/** Attach button + selected-file preview chip. */
export function ChatAttachmentPicker({ file, onFileChange, disabled }: PickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const pick = (f: File | null) => {
    if (!f) return onFileChange(null);
    if (!f.type.startsWith("image/") && !f.type.startsWith("video/")) {
      toast.error("Only images and videos can be sent");
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error("File is too large (max 25 MB)");
      return;
    }
    onFileChange(f);
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
      />
      <Button
        type="button"
        variant="outline"
        size="icon"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        aria-label="Attach photo or video"
      >
        <ImagePlus className="h-4 w-4" />
      </Button>
      {file && (
        <div className="absolute -top-9 left-0 flex max-w-full items-center gap-2 rounded-full bg-muted px-3 py-1 text-xs">
          <span className="truncate max-w-[180px]">{file.name}</span>
          <button type="button" onClick={() => onFileChange(null)} aria-label="Remove attachment">
            <X className="h-3 w-3" />
          </button>
        </div>
      )}
    </>
  );
}
