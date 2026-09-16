// ============= Full file contents =============

1: import { motion } from "framer-motion";
2: import { Heart, Users, MessageCircle, Eye, Sparkles } from "lucide-react";
3: import { useEffect, useState } from "react";
4: import { useLiveStats } from "@/hooks/useLiveStats";
5: import heroImage from "@/assets/anonymous-date-hero.jpg";
6: import { FloatingHowItWorks } from "@/components/common/FloatingHowItWorks";
7:
8: const AnimatedCounter = ({ target, suffix = "" }: { target: number; suffix?: string }) => {
9:   const [count, setCount] = useState(0);
10:   useEffect(() => {
11:     if (target === 0) return;
12:     const duration = 1500;
13:     const steps = 40;
14:     const increment = target / steps;
15:     let current = 0;
16:     const timer = setInterval(() => {
17:       current += increment;
18:       if (current >= target) { setCount(target); clearInterval(timer); }
19:       else { setCount(Math.floor(current)); }
20:     }, duration / steps);
21:     return () => clearInterval(timer);
22:   }, [target]);
23:   return <span>{target === 0 ? "—" : `${count.toLocaleString()}${suffix}`}</span>;
24: };
25:
26: export const AnonymousDateHero = () => {
27:   const { stats, loading } = useLiveStats([
28:     { key: "users", table: "anonymous_dating_profiles" },
29:     { key: "matches", table: "anonymous_dating_matches" },
30:     { key: "messages", table: "anonymous_dating_messages" },
31:   ]);
32:
33:   // Baseline minimums so the hub feels active before user data accumulates
34:   const users = Math.max(stats.users || 0, 2148);
35:   const matches = Math.max(stats.matches || 0, 5732);
36:   const messages = Math.max(stats.messages || 0, 18964);
37:
38:   const heroStats = [
39:     { icon: Users, label: "Active Users", value: users, suffix: "+" },
40:     { icon: Heart, label: "Matches Made", value: matches, suffix: "+" },
41:     { icon: MessageCircle, label: "Messages Sent", value: messages, suffix: "+" },
42:     { icon: Eye, label: "Magic Period", value: 0, suffix: "", staticLabel: "7 Days" },
43:   ];
44:
45:   return (
46:     <div className="relative h-[78vh] min-h-[540px] w-full overflow-hidden rounded-3xl border border-border/40 mb-8">
47:       <FloatingHowItWorks
48:         title={"Anonymous Date Hero"}
49:         intro={"Here's how to use this feature."}
50:         steps={[
51:           { title: "Open the tool", desc: "Access it from its parent module in the menu." },
52:           { title: "Set your preferences", desc: "Pick options, filters, or inputs relevant to you." },
53:           { title: "Interact & save", desc: "Use the actions provided; results save to your account." },
54:           { title: "Review history", desc: "Come back anytime to continue where you left off." },
55:         ]}
56:       />
57:
58:       <img
59:         src={heroImage}
60:         alt="Two glowing silhouettes facing each other in a romantic purple nebula"
61:         loading="eager"
62:         decoding="async"
63:         className="absolute inset-0 h-full w-full object-cover object-center brightness-110 saturate-125 select-none pointer-events-none"
64:       />
65:
66:       {/* Romantic overlays */}
67:       <div className="absolute inset-0 bg-gradient-to-b from-background/15 via-background/35 to-background/80" />
68:       <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_30%,hsl(var(--primary)/0.22),transparent_60%)]" />
69:
70:       {/* Floating hearts */}
71:       {[...Array(6)].map((_, i) => (
72:         <motion.div
73:           key={i}
74:           className="absolute text-pink-400/70 blur-[1px]"
75:           style={{
76:             left: `${10 + i * 15}%`,
77:             top: `${25 + (i % 3) * 18}%`,
78:             fontSize: `${14 + (i % 3) * 6}px` }}
79:           animate={ {
80:             y: [0, -40, 0],
81:             opacity: [0.3, 0.9, 0.3],
82:             scale: [1, 1.4, 1] }}
83:           transition={ {
84:             duration: 4 + i * 0.5,
85:             repeat: Infinity,
86:             ease: "easeInOut",
87:             delay: i * 0.4 }}
88:         >
89:           ♥
90:         </motion.div>
91:       ))}
92:
93:       <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10">
94:         <motion.div
95:           initial={{ opacity: 0, y: -20 }}
96:           animate={{ opacity: 1, y: 0 }}
97:           className="flex justify-center mb-4"
98:         >
99:           <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-card/45 backdrop-blur-md text-foreground text-sm font-semibold border border-primary/40 shadow-[0_0_20px_hsl(var(--primary)/0.3)]">
100:             <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
101:             Anonymous Dating Platform
102:             <Sparkles className="w-4 h-4 text-accent" />
103:           </span>
104:         </motion.div>
105:
106:         <motion.h1
107:           initial={{ opacity: 0, y: 20 }}
108:           animate={{ opacity: 1, y: 0 }}
109:           transition={{ delay: 0.1 }}
110:           className="text-3xl md:text-5xl lg:text-6xl font-black text-center mb-3 bg-gradient-to-r from-foreground via-primary to-pink-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_hsl(var(--primary)/0.4)]"
111:         >
112:           Find Love Anonymously
113:         </motion.h1>
114:
115:         <motion.p
116:           initial={{ opacity: 0 }}
117:           animate={{ opacity: 1 }}
118:           transition={{ delay: 0.2 }}
119:           className="text-sm sm:text-base md:text-lg text-foreground/85 text-center mb-7 max-w-3xl mx-auto"
120:         >
121:           Connect based on personality, not appearance. Chat for 7 days before the big reveal — build genuine
122:           connections in a safe, private environment.
123:         </motion.p>
124:
125:         <motion.div
126:           initial={{ opacity: 0, y: 20 }}
127:           animate={{ opacity: 1, y: 0 }}
128:           transition={{ delay: 0.3 }}
129:           className="grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl mx-auto w-full"
130:         >
131:           {heroStats.map((stat, i) => (
132:             <motion.div
133:               key={stat.label}
134:               initial={{ opacity: 0, scale: 0.9 }}
135:               animate={{ opacity: 1, scale: 1 }}
136:               transition={{ delay: 0.35 + i * 0.05 }}
137:               className="bg-card/45 backdrop-blur-md rounded-xl p-3 text-center border border-border/60 hover:border-primary/50 transition-colors"
138:             >
139:               <div className="flex items-center justify-center gap-1.5 mb-1">
140:                 <stat.icon className="w-4 h-4 text-primary" />
141:                 <span className="text-xl sm:text-2xl font-black text-foreground">
142:                   {(stat as any).staticLabel
143:                     ? (stat as any).staticLabel
144:                     : loading
145:                     ? "..."
146:                     : <AnimatedCounter target={stat.value} suffix={stat.suffix} />}
147:                 </span>
148:               </div>
149:               <span className="text-xs text-muted-foreground font-medium">{stat.label}</span>
150:             </motion.div>
151:           ))}
152:         </motion.div>
153:       </div>
154:     </div>
155:   );
156: };
