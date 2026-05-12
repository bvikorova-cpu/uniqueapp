import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, ExternalLink } from "lucide-react";

export const CustomDomainNotice = () => {
  return (
    <Card className="border-primary/30 bg-card/80 backdrop-blur">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Globe className="w-4 h-4 text-primary" />
          Custom Domain
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-xs text-muted-foreground">
          Make your profile available at your own domain (e.g., <span className="text-foreground">yourname.com</span>).
          Buy a new domain or connect one you already own from Project Settings.
        </p>
        <div className="text-[11px] space-y-1 p-2 bg-muted/30 rounded border border-border/40">
          <div>• Add an <span className="font-mono">A</span> record → <span className="font-mono">185.158.133.1</span></div>
          <div>• Add a <span className="font-mono">TXT</span> record (provided in Settings)</div>
          <div>• SSL is auto-provisioned</div>
        </div>
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={() => window.open("https://docs.lovable.dev/features/custom-domain", "_blank")}
        >
          <ExternalLink className="w-3.5 h-3.5 mr-1.5" />
          Setup guide
        </Button>
      </CardContent>
    </Card>
  );
};
