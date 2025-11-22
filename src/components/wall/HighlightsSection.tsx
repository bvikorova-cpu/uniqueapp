import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useHighlights } from "@/hooks/useHighlights";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface HighlightsSectionProps {
  userId: string;
}

export const HighlightsSection = ({ userId }: HighlightsSectionProps) => {
  const { highlights } = useHighlights(userId);

  if (highlights.length === 0) return null;

  return (
    <Card className="p-4">
      <h3 className="font-semibold mb-3 flex items-center gap-2">
        <Star className="h-5 w-5 fill-primary text-primary" />
        Highlights
      </h3>
      <div className="grid grid-cols-3 gap-2">
        {highlights.slice(0, 6).map((highlight: any) => (
          <div
            key={highlight.id}
            className="aspect-square rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
          >
            {highlight.posts?.media_urls?.[0] ? (
              <img
                src={highlight.posts.media_urls[0]}
                alt="Highlight"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-accent flex items-center justify-center">
                <p className="text-sm text-muted-foreground line-clamp-3 p-2">
                  {highlight.posts?.content}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
};
