import { Shield, CheckCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface SafeContentBadgeProps {
  variant?: "default" | "compact";
  className?: string;
}

export function SafeContentBadge({ variant = "default", className = "" }: SafeContentBadgeProps) {
  if (variant === "compact") {
    return (
      <Badge 
        className={`bg-green-100 text-green-700 hover:bg-green-100 border border-green-300 ${className}`}
      >
        <Shield className="w-3 h-3 mr-1" />
        Safe Content
      </Badge>
    );
  }

  return (
    <div className={`flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border-2 border-green-200 ${className}`}>
      <div className="flex-shrink-0 w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-lg">
        <Shield className="w-6 h-6 text-white" />
      </div>
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h4 className="font-bold text-green-700">Safe Content Guarantee</h4>
          <CheckCircle className="w-4 h-4 text-green-500" />
        </div>
        <p className="text-sm text-green-600">
          All AI responses are double-moderated for child safety. Content is filtered to ensure age-appropriate interactions.
        </p>
      </div>
    </div>
  );
}
