import { useState, useCallback, useEffect } from "react";
import { useConversation } from "@elevenlabs/react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mic, PhoneOff, Phone, Loader2, Crown } from "lucide-react";

export const VoiceCallView = () => {
  const [connecting, setConnecting] = useState(false);
  const [hasMic, setHasMic] = useState(false);

  const conversation = useConversation({
    onConnect: () => toast.success("Connected"),
    onDisconnect: () => toast.info("Call ended"),
    onError: (e) => toast.error(typeof e === "string" ? e : "Voice error"),
  });

  useEffect(() => {
    navigator.permissions?.query({ name: "microphone" as PermissionName })
      .then(p => setHasMic(p.state === "granted")).catch(() => {});
  }, []);

  const start = useCallback(async () => {
    setConnecting(true);
    try {
      await navigator.mediaDevices.getUserMedia({ audio: true });
      const { data, error } = await supabase.functions.invoke("best-friend-voice-token");
      if (error || !data?.token) {
        if ((error as any)?.context?.status === 402 || data?.error === "voice_requires_subscription") {
          toast.error("Voice calls require a subscription"); return;
        }
        if (data?.error?.includes("not configured")) {
          toast.error("Voice not configured. Contact support."); return;
        }
        throw new Error(data?.error || "token error");
      }
      await conversation.startSession({ conversationToken: data.token, connectionType: "webrtc" });
    } catch (e: any) { toast.error(e.message || "Failed"); }
    finally { setConnecting(false); }
  }, [conversation]);

  const stop = useCallback(async () => { await conversation.endSession(); }, [conversation]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mx-auto mb-4">
          <Mic className="h-8 w-8 text-white"/>
        </div>
        <h2 className="text-3xl font-black">Voice Call</h2>
        <p className="text-muted-foreground mt-2">Talk to your AI best friend in real time</p>
        <Badge className="mt-2 bg-emerald-500/20 text-emerald-300"><Crown className="h-3 w-3 mr-1"/> Premium</Badge>
      </div>

      <Card><CardContent className="p-8 text-center space-y-4">
        <div className="text-sm">Status: <span className="font-bold">{conversation.status}</span></div>
        {conversation.status === "connected" && (
          <div className="text-sm text-muted-foreground">
            {conversation.isSpeaking ? "🗣️ Speaking..." : "👂 Listening..."}
          </div>
        )}

        {conversation.status === "disconnected" ? (
          <Button size="lg" onClick={start} disabled={connecting}
            className="rounded-full h-24 w-24 bg-gradient-to-br from-emerald-500 to-teal-600">
            {connecting ? <Loader2 className="h-10 w-10 animate-spin"/> : <Phone className="h-10 w-10"/>}
          </Button>
        ) : (
          <Button size="lg" onClick={stop} variant="destructive" className="rounded-full h-24 w-24">
            <PhoneOff className="h-10 w-10"/>
          </Button>
        )}
        <p className="text-xs text-muted-foreground">
          {conversation.status === "disconnected" ? "Tap to start" : "Tap to end call"}
        </p>
      </CardContent></Card>

      <Card className="bg-amber-500/10 border-amber-500/30"><CardContent className="p-4 text-xs text-amber-200">
        <strong>Setup required:</strong> Voice calls need ELEVENLABS_API_KEY and BEST_FRIEND_AGENT_ID configured in edge function secrets. Create the agent at elevenlabs.io/app/agents.
      </CardContent></Card>
    </div>
  );
};
