import { useEffect, useState } from "react";
import { useAnimations } from "@/contexts/AnimationContext";

interface Emoji {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
}

export const WallBackground = () => {
  const { animationsEnabled } = useAnimations();
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  const floatingSymbols = [
    "◆", "◇", "○", "●", "△", "▽", "□", "■",
    "⬡", "⬢", "✦", "✧", "⊹", "⊿", "◈", "◎",
    "⟐", "⟡", "❖", "✶", "⬥", "⬦", "◉", "◌",
  ];

  useEffect(() => {
    // Generate random floating emojis
    const generateEmojis = () => {
      const newEmojis: Emoji[] = [];
      for (let i = 0; i < 15; i++) {
        newEmojis.push({
          id: i,
          emoji: floatingSymbols[Math.floor(Math.random() * floatingSymbols.length)],
          left: Math.random() * 100,
          duration: 20 + Math.random() * 25,
          delay: Math.random() * 8,
          size: 12 + Math.random() * 18,
        });
      }
      setEmojis(newEmojis);
    };

    generateEmojis();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Light base gradient with pink and indigo/turquoise tones */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-50 via-indigo-100 to-cyan-100" />
      
      {/* Pink and indigo/turquoise animated gradient overlay */}
      <div className="absolute inset-0 opacity-50" 
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(244, 114, 182, 0.25) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(99, 179, 237, 0.3) 0%, transparent 50%), radial-gradient(ellipse at center, rgba(236, 72, 153, 0.2) 0%, transparent 50%)',
          backgroundSize: '200% 200%',
          animation: animationsEnabled ? 'gradient-shift 15s ease infinite' : 'none'
        }}
      />
      
      {/* Softer colorful glow layers with pink and indigo/turquoise - optimized with will-change */}
      <div className={`absolute top-0 left-0 w-[550px] h-[550px] bg-pink-300/20 rounded-full blur-[130px] ${animationsEnabled ? 'animate-pulse-slow' : ''}`} style={{ willChange: animationsEnabled ? 'opacity' : 'auto' }} />
      <div className={`absolute top-1/4 right-0 w-[450px] h-[450px] bg-cyan-300/18 rounded-full blur-[110px] ${animationsEnabled ? 'animate-pulse-slow animation-delay-2000' : ''}`} style={{ willChange: animationsEnabled ? 'opacity' : 'auto' }} />
      <div className={`absolute bottom-0 left-1/4 w-[650px] h-[650px] bg-indigo-200/16 rounded-full blur-[150px] ${animationsEnabled ? 'animate-pulse-slow animation-delay-4000' : ''}`} style={{ willChange: animationsEnabled ? 'opacity' : 'auto' }} />
      <div className={`absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-fuchsia-300/17 rounded-full blur-[110px] ${animationsEnabled ? 'animate-pulse-slow animation-delay-3000' : ''}`} style={{ willChange: animationsEnabled ? 'opacity' : 'auto' }} />
      <div className={`absolute bottom-1/4 left-1/2 w-[500px] h-[500px] bg-rose-200/14 rounded-full blur-[120px] ${animationsEnabled ? 'animate-pulse-slow animation-delay-1000' : ''}`} style={{ willChange: animationsEnabled ? 'opacity' : 'auto' }} />
      
      {/* Subtle grid overlay with pink and indigo */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(rgba(236, 72, 153, 0.2) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(99, 179, 237, 0.2) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} 
      />

      {/* Floating emojis with animation - only render if enabled */}
      {animationsEnabled && (
        <div className="absolute inset-0">
          {emojis.map((emoji) => (
            <div
              key={emoji.id}
              className="absolute animate-float-up opacity-20 hover:opacity-35 transition-opacity cursor-default font-light text-pink-300/40"
              style={{
                left: `${emoji.left}%`,
                fontSize: `${emoji.size}px`,
                animationDuration: `${emoji.duration}s`,
                animationDelay: `${emoji.delay}s`,
                filter: 'drop-shadow(0 0 8px rgba(236, 72, 153, 0.3))',
                willChange: 'transform, opacity'
              }}
            >
              {emoji.emoji}
            </div>
          ))}
        </div>
      )}

      {/* Enhanced sparkle effects with pink and cyan/indigo tones - only if enabled */}
      {animationsEnabled && (
        <>
          <div className="absolute top-[20%] left-[15%] w-3 h-3 bg-pink-400 rounded-full animate-sparkle shadow-[0_0_15px_rgba(236,72,153,0.8)]" style={{ willChange: 'opacity, transform' }} />
          <div className="absolute top-[60%] right-[25%] w-3 h-3 bg-rose-400 rounded-full animate-sparkle animation-delay-1000 shadow-[0_0_15px_rgba(244,114,182,0.8)]" style={{ willChange: 'opacity, transform' }} />
          <div className="absolute bottom-[30%] left-[70%] w-3 h-3 bg-fuchsia-400 rounded-full animate-sparkle animation-delay-2000 shadow-[0_0_15px_rgba(236,72,153,0.8)]" style={{ willChange: 'opacity, transform' }} />
          <div className="absolute top-[40%] right-[60%] w-3 h-3 bg-cyan-400 rounded-full animate-sparkle animation-delay-3000 shadow-[0_0_15px_rgba(99,179,237,0.8)]" style={{ willChange: 'opacity, transform' }} />
        </>
      )}
    </div>
  );
};
