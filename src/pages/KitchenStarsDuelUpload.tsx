import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ChefHat, Swords, CheckCircle2, Video, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { DropZone, type DropZoneValidation } from "@/components/kitchen-battles/DropZone";
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
import { useMasterChefAccess, KITCHENSTARS_COSTS } from "@/hooks/useMasterChefAccess";

const ALLOWED_VIDEO = ["video/mp4", "video/webm", "video/quicktime"];
const MAX_VIDEO = 50 * 1024 * 1024; // 50 MB

type Side = {
  title: string;
  description: string;
  file: File | null;
};

const emptySide: Side = { title: "", description: "", file: null };

/** Screen for uploading both duel videos (Chef X vs Chef Y) with preview + confirmation. */
export default function KitchenStarsDuelUpload() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { spendCredits, balance } = useMasterChefAccess();

  const [userId, setUserId] = useState<string | null>(null);
  const [theme, setTheme] = useState("");
  const [x, setX] = useState<Side>(emptySide);
  const [y, setY] = useState<Side>(emptySide);
  const [step, setStep] = useState<"upload" | "confirm">("upload");
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const totalCost = KITCHENSTARS_COSTS.competition_entry * 2;

  useEffect(() => {
    (async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { navigate("/auth"); return; }
      setUserId(session.user.id);
    })();
  }, [navigate]);

  const xPreview = useMemo(() => (x.file ? URL.createObjectURL(x.file) : null), [x.file]);
  const yPreview = useMemo(() => (y.file ? URL.createObjectURL(y.file) : null), [y.file]);
  useEffect(() => () => { if (xPreview) URL.revokeObjectURL(xPreview); }, [xPreview]);
  useEffect(() => () => { if (yPreview) URL.revokeObjectURL(yPreview); }, [yPreview]);

  const formatBytes = (b: number) => b < 1024 * 1024 ? `${(b / 1024).toFixed(0)} KB` : `${(b / 1024 / 1024).toFixed(2)} MB`;

  const validateFile = (file: File): DropZoneValidation => {
    if (!ALLOWED_VIDEO.includes(file.type)) {
      return { ok: false, title: "Video required", reason: `"${file.name}" is not a supported video format.`, suggestion: "Upload MP4, WEBM or MOV, max 50 MB." };
    }
    if (file.size > MAX_VIDEO) {
      return { ok: false, title: "Video too large", reason: `Your video is ${formatBytes(file.size)} — the limit is 50 MB.`, suggestion: "Trim it or re-encode at 720p." };
    }
    if (file.size === 0) {
      return { ok: false, title: "Empty file", reason: "The selected file is 0 bytes.", suggestion: "Pick another video and try again." };
    }
    return { ok: true, type: "video" };
  };

  const sideReady = (s: Side) => !!s.file && !!s.title.trim() && s.title.length <= 120 && s.description.length <= 500;
  const canReview = sideReady(x) && sideReady(y) && theme.trim().length > 0 && theme.length <= 120;

  const goConfirm = () => {
    if (!theme.trim()) { toast({ title: "Duel title required", description: "Name the duel, e.g. \"Pasta showdown\".", variant: "destructive" }); return; }
    if (!sideReady(x)) { toast({ title: "Chef X is incomplete", description: "Add a dish name and a cooking video.", variant: "destructive" }); return; }
    if (!sideReady(y)) { toast({ title: "Chef Y is incomplete", description: "Add a dish name and a cooking video.", variant: "destructive" }); return; }
    setStep("confirm");
  };

  const uploadVideo = async (battleId: string, file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "mp4";
    const path = `${userId}/${battleId}/${crypto.randomUUID()}.${ext}`;
    const { error } = await supabase.storage.from("kitchen-battles")
      .upload(path, file, { contentType: file.type, upsert: false });
    if (error) {
      toast({ title: "Upload failed", description: error.message, variant: "destructive" });
      return null;
    }
    return supabase.storage.from("kitchen-battles").getPublicUrl(path).data.publicUrl;
  };

  const submitDuel = async () => {
    if (!userId || !x.file || !y.file) return;

    const paid = await spendCredits(totalCost, "kitchenstars:duel_two_videos");
    if (!paid) return;

    setBusy(true);
    setProgress("Creating the duel...");
    const { data: battle, error: be } = await supabase.from("kitchen_battles")
      .insert({ theme: theme.trim(), description: `${x.title.trim()} vs ${y.title.trim()}`, created_by: userId })
      .select("id").single();
    if (be || !battle) {
      setBusy(false); setProgress(null);
      toast({ title: "Could not create the duel", description: be?.message, variant: "destructive" });
      return;
    }

    setProgress("Uploading Chef X video...");
    const xUrl = await uploadVideo(battle.id, x.file);
    if (!xUrl) { setBusy(false); setProgress(null); return; }

    setProgress("Uploading Chef Y video...");
    const yUrl = await uploadVideo(battle.id, y.file);
    if (!yUrl) { setBusy(false); setProgress(null); return; }

    setProgress("Publishing the duel...");
    const { error } = await supabase.from("kitchen_battle_participants").insert([
      { battle_id: battle.id, user_id: userId, dish_title: x.title.trim(), description: x.description.trim() || null, video_url: xUrl, media_type: "video", media_size: x.file.size, media_mime: x.file.type },
      { battle_id: battle.id, user_id: userId, dish_title: y.title.trim(), description: y.description.trim() || null, video_url: yUrl, media_type: "video", media_size: y.file.size, media_mime: y.file.type },
    ]);
    setBusy(false); setProgress(null);
    if (error) { toast({ title: "Error", description: error.message, variant: "destructive" }); return; }

    toast({ title: "Duel published!", description: "Chef X vs Chef Y is live — the platform can vote now." });
    navigate("/masterchef/competitions");
  };

  const sideEditor = (label: "X" | "Y", s: Side, set: (v: Side) => void, preview: string | null) => (
    <Card className="border-orange-500/20">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Badge className="bg-orange-600 hover:bg-orange-700">Chef {label}</Badge>
          <span className="text-muted-foreground font-normal text-sm">Cooking video</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Input placeholder={`Chef ${label} dish name`} value={s.title} maxLength={120}
          onChange={e => set({ ...s, title: e.target.value })} />
        <Textarea placeholder="Short description (optional)" value={s.description} maxLength={500} rows={2}
          onChange={e => set({ ...s, description: e.target.value })} />
        <DropZone
          file={s.file}
          onChange={file => set({ ...s, file })}
          validate={validateFile}
          accept="video/mp4,video/webm,video/quicktime"
          hint="MP4 / WEBM / MOV, max 50 MB"
        />
        {preview && (
          <div className="space-y-1">
            <p className="text-xs font-medium flex items-center gap-1"><Video className="h-3.5 w-3.5 text-orange-500" /> Preview</p>
            <video src={preview} controls playsInline className="w-full rounded-lg bg-black max-h-[45vh]" />
            <p className="text-xs text-muted-foreground">{s.file?.name} · {s.file ? formatBytes(s.file.size) : ""}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const confirmSide = (label: "X" | "Y", s: Side, preview: string | null) => (
    <div className="rounded-xl border border-primary/20 bg-secondary/20 p-3 space-y-2">
      <div className="flex items-center gap-2 min-w-0">
        <Badge className="bg-orange-600 hover:bg-orange-700 shrink-0">Chef {label}</Badge>
        <p className="font-semibold truncate">{s.title}</p>
      </div>
      {preview && <video src={preview} controls playsInline className="w-full rounded-lg bg-black max-h-[45vh]" />}
      {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
      <p className="text-xs text-muted-foreground">{s.file?.name} · {s.file ? formatBytes(s.file.size) : ""}</p>
    </div>
  );

  return (
    <>
      <FloatingHowItWorks
        title="How the duel upload works"
        steps={[
          { title: "Name the duel", desc: "Give the duel a title, e.g. \"Pasta showdown\"." },
          { title: "Upload two videos", desc: "Add a cooking video for Chef X and one for Chef Y — each with a dish name." },
          { title: "Preview", desc: "Play both videos right in the form before anything is sent." },
          { title: "Confirm & publish", desc: `Review the duel, confirm, and it goes live for voting (${KITCHENSTARS_COSTS.competition_entry * 2} credits for both entries).` },
        ]}
      />
      <div className="min-h-screen bg-background pt-20 pb-12 px-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <Button variant="ghost" onClick={() => navigate("/masterchef/competitions")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to competitions
          </Button>

          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-500 via-primary to-accent bg-clip-text text-transparent mb-2">
              Upload duel videos
            </h1>
            <p className="text-muted-foreground">Chef X vs Chef Y — preview both videos, then confirm before publishing.</p>
          </div>

          {step === "upload" ? (
            <div className="space-y-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <ChefHat className="h-5 w-5 text-orange-500" /> Duel title
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Input placeholder="e.g. Pasta showdown" value={theme} maxLength={120}
                    onChange={e => setTheme(e.target.value)} />
                </CardContent>
              </Card>

              {sideEditor("X", x, setX, xPreview)}

              <div className="flex items-center gap-3">
                <div className="h-px flex-1 bg-border" />
                <span className="flex items-center gap-1 font-black text-lg text-orange-500"><Swords className="h-5 w-5" /> VS</span>
                <div className="h-px flex-1 bg-border" />
              </div>

              {sideEditor("Y", y, setY, yPreview)}

              <Button size="lg" className="w-full" disabled={!canReview} onClick={goConfirm}>
                Review duel before sending
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Nothing is uploaded until you confirm. Total cost {totalCost} credits (you have {balance}).
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <Card className="border-primary/30">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <CheckCircle2 className="h-5 w-5 text-green-600" /> Confirm the duel
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">{theme}</p>
                </CardHeader>
                <CardContent className="space-y-3">
                  {confirmSide("X", x, xPreview)}
                  <div className="flex items-center gap-3">
                    <div className="h-px flex-1 bg-border" />
                    <span className="flex items-center gap-1 font-black text-lg text-orange-500"><Swords className="h-5 w-5" /> VS</span>
                    <div className="h-px flex-1 bg-border" />
                  </div>
                  {confirmSide("Y", y, yPreview)}
                  <div className="rounded-lg bg-secondary/40 p-3 text-sm">
                    <p className="font-medium">You are about to publish this duel.</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      Both videos become public for voting and {totalCost} credits will be deducted (balance {balance}).
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button variant="outline" className="flex-1" disabled={busy} onClick={() => setStep("upload")}>
                      Back to editing
                    </Button>
                    <Button className="flex-1" disabled={busy} onClick={submitDuel}>
                      {busy ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {progress || "Publishing..."}</> : `Confirm & publish (${totalCost} credits)`}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
