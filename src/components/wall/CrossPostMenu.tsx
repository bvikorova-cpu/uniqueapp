import { Share2, Twitter, Facebook, Linkedin, Link2, MessageCircle } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface Props {
  url: string;
  text?: string;
  trigger?: React.ReactNode;
}

export const CrossPostMenu = ({ url, text = "", trigger }: Props) => {
  const { toast } = useToast();
  const enc = encodeURIComponent;

  const open = (u: string) => window.open(u, "_blank", "noopener,noreferrer");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "Link copied" });
    } catch {
      toast({ title: "Failed to copy", variant: "destructive" });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger || (
          <Button variant="ghost" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => open(`https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}`)}>
          <Twitter className="w-4 h-4 mr-2" /> X / Twitter
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => open(`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}`)}>
          <Facebook className="w-4 h-4 mr-2" /> Facebook
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => open(`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}`)}>
          <Linkedin className="w-4 h-4 mr-2" /> LinkedIn
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => open(`https://api.whatsapp.com/send?text=${enc(text + " " + url)}`)}>
          <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
        </DropdownMenuItem>
        <DropdownMenuItem onClick={copy}>
          <Link2 className="w-4 h-4 mr-2" /> Copy link
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
