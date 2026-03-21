import { Loader2 } from "lucide-react";

export const PageLoader = () => {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl animate-pulse" />
        <Loader2 className="h-10 w-10 animate-spin text-primary relative" />
      </div>
    </div>
  );
};

export default PageLoader;
