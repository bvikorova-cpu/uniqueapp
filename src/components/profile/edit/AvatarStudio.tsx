import { useState } from "react";
import { Loader2, Sparkles, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

const STYLES = [
  { id: "realistic", label: "Realistic", emoji: "📷" },
  { id: "anime", label: "Anime", emoji: "🎌" },
  { id: "pixar", label: "Pixar 3D", emoji: "🎬" },
  { id: "cyberpunk", label: "Cyberpunk", emoji: "🌃" },
  { id: "watercolor", label: "Watercolor", emoji: "🎨" },
  { id: "oilpainting", label: "Oil Painting", emoji: "🖼️" },
  { id: "comic", label: "Comic Pop", emoji: "💥" },
  { id: "fantasy", label: "Fantasy", emoji: "🧝" },
];

interface AvatarStudioProps {
  avatarUrl: string;
  fallback: string;
  uploading: boolean;
  generating: boolean;
  description: string;
  onDescriptionChange: (v: string) => void;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onGenerate: (style: string) => void;
}

export const AvatarStudio = ({
  avatarUrl, fallback, uploading, generating, description, onDescriptionChange, onUpload, onGenerate,
}: AvatarStudioProps) => {
  const [style, setStyle] = useState("realistic");

  return (
    <>
      <FloatingHowItWorks title={"Avatar Studio - How it works"} steps={[{ title: 'Open', desc: 'Access the Avatar Studio section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Avatar Studio.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-xl p-5 sm:p-6 mb-6">
      <div className="flex flex-col sm:flex-row gap-5 items-center sm:items-start">
        <div className="relative shrink-0">
          <div className="absolute -inset-2 bg-gradient-to-tr from-amber-400/30 via-violet-400/20 to-pink-400/30 rounded-full blur-lg" />
          <Avatar className="relative h-32 w-32 ring-2 ring-amber-400/40">
            <AvatarImage src={avatarUrl || undefined} />
            <AvatarFallback className="text-4xl bg-gradient-to-br from-amber-500/20 to-violet-500/20">
              {fallback}
            </AvatarFallback>
          </Avatar>
        </div>

        <div className="flex-1 w-full space-y-4">
          <div>
            <Label htmlFor="avatar-upload" className="cursor-pointer">
              <Button variant="outline" disabled={uploading} asChild className="w-full sm:w-auto">
                <span>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
                  Upload Photo
                </span>
              </Button>
            </Label>
            <Input id="avatar-upload" type="file" accept="image/*" onChange={onUpload} className="hidden" />
          </div>

          <div>
            <Label className="flex items-center gap-1.5 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-amber-400" />
              AI Avatar Generator
            </Label>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {STYLES.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => setStyle(s.id)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    style === s.id
                      ? "bg-amber-500/25 border-amber-500/60 text-amber-900 dark:text-amber-100 font-semibold shadow-md shadow-amber-500/20"
                      : "bg-muted/20 border-border/40 text-foreground/80 hover:border-amber-400/40"
                  }`}
                >
                  <span className="mr-1">{s.emoji}</span>{s.label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. confident woman, blonde, soft smile"
                value={description}
                onChange={(e) => onDescriptionChange(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && onGenerate(style)}
              />
              <Button onClick={() => onGenerate(style)} disabled={generating || !description.trim()}>
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};
