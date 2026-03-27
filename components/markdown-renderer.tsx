import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
  /** Use "compact" for question/option text, "full" for long-form recommendations */
  variant?: "compact" | "full";
}

export function MarkdownRenderer({
  content,
  className,
  variant = "full",
}: MarkdownRendererProps) {
  return (
    <div
      className={cn(
        "prose prose-invert max-w-none",
        variant === "compact"
          ? "prose-sm [&>p]:my-0 [&>p]:inline"
          : "prose-base [&>h2]:text-[#E4FF30] [&>h2]:font-bold [&>h3]:text-neutral-200",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
