import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Repeat, Scissors, Users } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function DuetStitchMenu({ postId }: { postId: string }) {
  const { toast } = useToast();
  const open = (type: "duet" | "stitch") => {
    // Store intent in session so the create-post flow can pick it up
    sessionStorage.setItem("remix_intent", JSON.stringify({ parentId: postId, type }));
    toast({ title: `${type === "duet" ? "Duet" : "Stitch"} mode`, description: "Record your video to remix this post." });
    window.dispatchEvent(new CustomEvent("open-create-post", { detail: { remix: { parentId: postId, type } } }));
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button size="sm" variant="ghost" className="gap-1">
          <Repeat className="h-4 w-4" /> Remix
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => open("duet")}>
          <Users className="h-4 w-4 mr-2" /> Duet (side-by-side)
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => open("stitch")}>
          <Scissors className="h-4 w-4 mr-2" /> Stitch (clip + react)
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
