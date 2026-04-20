import { Card } from "@/components/ui/card";
import { Mail, MessageCircle, Twitter, Send, Phone } from "lucide-react";

const channels = [
  { icon: Mail, label: "Email", value: "support@uniqueapp.fun", href: "mailto:support@uniqueapp.fun", color: "from-blue-500/20 to-cyan-500/20", iconColor: "text-blue-500" },
  { icon: MessageCircle, label: "Discord", value: "Join our server", href: "https://discord.gg/uniqueapp", color: "from-indigo-500/20 to-purple-500/20", iconColor: "text-indigo-500" },
  { icon: Twitter, label: "Twitter / X", value: "@uniqueapp", href: "https://twitter.com/uniqueapp", color: "from-sky-500/20 to-blue-500/20", iconColor: "text-sky-500" },
  { icon: Send, label: "Telegram", value: "t.me/uniqueapp", href: "https://t.me/uniqueapp", color: "from-cyan-500/20 to-teal-500/20", iconColor: "text-cyan-500" },
  { icon: Phone, label: "WhatsApp", value: "Business chat", href: "https://wa.me/421000000000", color: "from-emerald-500/20 to-green-500/20", iconColor: "text-emerald-500" },
];

export const ContactChannels = () => (
  <Card className="p-5 mb-6 border-2">
    <h3 className="font-bold text-base mb-4">Reach us through your favourite channel</h3>
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
      {channels.map((c) => (
        <a
          key={c.label}
          href={c.href}
          target="_blank"
          rel="noopener noreferrer"
          className={`group relative overflow-hidden rounded-xl border bg-gradient-to-br ${c.color} p-3 hover:scale-[1.03] transition-transform`}
        >
          <c.icon className={`h-5 w-5 ${c.iconColor} mb-1.5`} />
          <p className="text-xs font-bold leading-tight">{c.label}</p>
          <p className="text-[10px] text-muted-foreground truncate">{c.value}</p>
        </a>
      ))}
    </div>
  </Card>
);
