import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
  categoryToTable,
  campaignDetailRoute,
  campaignDashboardRoute,
  FUNDRAISING_CATEGORIES,
  type FundraisingCategory,
} from "@/lib/fundraisingRoutes";

const schema = z.object({
  title: z.string().trim().min(3, "Title too short").max(150),
  description: z.string().trim().min(10, "Description too short").max(500),
  story: z.string().trim().max(10000).optional().or(z.literal("")),
  target_amount: z.coerce.number().positive("Must be positive").max(1_000_000),
  image_url: z.string().trim().url("Invalid URL").max(2048).optional().or(z.literal("")),
  video_url: z.string().trim().url("Invalid URL").max(2048).optional().or(z.literal("")),
  ends_at: z.string().optional().or(z.literal("")),
});

type FormState = z.infer<typeof schema>;

const NO_IMAGE = new Set<FundraisingCategory>(["crisis", "talent"]);
const NO_ENDS_AT = new Set<FundraisingCategory>(["pet", "crisis"]);

export default function EditCampaign() {
  const { campaignType, campaignId } = useParams<{ campaignType: string; campaignId: string }>();
  const navigate = useNavigate();
  const type = (campaignType ?? "") as FundraisingCategory;
  const validType = FUNDRAISING_CATEGORIES.some((c) => c.type === type);
  const table = categoryToTable(type);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    story: "",
    target_amount: 0,
    image_url: "",
    video_url: "",
    ends_at: "",
  });

  useEffect(() => {
    if (!validType || !campaignId) {
      toast({ title: "Invalid campaign", variant: "destructive" });
      navigate("/fundraising");
      return;
    }
    (async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        navigate(`/auth?redirect=/fundraising/${type}/${campaignId}/edit`);
        return;
      }
      const { data, error } = await (supabase as any)
        .from(table)
        .select("title, description, story, target_amount, image_url, video_url, ends_at, user_id")
        .eq("id", campaignId)
        .maybeSingle();
      if (error || !data) {
        toast({ title: "Not found", description: error?.message ?? "Campaign not found", variant: "destructive" });
        navigate(`/fundraising/${type}`);
        return;
      }
      if (data.user_id !== user.id) {
        toast({ title: "Not authorized", description: "You can only edit your own campaigns", variant: "destructive" });
        navigate(campaignDetailRoute(type, campaignId));
        return;
      }
      setForm({
        title: data.title ?? "",
        description: data.description ?? "",
        story: data.story ?? "",
        target_amount: Number(data.target_amount ?? 0),
        image_url: data.image_url ?? "",
        video_url: data.video_url ?? "",
        ends_at: data.ends_at ? new Date(data.ends_at).toISOString().slice(0, 10) : "",
      });
      setLoading(false);
    })();
  }, [campaignId, type, table, validType, navigate]);

  const handleSave = async () => {
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      const first = parsed.error.errors[0];
      toast({ title: "Invalid input", description: first.message, variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const payload: Record<string, unknown> = {
        title: parsed.data.title,
        description: parsed.data.description,
        story: parsed.data.story || null,
        target_amount: parsed.data.target_amount,
        video_url: parsed.data.video_url || null,
      };
      if (!NO_IMAGE.has(type)) payload.image_url = parsed.data.image_url || null;
      if (!NO_ENDS_AT.has(type)) payload.ends_at = parsed.data.ends_at ? new Date(parsed.data.ends_at).toISOString() : null;

      const { error } = await (supabase as any).from(table).update(payload).eq("id", campaignId);
      if (error) throw error;

      toast({ title: "Saved", description: "Campaign updated successfully." });
      navigate(campaignDashboardRoute(type, campaignId!));
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message ?? String(e), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <FloatingHowItWorks
          title="Edit Campaign"
          intro="Update your campaign details, story and images."
          steps={[
            { title: "Edit story", desc: "Improve description, add photos or videos." },
          { title: "Adjust goal", desc: "Change target amount if scope changes." },
          { title: "Update deadline", desc: "Extend the campaign if allowed." },
          { title: "Save changes", desc: "Donors see updates immediately." },
          { title: "Post an update", desc: "Notify all donors about important news." }
          ]}
        />
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 pt-20 pb-12">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Back
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Edit campaign</CardTitle>
          <CardDescription>Update your {type} campaign details. Changes are saved immediately.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input id="title" value={form.title} maxLength={150}
              onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="description">Short description *</Label>
            <Textarea id="description" rows={3} value={form.description} maxLength={500}
              onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <Label htmlFor="story">Full story</Label>
            <Textarea id="story" rows={8} value={form.story ?? ""}
              onChange={(e) => setForm({ ...form, story: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="target">Target amount (€) *</Label>
              <Input id="target" type="number" min={1} step="1" value={form.target_amount || ""}
                onChange={(e) => setForm({ ...form, target_amount: Number(e.target.value) })} />
            </div>
            {!NO_ENDS_AT.has(type) && (
              <div>
                <Label htmlFor="ends">End date</Label>
                <Input id="ends" type="date" value={form.ends_at ?? ""}
                  onChange={(e) => setForm({ ...form, ends_at: e.target.value })} />
              </div>
            )}
          </div>
          {!NO_IMAGE.has(type) && (
            <div>
              <Label htmlFor="image">Image URL</Label>
              <Input id="image" type="url" value={form.image_url ?? ""}
                onChange={(e) => setForm({ ...form, image_url: e.target.value })} />
            </div>
          )}
          <div>
            <Label htmlFor="video">Video URL</Label>
            <Input id="video" type="url" value={form.video_url ?? ""}
              onChange={(e) => setForm({ ...form, video_url: e.target.value })} />
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={handleSave} disabled={saving} className="flex-1">
              {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
              Save changes
            </Button>
            <Button variant="outline" onClick={() => navigate(campaignDetailRoute(type, campaignId!))}>
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
