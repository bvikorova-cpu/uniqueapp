import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, LogIn } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface ArenaAuthGuardProps {
  children: React.ReactNode;
  onBack: () => void;
  sportName?: string;
}

export function ArenaAuthGuard({ children, onBack, sportName = "Arena" }: ArenaAuthGuardProps) {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />Back
        </Button>
        <Card className="border-border/50">
          <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
            <LogIn className="h-12 w-12 text-muted-foreground" />
            <h3 className="text-lg font-bold">Sign In Required</h3>
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              You need to sign in to access {sportName} tools. Create an account or log in to start building your team!
            </p>
            <Button onClick={() => navigate("/auth")} className="mt-2">
              <LogIn className="h-4 w-4 mr-2" />Sign In
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
