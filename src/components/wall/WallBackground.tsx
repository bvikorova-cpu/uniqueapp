import { useAnimations } from "@/contexts/AnimationContext";

export const WallBackground = () => {
  const { animationsEnabled } = useAnimations();

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Clean professional gradient base */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-zinc-100 to-stone-100 dark:from-slate-950 dark:via-zinc-950 dark:to-stone-950" />
      
      {/* Subtle warm accent overlays */}
      <div className="absolute inset-0 opacity-30" 
        style={{
          background: 'radial-gradient(ellipse at top left, hsl(var(--primary) / 0.08) 0%, transparent 50%), radial-gradient(ellipse at bottom right, hsl(var(--accent) / 0.06) 0%, transparent 50%)',
          backgroundSize: '200% 200%',
          animation: animationsEnabled ? 'gradient-shift 20s ease infinite' : 'none'
        }}
      />
      
      {/* Refined ambient glow - minimal, professional */}
      <div className={`absolute -top-32 -left-32 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-[160px] ${animationsEnabled ? 'animate-pulse-slow' : ''}`} />
      <div className={`absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-accent/[0.03] rounded-full blur-[160px] ${animationsEnabled ? 'animate-pulse-slow animation-delay-4000' : ''}`} />
      
      {/* Elegant dot grid pattern */}
      <div className="absolute inset-0 opacity-[0.025]" 
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground)) 0.5px, transparent 0.5px)`,
          backgroundSize: '32px 32px'
        }} 
      />

      {/* Subtle diagonal lines for depth */}
      <div className="absolute inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 80px,
            hsl(var(--foreground) / 0.1) 80px,
            hsl(var(--foreground) / 0.1) 81px
          )`
        }}
      />
    </div>
  );
};
