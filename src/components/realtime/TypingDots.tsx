import { cn } from "@/lib/utils";
import { FloatingHowItWorks } from "../common/FloatingHowItWorks";

interface TypingDotsProps {
  /** Names of users currently typing (already filtered to exclude self). */
  names: string[];
  className?: string;
}

/**
 * "Alice is typing…" line with animated dots.
 * Collapses gracefully: 1 → "Alice", 2 → "Alice and Bob", 3+ → "Alice and 2 others".
 */
export function TypingDots({ names, className }: TypingDotsProps) {
  if (!names.length) return null;

  let label: string;
  if (names.length === 1) label = `${names[0]} is typing`;
  else if (names.length === 2) label = `${names[0]} and ${names[1]} are typing`;
  else label = `${names[0]} and ${names.length - 1} others are typing`;

  return (
    <>
      <FloatingHowItWorks title={"Typing Dots - How it works"} steps={[{ title: 'Open', desc: 'Access the Typing Dots section from its module.' }, { title: 'Explore', desc: 'Review the controls and content available in Typing Dots.' }, { title: 'Interact', desc: 'Use the available actions - browse, select, or submit as needed.' }, { title: 'Review', desc: 'Check the results, updates, or feedback shown after your action.' }]} />
      <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center gap-2 text-xs text-muted-foreground", className)}
    >
      <span className="truncate">{label}</span>
      <span className="inline-flex gap-0.5" aria-hidden>
        <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.3s]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-current [animation-delay:-0.15s]" />
        <span className="h-1 w-1 animate-bounce rounded-full bg-current" />
      </span>
    </div>
    </>
  );
}
