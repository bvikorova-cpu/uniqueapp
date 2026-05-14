import { Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { POST_BACKGROUNDS } from "@/lib/postBackgrounds";
import { cn } from "@/lib/utils";

interface Props {
  value: string | null;
  onChange: (key: string | null) => void;
  disabled?: boolean;
}

export function BackgroundStylePicker({ value, onChange, disabled }: Props) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn("gap-1.5", value && "text-primary")}
        >
          <Palette className="h-4 w-4" />
          <span className="hidden sm:inline">Background</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3">
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Background
          </p>
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 text-xs"
              onClick={() => onChange(null)}
            >
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {POST_BACKGROUNDS.map((bg) => (
            <button
              key={bg.key}
              type="button"
              onClick={() => onChange(bg.key)}
              title={bg.label}
              className={cn(
                "h-12 w-full rounded-lg border-2 transition-all",
                bg.className,
                value === bg.key
                  ? "border-primary ring-2 ring-primary/40"
                  : "border-transparent hover:border-primary/50"
              )}
            />
          ))}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Backgrounds apply to text-only posts (no media).
        </p>
      </PopoverContent>
    </Popover>
  );
}
