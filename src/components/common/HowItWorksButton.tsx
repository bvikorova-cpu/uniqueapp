import { useState, type ReactNode } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface HowItWorksStep {
  title: string;
  desc?: string;
  description?: string;
}

interface HowItWorksButtonProps {
  /** Feature/module title shown at the top of the sheet, e.g. "Rewards Calendar" */
  title: string;
  /** Optional short intro shown under the title */
  intro?: string;
  /** Ordered list of steps explaining how the feature works */
  steps: HowItWorksStep[];
  /** Optional extra content rendered below the steps (tips, FAQ, etc.) */
  footer?: ReactNode;
  /** Visual style of the trigger button */
  variant?: "icon" | "compact";
  /** Extra class names for the trigger */
  className?: string;
}

/**
 * Reusable "How it works" trigger that opens a right-side sheet explaining a
 * feature in numbered steps. Use it in the header of any module or page so
 * users can discover how the feature works.
 */
export const HowItWorksButton = ({
  title,
  intro,
  steps,
  footer,
  variant = "icon",
  className,
}: HowItWorksButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        {variant === "compact" ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={`gap-1.5 h-8 ${className ?? ""}`}
            aria-label="How it works"
          >
            <Info className="w-3.5 h-3.5" />
            <span className="text-xs font-semibold">How it works</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className={`h-9 w-9 rounded-full border border-border/50 bg-background/60 backdrop-blur ${className ?? ""}`}
            aria-label="How it works"
            title="How it works"
          >
            <Info className="w-4 h-4" />
          </Button>
        )}
      </SheetTrigger>
      <SheetContent
        side="right"
        className="w-full sm:max-w-md overflow-y-auto"
      >
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2 text-xl font-black">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 border border-primary/20">
              <Info className="w-4 h-4 text-primary" />
            </span>
            How {title.replace(/^\s*how\s+/i, "").replace(/\s+works\s*$/i, "").replace(/\s*-\s*how it works\s*$/i, "").trim()} works
          </SheetTitle>
          {intro ? (
            <SheetDescription className="text-sm">{intro}</SheetDescription>
          ) : null}
        </SheetHeader>

        <ol className="mt-6 space-y-3">
          {steps.map((s, i) => (
            <li
              key={i}
              className="rounded-xl border border-border/50 bg-card/60 p-3 flex gap-3"
            >
              <span className="shrink-0 w-7 h-7 rounded-full bg-primary/10 border border-primary/20 text-primary font-black text-sm flex items-center justify-center">
                {i + 1}
              </span>
              <div className="min-w-0">
                <p className="font-bold text-sm leading-tight">{s.title}</p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  {s.desc ?? s.description}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {footer ? <div className="mt-6">{footer}</div> : null}
      </SheetContent>
    </Sheet>
  );
};

export default HowItWorksButton;
