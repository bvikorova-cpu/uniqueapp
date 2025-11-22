import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { usePostHighlights } from "@/hooks/usePostHighlights";

interface HighlightButtonProps {
  postId: string;
}

export const HighlightButton = ({ postId }: HighlightButtonProps) => {
  const { highlights, addHighlight, removeHighlight } = usePostHighlights();

  const highlight = highlights.find((h) => h.post_id === postId);
  const isHighlighted = !!highlight;

  const handleToggle = () => {
    if (isHighlighted && highlight) {
      removeHighlight(highlight.id);
    } else {
      addHighlight({ postId });
    }
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="gap-2"
    >
      <Star className={`h-4 w-4 ${isHighlighted ? "fill-current text-primary" : ""}`} />
      {isHighlighted ? "Highlighted" : "Highlight"}
    </Button>
  );
};
