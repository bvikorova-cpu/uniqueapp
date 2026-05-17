import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Layers, Type, Briefcase, HeartPulse, Brain, GraduationCap, Fingerprint, Globe2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import {
  useZoneAnalysis, useLetterDecoder, useCareerMatch, useHealthScreen,
  useMentalScreen, useCoachPlan, useForensicProfile, useCulturalMatch,
} from "@/hooks/useHandwritingParity";

async function uploadSample(file: File): Promise<string> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Sign in required");
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${user.id}/parity-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from("handwriting-samples").upload(path, file, { upsert: false });
  if (error) {
    // fallback bucket
    const { error: e2 } = await supabase.storage.from("handwriting-capsule").upload(path, file);
    if (e2) throw e2;
    return supabase.storage.from("handwriting-capsule").getPublicUrl(path).data.publicUrl;
  }
  return supabase.storage.from("handwriting-samples").getPublicUrl(path).data.publicUrl;
}

function ToolShell({
  icon: Icon, title, description, badge, onRun, loading, extra, result,
}: {
  icon: any; title: string; description: string; badge?: string;
  onRun: (imageUrl: string) => void; loading: boolean; extra?: React.ReactNode;
  result?: any;
}) {
  const [uploading, setUploading] = useState(false);

  const handleFile = async (file: File) => {
    try {
      setUploading(true);
      const url = await uploadSample(file);
      onRun(url);
    } catch (e: any) {
      toast.error(e.message ?? "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card className="glass-card border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-5 w-5 text-primary" />
          {title}
          <Badge variant="outline" className="ml-auto">{badge ?? "6 credits"}</Badge>
        </CardTitle>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardHeader>
      <CardContent className="space-y-3">
        {extra}
        <Input
          type="file"
          accept="image/*"
          disabled={uploading || loading}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
        />
        {(uploading || loading) && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="h-3 w-3 animate-spin" />
            {uploading ? "Uploading…" : "Analyzing…"}
          </div>
        )}
        {result && (
          <pre className="text-xs bg-muted/40 rounded-md p-3 max-h-64 overflow-auto whitespace-pre-wrap">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}

export default function HandwritingParityPack() {
  const zone = useZoneAnalysis();
  const letter = useLetterDecoder();
  const career = useCareerMatch();
  const health = useHealthScreen();
  const mental = useMentalScreen();
  const coach = useCoachPlan();
  const forensic = useForensicProfile();
  const cultural = useCulturalMatch();
  const [coachGoal, setCoachGoal] = useState("Make my writing clearer and more confident");

  return (
    <section className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl md:text-3xl font-bold">Parity Pack · 8 Forensic Tools</h2>
        <p className="text-sm text-muted-foreground">Each tool · 6 credits · powered by GPT-4 vision</p>
      </div>

      <Tabs defaultValue="zone" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full">
          <TabsTrigger value="zone">Zones</TabsTrigger>
          <TabsTrigger value="letter">Letters</TabsTrigger>
          <TabsTrigger value="career">Career</TabsTrigger>
          <TabsTrigger value="health">Wellness</TabsTrigger>
          <TabsTrigger value="mental">Mind</TabsTrigger>
          <TabsTrigger value="coach">Coach</TabsTrigger>
          <TabsTrigger value="forensic">Profile</TabsTrigger>
          <TabsTrigger value="cultural">Culture</TabsTrigger>
        </TabsList>

        <TabsContent value="zone">
          <ToolShell icon={Layers} title="Zonal Breakdown" description="Upper / middle / lower zone analysis with dominant zone."
            onRun={(imageUrl) => zone.mutate({ imageUrl })} loading={zone.isPending} result={(zone.data as any)?.result} />
        </TabsContent>
        <TabsContent value="letter">
          <ToolShell icon={Type} title="Letter-by-Letter Decoder" description="Decodes 6-10 distinctive letters and their meanings."
            onRun={(imageUrl) => letter.mutate({ imageUrl })} loading={letter.isPending} result={(letter.data as any)?.result} />
        </TabsContent>
        <TabsContent value="career">
          <ToolShell icon={Briefcase} title="Career Matcher" description="Top-fit careers and ones to avoid based on your writing."
            onRun={(imageUrl) => career.mutate({ imageUrl })} loading={career.isPending} result={(career.data as any)?.result} />
        </TabsContent>
        <TabsContent value="health">
          <ToolShell icon={HeartPulse} title="Wellness Screener" description="Educational tremor / micrographia / fatigue indicators."
            onRun={(imageUrl) => health.mutate({ imageUrl })} loading={health.isPending} result={(health.data as any)?.result} />
        </TabsContent>
        <TabsContent value="mental">
          <ToolShell icon={Brain} title="Resilience Screener" description="Anxiety, depression, burnout & resilience signals."
            onRun={(imageUrl) => mental.mutate({ imageUrl })} loading={mental.isPending} result={(mental.data as any)?.result} />
        </TabsContent>
        <TabsContent value="coach">
          <ToolShell icon={GraduationCap} title="7-Day Improvement Coach" description="Personalized practice plan tailored to your goal."
            onRun={(imageUrl) => coach.mutate({ imageUrl, goal: coachGoal })} loading={coach.isPending} result={(coach.data as any)?.result}
            extra={<Input value={coachGoal} onChange={(e) => setCoachGoal(e.target.value)} placeholder="Your goal" />} />
        </TabsContent>
        <TabsContent value="forensic">
          <ToolShell icon={Fingerprint} title="Forensic Profile" description="Probabilistic age, handedness and personality of an unknown writer."
            onRun={(imageUrl) => forensic.mutate({ imageUrl })} loading={forensic.isPending} result={(forensic.data as any)?.result} />
        </TabsContent>
        <TabsContent value="cultural">
          <ToolShell icon={Globe2} title="Cultural Style Match" description="Match script to historical / national handwriting traditions."
            onRun={(imageUrl) => cultural.mutate({ imageUrl })} loading={cultural.isPending} result={(cultural.data as any)?.result} />
        </TabsContent>
      </Tabs>
    </section>
  );
}
