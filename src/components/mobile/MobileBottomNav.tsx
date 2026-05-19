import { Link, useLocation } from "react-router-dom";
import { Home, Crown, Trophy, MessageSquare, User, LogIn } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";

const ITEMS_AUTH = [
  { path: "/", label: "Home", icon: Home },
  { path: "/megatalent", label: "Talent", icon: Crown },
  { path: "/wall", label: "Wall", icon: MessageSquare },
  { path: "/rewards", label: "Rewards", icon: Trophy },
  { path: "/profile", label: "Me", icon: User },
];

const ITEMS_GUEST = [
  { path: "/", label: "Home", icon: Home },
  { path: "/megatalent", label: "Talent", icon: Crown },
  { path: "/auth", label: "Sign in", icon: LogIn },
  { path: "/wall", label: "Wall", icon: MessageSquare },
  { path: "/rewards", label: "Rewards", icon: Trophy },
];

/** Persistent mobile bottom tab bar. Hidden ≥md. Safe-area aware. */
export const MobileBottomNav = () => {
  const { pathname } = useLocation();
  const { user } = useAuth();

  // Hide on auth flow & checkout to avoid friction
  if (pathname.startsWith("/auth") || pathname.startsWith("/checkout")) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary mobile navigation"
    >
      <ul className="grid grid-cols-5">
        {(user ? ITEMS_AUTH : ITEMS_GUEST).map(({ path, label, icon: Icon }) => {
          const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
          const target = path === "/profile" && !user ? "/auth" : path;
          return (
            <li key={path}>
              <Link
                to={target}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  active ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", active && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]")} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
