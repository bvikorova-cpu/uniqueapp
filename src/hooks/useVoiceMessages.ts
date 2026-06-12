import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface SendArgs {
  receiverId: string;
  blob: Blob;
  duration: number;
}

export const useVoiceMessages = () => {
  const qc = useQueryClient();
  const { toast } = useToast();

  const send = useMutation({
    mutationFn: async ({ receiverId, blob, duration }: SendArgs) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const path = `${user.id}/voice-dm/${Date.now()}.webm`;
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, blob, { contentType: "audio/webm" });
      if (upErr) throw upErr;

      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);

      // Resolve / create the 1:1 conversation via RPC, then insert the voice
      // message into the unified `conversation_messages` table.
      const { data: convId, error: convErr } = await (supabase as any).rpc(
        "get_or_create_dm_conversation",
        { _other_user: receiverId },
      );
      if (convErr) throw convErr;

      const { error } = await (supabase as any).from("conversation_messages").insert({
        conversation_id: convId,
        sender_id: user.id,
        content: "[voice message]",
        message_type: "voice",
        audio_url: publicUrl,
        audio_duration: duration,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["direct-messages"] });
      toast({ title: "Voice message sent" });
    },
    onError: (e: any) => toast({ title: "Failed to send", description: e.message, variant: "destructive" }),
  });

  return { sendVoice: send.mutateAsync, isSending: send.isPending };
};
