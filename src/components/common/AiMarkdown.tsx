import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

interface AiMarkdownProps {
  content: string;
  className?: string;
}

/**
 * Renders AI-generated markdown as clean, readable typography.
 * Never show raw markdown (###, **, ---) to users.
 */
export const AiMarkdown = ({ content, className }: AiMarkdownProps) => (
  <div
    className={cn(
      "text-sm leading-relaxed break-words space-y-3 text-foreground/90",
      "[&_h1]:text-lg [&_h1]:font-bold [&_h1]:text-foreground [&_h1]:mt-4",
      "[&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-4",
      "[&_h3]:text-sm [&_h3]:font-semibold [&_h3]:uppercase [&_h3]:tracking-wide [&_h3]:text-primary [&_h3]:mt-4",
      "[&_strong]:font-semibold [&_strong]:text-foreground",
      "[&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5",
      "[&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5",
      "[&_li]:marker:text-primary/70",
      "[&_hr]:my-4 [&_hr]:border-border/60",
      "[&_a]:text-primary [&_a]:underline",
      "[&_blockquote]:border-l-2 [&_blockquote]:border-primary/40 [&_blockquote]:pl-3 [&_blockquote]:italic",
      "[&_code]:rounded [&_code]:bg-muted [&_code]:px-1 [&_code]:py-0.5 [&_code]:text-xs",
      "[&_table]:w-full [&_table]:text-xs [&_th]:text-left [&_th]:font-semibold [&_td]:border-t [&_td]:border-border/40 [&_td]:py-1",
      className
    )}
  >
    <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
  </div>
);

export default AiMarkdown;
