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
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      {/* Animated gradient background with neon effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-accent/10 animate-gradient-shift" />
      
      {/* Neon glow layers */}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary/20 rounded-full blur-[120px] animate-pulse-slow" />
      <div className="absolute top-1/4 right-0 w-[400px] h-[400px] bg-accent/20 rounded-full blur-[100px] animate-pulse-slow animation-delay-2000" />
      <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] bg-secondary/15 rounded-full blur-[140px] animate-pulse-slow animation-delay-4000" />
      
      {/* Neon grid overlay */}
      <div className="absolute inset-0 opacity-[0.03]" 
        style={{
          backgroundImage: `linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
                           linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)`,
          backgroundSize: '50px 50px'
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
