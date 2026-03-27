import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import remarkGfm from "remark-gfm";
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
        "prose prose-invert max-w-none text-neutral-300",
        variant === "compact"
          ? "prose-sm [&>p]:my-0 [&>p]:inline"
          : [
              "prose-base",
              "[&>h2]:text-[#E4FF30] [&>h2]:font-bold",
              "[&>h3]:text-neutral-200",
              // Table styles
              "[&_table]:w-full [&_table]:border-collapse [&_table]:text-sm",
              "[&_thead]:border-b [&_thead]:border-neutral-700",
              "[&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:text-neutral-300",
              "[&_td]:px-3 [&_td]:py-2 [&_td]:border-b [&_td]:border-neutral-800 [&_td]:text-neutral-300",
              "[&_tr:last-child>td]:border-0",
              "[&_tbody>tr:hover]:bg-neutral-800/40",
            ].join(" "),
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkMath, remarkGfm]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
