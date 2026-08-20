import { useState } from "react";
import { Check, Palette, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover,
  PopoverContent,
  PopoverTrigger } from "@/components/ui/popover";
import { POST_BACKGROUNDS, getPostBackground } from "@/lib/postBackgrounds";
import { cn } from "@/lib/utils";

interface Props {
  value: string | null;
  onChange: (key: string | null) => void;
  disabled?: boolean;
}

export function BackgroundStylePicker({ value, onChange, disabled }: Props) {
  const [open, setOpen] = useState(false);
  const selected = getPostBackground(value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn("gap-1.5", value && "text-primary bg-primary/10")}
        >
          {selected ? (
            <span className={cn("h-4 w-4 rounded-full border border-white/60", selected.className)} />
          ) : (
            <Palette className="h-4 w-4" />
          )}
          <span className="hidden sm:inline">{selected ? selected.label : "Background"}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-72 p-3 z-50">
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
              onClick={() => {
                onChange(null);
                setOpen(false);
              }}
            >
              <X className="h-3 w-3 mr-1" /> Clear
            </Button>
          )}
        </div>
        <div className="grid grid-cols-4 gap-2">
          {POST_BACKGROUNDS.map((bg) => {
            const isActive = value === bg.key;
            return (
              <button
                key={bg.key}
                type="button"
                onClick={() => {
                  onChange(bg.key);
                  setOpen(false);
                }}
                title={bg.label}
                aria-pressed={isActive}
                className={cn(
                  "relative h-12 w-full rounded-lg border-2 transition-all flex items-center justify-center",
                  bg.className,
                  isActive
                    ? "border-primary ring-2 ring-primary/50 scale-105"
                    : "border-transparent hover:border-primary/50"
                )}
              >
                {isActive && (
                  <span className="rounded-full bg-background/90 p-0.5">
                    <Check className="h-3.5 w-3.5 text-primary" />
                  </span>
                )}
              </button>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-2">
          Backgrounds apply to text-only posts (no media).
        </p>
      </PopoverContent>
    </Popover>
  );
}
