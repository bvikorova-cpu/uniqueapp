import { ReactNode } from "react";

interface Props {
  children: ReactNode;
  className?: string;
}

/** Cinematic background + container shared across all admin subpages */
export const AdminPageShell = ({ children, className = "" }: Props) => {
  return (
    <div className="relative min-h-screen bg-gradient-to-b from-background via-background to-primary/5">
      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-cyan-500/10 blur-3xl" />
      </div>
      <div className={`relative container mx-auto px-3 sm:px-6 py-4 sm:py-6 max-w-7xl ${className}`}>
        {children}
      </div>
    </div>
  );
};

/** Glass card wrapper for admin content */
export const AdminGlassCard = ({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div
    className={`rounded-2xl border border-primary/20 bg-card/60 backdrop-blur-xl shadow-xl shadow-primary/5 overflow-hidden ${className}`}
  >
    {children}
  </div>
);
