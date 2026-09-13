import { supabase } from "@/integrations/supabase/client";

/**
 * Uploads an AR capture and returns its public URL.
 * Used by chat surfaces that can only store a URL in the message body.
 */
export async function uploadArCapture(file: File): Promise<string> {
  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id ?? "anonymous";
  const ext = file.type.includes("webm") ? "webm" : "png";
  const path = `${uid}/ar/${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("user-uploads").upload(path, file, { contentType: file.type });
  if (error) throw error;
  return supabase.storage.from("user-uploads").getPublicUrl(path).data.publicUrl;
}
