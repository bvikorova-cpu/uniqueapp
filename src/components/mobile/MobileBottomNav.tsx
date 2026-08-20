import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Home, Crown, Trophy, MessageSquare, User, LogIn, Mic, Languages } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { markMeClick, storeMeProfileSnapshot } from "@/utils/perfMe";
import { prefetchProfileRoute } from "@/utils/prewarmRoutes";
import { openUni, openTranslator } from "@/lib/assistantBus";

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

  useEffect(() => {
    if (user) {
      storeMeProfileSnapshot(user);
      prefetchProfileRoute();
    }
  }, [user]);

  // Hide on auth flow & checkout to avoid friction
  if (pathname.startsWith("/auth") || pathname.startsWith("/checkout") || pathname.startsWith("/messenger")) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-xl pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary mobile navigation"
    >
      <ul className="grid grid-cols-7 gap-0.5 px-1">
        {(user ? ITEMS_AUTH : ITEMS_GUEST).map(({ path, label, icon: Icon }) => {
          const active = path === "/" ? pathname === "/" : pathname.startsWith(path);
          const target = path === "/profile" ? (user ? `/profile/${user.id}` : "/auth") : path;
          const isSignIn = !user && path === "/auth";
          return (
            <li key={path}>
              <Link
                to={target}
                onPointerDown={() => {
                  if (path === "/profile") prefetchProfileRoute();
                }}
                onTouchStart={() => {
                  if (path === "/profile") prefetchProfileRoute();
                }}
                onClick={() => {
                  if (path === "/profile") {
                    storeMeProfileSnapshot(user);
                    markMeClick();
                  }
                }}
                className={cn(
                  "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium transition-colors",
                  isSignIn
                    ? "text-primary-foreground bg-gradient-to-br from-primary to-accent shadow-lg shadow-primary/30 mx-1 my-1 rounded-xl"
                    : active
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={active ? "page" : undefined}
              >
                <Icon className={cn("h-5 w-5", active && !isSignIn && "drop-shadow-[0_0_6px_hsl(var(--primary)/0.6)]")} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <button
            type="button"
            onClick={openUni}
            aria-label="Open Uni AI assistant"
            className="w-full flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="relative flex items-center justify-center">
              <Mic className="h-5 w-5 text-primary" />
              <span className="absolute -top-1 -right-2 text-[9px]">🤖</span>
            </span>
            <span>Uni</span>
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={openTranslator}
            aria-label="Open translator"
            className="w-full flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            <span className="relative flex items-center justify-center">
              <Languages className="h-5 w-5" />
              <span className="absolute -top-1 -right-2 text-[9px]">🌐</span>
            </span>
            <span>Translate</span>
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default MobileBottomNav;
