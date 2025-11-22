import { ExternalLink, Music, MapPin, ShoppingBag, Video } from "lucide-react";
import { Card } from "@/components/ui/card";
import { usePostEmbeds } from "@/hooks/usePostEmbeds";

interface EmbedDisplayProps {
  postId: string;
}

export const EmbedDisplay = ({ postId }: EmbedDisplayProps) => {
  const { embeds, isLoading } = usePostEmbeds(postId);

  if (isLoading || embeds.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Video className="w-4 h-4" />;
      case "music":
        return <Music className="w-4 h-4" />;
      case "location":
        return <MapPin className="w-4 h-4" />;
      case "product":
        return <ShoppingBag className="w-4 h-4" />;
      default:
        return <ExternalLink className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-2 mt-3">
      {embeds.map((embed) => (
        <Card key={embed.id} className="p-3 hover:bg-accent transition-colors">
          <a
            href={embed.embed_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start gap-3"
          >
            {embed.embed_image && (
              <img
                src={embed.embed_image}
                alt={embed.embed_title || "Embed"}
                className="w-20 h-20 object-cover rounded"
              />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {getIcon(embed.embed_type)}
                <span className="text-xs text-muted-foreground capitalize">
                  {embed.embed_type}
                </span>
              </div>
              {embed.embed_title && (
                <h4 className="font-semibold text-sm line-clamp-1">{embed.embed_title}</h4>
              )}
              {embed.embed_description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {embed.embed_description}
                </p>
              )}
            </div>
          </a>
        </Card>
      ))}
    </div>
  );
};
