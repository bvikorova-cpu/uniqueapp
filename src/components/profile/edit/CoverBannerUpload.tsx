import { ImagePlus, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FloatingHowItWorks } from "../../common/FloatingHowItWorks";

interface Props {
  coverUrl: string;
  uploading: boolean;
  onUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemove: () => void;
}

export const CoverBannerUpload = ({ coverUrl, uploading, onUpload, onRemove }: Props) => {
  return (
    <>
      <FloatingHowItWorks title={"Cover Banner Upload - How it works"} steps={[{ title: 'Open', desc: 'Access the Cover Banner Upload section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Cover Banner Upload.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div className="rounded-2xl border border-border/50 overflow-hidden mb-6 bg-card/50">
      <div
        className="relative h-40 sm:h-52 bg-gradient-to-br from-violet-900/40 via-amber-900/30 to-pink-900/40"
        style={coverUrl ? { backgroundImage: `url(${coverUrl})`, backgroundSize: "cover", backgroundPosition: "center" } : undefined}
      >
        {!coverUrl && (
          <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
            Add a cover banner to personalize your profile
          </div>
        )}
        <div className="absolute bottom-3 right-3 flex gap-2">
          <Label htmlFor="cover-upload" className="cursor-pointer">
            <Button variant="secondary" size="sm" disabled={uploading} asChild>
              <span>
                {uploading ? <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" /> : <ImagePlus className="h-3.5 w-3.5 mr-1.5" />}
                {coverUrl ? "Change" : "Upload"} Cover
              </span>
            </Button>
          </Label>
          {coverUrl && (
            <Button variant="secondary" size="sm" onClick={onRemove}>
              <X className="h-3.5 w-3.5" />
            </Button>
          )}
          <Input id="cover-upload" type="file" accept="image/*" onChange={onUpload} className="hidden" />
        </div>
      </div>
    </div>
    </>
  );
};
