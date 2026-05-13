import { Suspense, ReactNode } from "react";
import { Loader2 } from "lucide-react";

interface LazyLoadSuspenseProps {
  children: ReactNode;
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[50vh]">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-12 w-12 animate-spin text-primary" />
      <p className="text-muted-foreground text-sm">Loading...</p>
    </div>
  </div>
);

export function LazyLoadSuspense({ children }: LazyLoadSuspenseProps) {
  return <Suspense fallback={<LoadingFallback />}>{children}</Suspense>;
}

export default LazyLoadSuspense;
