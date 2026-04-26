import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface Age16BadgeProps {
  variant?: "default" | "subtle" | "solid" | "outline";
  size?: "xs" | "sm" | "md";
  withLabel?: boolean;
  withLink?: boolean;
  className?: string;
}

/**
 * Age rating badge — platform is suitable for users 16+.
 * Children 6-12 should use the dedicated /kids-channel with parental controls.
 */
export const Age16Badge = ({
  variant = "default",
  size = "sm",
  withLabel = true,
  withLink = false,
  className,
}: Age16BadgeProps) => {
  const sizes = {
    xs: "text-[10px] px-1.5 py-0.5 gap-1",
    sm: "text-xs px-2 py-0.5 gap-1",
    md: "text-sm px-2.5 py-1 gap-1.5",
  };

  const variants = {
    default:
      "bg-primary/10 text-primary border border-primary/20 backdrop-blur-sm",
    subtle: "bg-muted text-muted-foreground border border-border",
    solid: "bg-primary text-primary-foreground border border-primary",
    outline: "bg-transparent text-foreground border border-foreground/30",
  };

  const iconSize = size === "xs" ? "h-2.5 w-2.5" : size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5";

  const content = (
    <span
      className={cn(
        "inline-flex items-center font-bold rounded-md whitespace-nowrap",
        sizes[size],
        variants[variant],
        className
      )}
      aria-label="Suitable for ages 16 and over"
      title="Platform is intended for users aged 16 and over. Children 6-12 should use the Kids Channel."
    >
      <ShieldAlert className={iconSize} aria-hidden="true" />
      <span>16+</span>
      {withLabel && size !== "xs" && (
        <span className="font-medium opacity-80">Age rating</span>
      )}
    </span>
  );

  if (withLink) {
    return (
      <Link
        to="/kids-channel"
        className="inline-flex hover:opacity-80 transition-opacity"
        title="Under 16? Visit the Kids Channel"
      >
        {content}
      </Link>
    );
  }

  return content;
};

export default Age16Badge;
