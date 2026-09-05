import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Upload, Sparkles, Loader2, Download, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { safeInvoke } from "@/utils/safeInvoke";

import { useNavigate } from "react-router-dom";

const DESIGN_COST = 30;

interface AIRoomDesignerProps {
  onDesignComplete?: () => void;
}

export function AIRoomDesigner({ onDesignComplete }: AIRoomDesignerProps) {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [credits, setCredits] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [roomType, setRoomType] = useState("");
  const [stylePreference, setStylePreference] = useState("");
  const [customPrompt, setCustomPrompt] = useState("");
  const [resultImage, setResultImage] = useState<string>("");

  const loadCredits = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setCredits(0); return; }
    const { data } = await supabase.from("ai_credits").select("credits_remaining").eq("user_id", user.id).maybeSingle();
    setCredits(data?.credits_remaining ?? 0);
  }, []);

  useEffect(() => { loadCredits(); }, [loadCredits]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleGenerateDesign = async () => {
    if (!selectedImage || !roomType || !stylePreference) {
      toast({ title: "Missing Information", description: "Please fill in all required fields", variant: "destructive" });
      return;
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { navigate("/auth"); return; }

    try {
      setLoading(true);
      setResultImage("");

      // Upload the original room photo
      const fileExt = selectedImage.name.split(".").pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from("home-designs")
        .upload(`${user.id}/${fileName}`, selectedImage);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("home-designs")
        .getPublicUrl(`${user.id}/${fileName}`);

      const promptText = `Redesign this ${roomType.replace(/-/g, " ")} in ${stylePreference} style. ${customPrompt || ""}`.trim();

      const { data, error } = await safeInvoke("generate-gift-message", {
        body: {
          type: "generate_ai_room_design",
          originalImageUrl: publicUrl,
          roomType,
          stylePreference,
          customPrompt: promptText,
          prompt: promptText } });

      if (error) throw new Error(error);


      const imageUrl = (data as any)?.imageUrl || (data as any)?.url || (data as any)?.image;
      if (!imageUrl) throw new Error("No design returned, please try again");

      setResultImage(imageUrl);

      await supabase.from("ai_room_designs").insert({
        user_id: user.id,
        original_image_url: publicUrl,
        redesigned_image_url: imageUrl,
        room_type: roomType,
        style_preference: stylePreference,
        custom_prompt: customPrompt || null } as any);

      await loadCredits();
      onDesignComplete?.();

      toast({ title: "✨ Design Ready!", description: `${DESIGN_COST} credits used` });
    } catch (error: any) {
      console.error("Error:", error);
      const msg = String(error?.message || "");
      toast({
        title: msg.toUpperCase().includes("INSUFFICIENT") ? "Not enough credits" : "Error",
        description: msg.toUpperCase().includes("INSUFFICIENT")
          ? `You need ${DESIGN_COST} AI credits for a room design.`
          : msg || "Failed to generate design",
        variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    if (!resultImage) return;
    try {
      const res = await fetch(resultImage);
      const blob = await res.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `room-design-${Date.now()}.png`;
      link.click();
      URL.revokeObjectURL(link.href);
    } catch {
      window.open(resultImage, "_blank");
    }
  };

  const hasCredits = credits === null || credits >= DESIGN_COST;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-subtle border-0">
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">AI Room Designer</CardTitle>
              <CardDescription>
                Upload a room photo and AI will redesign it in your chosen style
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-sm px-3 py-1.5">{DESIGN_COST} credits / design</Badge>
              {credits !== null && (
                <Badge variant={hasCredits ? "default" : "destructive"} className="text-sm px-3 py-1.5">
                  Balance: {credits}
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Design Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create New Design</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Image Upload */}
          <div className="space-y-2">
            <Label>Room Photo *</Label>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              {imagePreview ? (
                <div className="space-y-4">
                  <img
                    src={imagePreview}
                    alt="Room preview"
                    className="max-w-full h-64 object-contain mx-auto rounded-lg"
                  />
                  <Button
                    variant="outline"
                    onClick={() => { setSelectedImage(null); setImagePreview(""); }}
                  >
                    Change Photo
                  </Button>
                </div>
              ) : (
                <div>
                  <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="max-w-xs mx-auto"
                  />
                  <p className="text-sm text-muted-foreground mt-2">
                    Upload a clear photo of your room
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Room Type & Style */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>Room Type *</Label>
              <Select value={roomType} onValueChange={setRoomType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="living-room">Living Room</SelectItem>
                  <SelectItem value="bedroom">Bedroom</SelectItem>
                  <SelectItem value="kitchen">Kitchen</SelectItem>
                  <SelectItem value="bathroom">Bathroom</SelectItem>
                  <SelectItem value="dining-room">Dining Room</SelectItem>
                  <SelectItem value="office">Office</SelectItem>
                  <SelectItem value="kids-room">Kids Room</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Style *</Label>
              <Select value={stylePreference} onValueChange={setStylePreference}>
                <SelectTrigger>
                  <SelectValue placeholder="Select style" />
                </SelectTrigger>
                <SelectContent className="max-h-72">
                  {ROOM_STYLES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>

              </Select>
            </div>
          </div>

          {/* Custom Prompt */}
          <div className="space-y-2">
            <Label>Additional Requirements (Optional)</Label>
            <Textarea
              placeholder="e.g. More plants, warm colors, reading nook..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              rows={3}
            />
          </div>

          {!hasCredits && (
            <div className="rounded-lg border border-destructive/40 bg-destructive/5 p-4 text-center space-y-2">
              <p className="text-sm text-destructive font-medium">
                You need {DESIGN_COST} AI credits — you have {credits}.
              </p>
              <Button variant="outline" size="sm" onClick={() => navigate("/ai-credits-store")}>
                Get AI credits
              </Button>
            </div>
          )}

          <Button
            onClick={handleGenerateDesign}
            disabled={loading || !hasCredits}
            className="w-full"
            size="lg"
          >
            {loading ? (
              <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Generating Design...</>
            ) : !hasCredits ? (
              <><Lock className="mr-2 h-5 w-5" /> {DESIGN_COST} Credits Required</>
            ) : (
              <><Sparkles className="mr-2 h-5 w-5" /> Generate AI Design</>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Design Result */}
      {resultImage && (
        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle>Your AI Design</CardTitle>
              <Button onClick={handleDownload} variant="outline" size="sm">
                <Download className="mr-2 h-4 w-4" /> Download
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <img src={resultImage} alt="AI room design" className="w-full rounded-lg" />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
