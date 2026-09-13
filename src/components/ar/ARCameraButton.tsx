import { lazy, Suspense, useState, type ReactNode } from "react";
import { Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { ArCaptureKind } from "@/components/ar/ARCameraDialog";

const ARCameraDialog = lazy(() => import("@/components/ar/ARCameraDialog"));

interface ARCameraButtonProps {
  onCapture: (file: File, kind: ArCaptureKind) => void;
  allowVideo?: boolean;
  trigger?: ReactNode;
  className?: string;
}

/** Reusable trigger that opens the AR camera anywhere on the platform. */
export const ARCameraButton = ({ onCapture, allowVideo = true, trigger, className }: ARCameraButtonProps) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {trigger ? (
        <span onClick={() => setOpen(true)}>{trigger}</span>
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          title="AR camera filters"
          className={className ?? "h-8 w-8 text-purple-500 hover:bg-purple-500/10"}
          onClick={() => setOpen(true)}
        >
          <Wand2 className="h-4 w-4" />
        </Button>
      )}
      {open && (
        <Suspense fallback={null}>
          <ARCameraDialog open={open} onOpenChange={setOpen} onCapture={onCapture} allowVideo={allowVideo} />
        </Suspense>
      )}
    </>
  );
};
