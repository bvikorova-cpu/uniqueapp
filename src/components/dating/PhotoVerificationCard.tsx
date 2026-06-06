import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Loader2, Camera, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Props {
  profileId: string;
  userId: string;
  status: string; // unverified | pending | verified | rejected
  verified: boolean;
  onChange: (status: string) => void;
}

// Random poses — user must replicate this in selfie
const POSES = [
  "✌️ Peace sign next to your chin",
  "👍 Thumbs up over your forehead",
  "🤘 Rock sign over your shoulder",
  "👌 OK sign over your eye",
  "🖐️ Open palm covering your ear",
];

export const PhotoVerificationCard = ({ profileId, userId, status, verified, onChange }: Props) => {
  const { toast } = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [pose] = useState(() => POSES[Math.floor(Math.random() * POSES.length)]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) {
      toast({ title: "Selfie too large (max 8MB)", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${userId}/verification/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage
        .from("media")
        .upload(path, file, { contentType: file.type });
      if (upErr) throw upErr;
      const { data: { publicUrl } } = supabase.storage.from("media").getPublicUrl(path);
      const { error } = await supabase
        .from("dating_profiles")
        .update({
          verification_selfie_url: publicUrl,
          verification_status: "pending",
          verification_submitted_at: new Date().toISOString(),
        })
        .eq("id", profileId);
      if (error) throw error;
      onChange("pending");
      toast({ title: "Selfie submitted", description: "We'll review within 24h." });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-sm flex items-center gap-2">
            <ShieldCheck className={`h-4 w-4 ${verified ? "text-emerald-500" : "text-primary"}`} />
            Photo Verification
          </h3>
          <p className="text-xs text-muted-foreground mt-1">
            Verified profiles get a blue badge and 2× more matches.
          </p>
        </div>
        {verified && <Badge className="bg-emerald-500 text-white gap-1"><ShieldCheck className="h-3 w-3" />Verified</Badge>}
        {status === "pending" && <Badge variant="outline" className="gap-1"><Clock className="h-3 w-3" />Pending</Badge>}
        {status === "rejected" && <Badge variant="destructive">Rejected</Badge>}
      </div>

      {!verified && status !== "pending" && (
        <>
          <div className="rounded-lg bg-muted/50 p-3 mb-3">
            <p className="text-xs font-medium mb-1">Your pose challenge:</p>
            <p className="text-base">{pose}</p>
          </div>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            capture="user"
            className="hidden"
            onChange={handleUpload}
          />
          <Button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full gap-2"
            variant="outline"
          >
            {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
            {uploading ? "Uploading..." : "Take verification selfie"}
          </Button>
        </>
      )}
    </Card>
  );
};
