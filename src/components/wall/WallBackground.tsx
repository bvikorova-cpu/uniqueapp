import { useEffect, useState } from "react";

interface Emoji {
  id: number;
  emoji: string;
  left: number;
  duration: number;
  delay: number;
  size: number;
}

export const WallBackground = () => {
  const [emojis, setEmojis] = useState<Emoji[]>([]);

  const emojiList = [
    "😊", "🎉", "❤️", "🔥", "✨", "🌟", "💫", "🎨", 
    "🎭", "🎪", "🎯", "🎸", "🎵", "💎", "🌈", "⚡",
    "🚀", "💪", "🏆", "👑", "🎬", "📸", "🎤", "🎧"
  ];

  useEffect(() => {
    // Generate random floating emojis
    const generateEmojis = () => {
      const newEmojis: Emoji[] = [];
      for (let i = 0; i < 20; i++) {
        newEmojis.push({
          id: i,
          emoji: emojiList[Math.floor(Math.random() * emojiList.length)],
          left: Math.random() * 100,
          duration: 15 + Math.random() * 20,
          delay: Math.random() * 5,
          size: 20 + Math.random() * 30,
        });
      }
      setEmojis(newEmojis);
    };

    generateEmojis();
  }, []);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {/* Medium tone base gradient with more color */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-700 via-indigo-800 to-purple-900" />
      
      {/* Vibrant animated gradient overlay */}
      <div className="absolute inset-0 opacity-50" 
        style={{
          background: 'radial-gradient(ellipse at top left, rgba(167, 139, 250, 0.35) 0%, transparent 50%), radial-gradient(ellipse at bottom right, rgba(244, 114, 182, 0.35) 0%, transparent 50%), radial-gradient(ellipse at center, rgba(34, 211, 238, 0.25) 0%, transparent 50%)',
          backgroundSize: '200% 200%',
          animation: 'gradient-shift 15s ease infinite'
        }}
      />
      
      {/* Vibrant neon glow layers */}
      <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-violet-500/25 rounded-full blur-[130px] animate-pulse-slow" />
      <div className="absolute top-1/4 right-0 w-[450px] h-[450px] bg-pink-500/22 rounded-full blur-[110px] animate-pulse-slow animation-delay-2000" />
      <div className="absolute bottom-0 left-1/4 w-[650px] h-[650px] bg-cyan-400/18 rounded-full blur-[150px] animate-pulse-slow animation-delay-4000" />
      <div className="absolute top-1/2 right-1/3 w-[400px] h-[400px] bg-fuchsia-500/20 rounded-full blur-[110px] animate-pulse-slow animation-delay-3000" />
      <div className="absolute bottom-1/4 left-1/2 w-[500px] h-[500px] bg-emerald-400/15 rounded-full blur-[120px] animate-pulse-slow animation-delay-1000" />
      
      {/* Neon grid overlay */}
      <div className="absolute inset-0 opacity-[0.06]" 
        style={{
          backgroundImage: `linear-gradient(rgba(139, 92, 246, 0.4) 1px, transparent 1px),
                           linear-gradient(90deg, rgba(139, 92, 246, 0.4) 1px, transparent 1px)`,
          backgroundSize: '60px 60px'
        }} 
      />

      {/* Floating emojis */}
      <div className="absolute inset-0">
        {emojis.map((emoji) => (
          <div
            key={emoji.id}
            className="absolute animate-float-up opacity-40 hover:opacity-80 transition-opacity"
            style={{
              left: `${emoji.left}%`,
              fontSize: `${emoji.size}px`,
              animationDuration: `${emoji.duration}s`,
              animationDelay: `${emoji.delay}s`,
              filter: 'drop-shadow(0 0 8px rgba(var(--primary-rgb), 0.3))',
            }}
          >
            {emoji.emoji}
          </div>
        ))}
      </div>

      {/* Neon streaks */}
      <div className="absolute top-1/3 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/30 to-transparent animate-slide-right" />
      <div className="absolute top-2/3 right-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent/30 to-transparent animate-slide-left" />
      
      {/* Sparkle effects */}
      <div className="absolute top-[20%] left-[15%] w-2 h-2 bg-primary rounded-full animate-sparkle" />
      <div className="absolute top-[60%] right-[25%] w-2 h-2 bg-accent rounded-full animate-sparkle animation-delay-1000" />
      <div className="absolute bottom-[30%] left-[70%] w-2 h-2 bg-secondary rounded-full animate-sparkle animation-delay-2000" />
      <div className="absolute top-[40%] right-[60%] w-2 h-2 bg-primary rounded-full animate-sparkle animation-delay-3000" />
    </div>
  );
};
