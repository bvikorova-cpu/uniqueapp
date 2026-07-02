import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search } from "lucide-react";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

export const SeoPreview = ({
  title,
  description,
  fallbackTitle,
  fallbackDescription,
  url,
  onTitleChange,
  onDescriptionChange,
}: {
  title: string;
  description: string;
  fallbackTitle: string;
  fallbackDescription: string;
  url: string;
  onTitleChange: (v: string) => void;
  onDescriptionChange: (v: string) => void;
}) => {
  const finalTitle = (title || fallbackTitle || "Profile").slice(0, 60);
  const finalDesc = (description || fallbackDescription || "").slice(0, 160);

  return (
    <>
      <FloatingHowItWorks title={"Seo Preview - How it works"} steps={[{ title: 'Open', desc: 'Access the Seo Preview section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Seo Preview.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <Card className="p-5 mb-6 bg-gradient-to-br from-card/80 to-card/40 border-border/50">
      <div className="flex items-center gap-2 mb-3">
        <Search className="h-4 w-4 text-primary" />
        <Label className="font-semibold">SEO preview</Label>
      </div>

      <div className="space-y-2 mb-4">
        <div>
          <Label className="text-xs">Custom SEO title (max 60)</Label>
          <Input
            value={title}
            maxLength={60}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder={fallbackTitle}
          />
          <p className="text-[10px] text-muted-foreground mt-0.5">{title.length}/60</p>
        </div>
        <div>
          <Label className="text-xs">Custom SEO description (max 160)</Label>
          <Textarea
            rows={2}
            value={description}
            maxLength={160}
            onChange={(e) => onDescriptionChange(e.target.value)}
            placeholder={fallbackDescription}
          />
          <p className="text-[10px] text-muted-foreground mt-0.5">{description.length}/160</p>
        </div>
      </div>

      {/* Google snippet preview */}
      <div className="rounded-xl border border-border/50 bg-background/50 p-3">
        <p className="text-[10px] font-semibold text-muted-foreground mb-2 uppercase tracking-wide">
          Google preview
        </p>
        <div className="text-xs text-muted-foreground truncate">{url}</div>
        <div className="text-[#8ab4f8] text-base font-medium leading-tight mt-0.5 line-clamp-1">
          {finalTitle}
        </div>
        <div className="text-xs text-muted-foreground/90 mt-0.5 line-clamp-2">
          {finalDesc || "Add a description above to see it here."}
        </div>
      </div>
    </Card>
    </>
  );
};
