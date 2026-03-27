import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import {
  CheckCircle,
  XCircle,
  TrendingUp,
  RotateCcw,
  Home,
  Loader2,
  AlertCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { trpc } from "@/lib/trpc";
import { cn } from "@/lib/utils";

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}m ${s}s`;
}

function ScoreColor(pct: number) {
  if (pct >= 70) return "text-emerald-400";
  if (pct >= 50) return "text-amber-400";
  return "text-red-400";
}

const CATEGORY_LABELS: Record<string, string> = {
  math: "Mathematics",
  verbal: "Verbal",
  logic: "Logic",
  pattern: "Pattern Recognition",
  spatial: "Spatial Reasoning",
};

export default function ResultsPage() {
  const router = useRouter();
  const sessionId = router.query.sessionId as string;
  const [expandedQuestion, setExpandedQuestion] = useState<number | null>(null);

  const { data, isLoading, error } = trpc.test.getResults.useQuery(
    { sessionId },
    { enabled: !!sessionId, retry: false, refetchOnWindowFocus: false }
  );

  if (!sessionId || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="text-center">
          <Loader2 className="mx-auto mb-4 size-8 animate-spin text-[#E4FF30]" />
          <p className="text-neutral-400">Loading your results…</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-white">
        <AlertCircle className="size-10 text-red-400" />
        <p className="text-neutral-400">Results not found.</p>
        <Button onClick={() => router.push("/test")} variant="outline">
          Back to Tests
        </Button>
      </div>
    );
  }

  const pct = Math.round((data.score / data.total) * 100);
  const scoreColor = ScoreColor(pct);

  return (
    <>
      <Head>
        <title>
          Results — {data.score}/{data.total} — Aptos
        </title>
      </Head>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <div className="mx-auto max-w-4xl px-6 py-10">
          {/* Score hero */}
          <div className="mb-10 rounded-2xl border border-neutral-800 bg-neutral-900/60 p-8 text-center">
            <div className="mb-2 text-sm font-medium uppercase tracking-widest text-neutral-500">
              {data.testType.toUpperCase()} Practice Test
            </div>
            <div className={cn("mb-2 text-7xl font-black tabular-nums", scoreColor)}>
              {data.score}
              <span className="text-4xl text-neutral-600">/{data.total}</span>
            </div>
            <div className={cn("mb-4 text-2xl font-bold", scoreColor)}>{pct}%</div>
            <div className="text-sm text-neutral-500">
              Completed in {formatTime(data.timeTaken)}
            </div>
            <div className="mt-2 text-xs text-neutral-600">
              {pct >= 70
                ? "Great performance! Above average for most applicants."
                : pct >= 50
                ? "Good effort. Focused practice will push you higher."
                : "Keep practising — consistency is key to improvement."}
            </div>
          </div>

          {/* Category breakdown */}
          <div className="mb-10">
            <h2 className="mb-5 text-lg font-bold text-neutral-100">
              Category Breakdown
            </h2>
            <div className="space-y-3">
              {data.categoryBreakdown.map((b) => {
                const catPct = Math.round((b.correct / b.total) * 100);
                const barColor =
                  catPct >= 70
                    ? "bg-emerald-400"
                    : catPct >= 50
                    ? "bg-amber-400"
                    : "bg-red-400";
                return (
                  <div key={b.category} className="rounded-xl border border-neutral-800 bg-neutral-900/40 p-4">
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="font-medium text-neutral-200">
                        {CATEGORY_LABELS[b.category] ?? b.category}
                      </span>
                      <span className="tabular-nums text-neutral-400">
                        {b.correct}/{b.total}
                        <span className="ml-1 text-neutral-600">({catPct}%)</span>
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-neutral-800">
                      <div
                        className={cn("h-full rounded-full transition-all duration-700", barColor)}
                        style={{ width: `${catPct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Recommendation */}
          {data.recommendation && (
            <div className="mb-10">
              <div className="mb-5 flex items-center gap-3">
                <TrendingUp className="size-5 text-[#E4FF30]" />
                <h2 className="text-lg font-bold text-neutral-100">
                  AI Study Recommendation
                </h2>
              </div>
              <div className="rounded-xl border border-[#E4FF30]/20 bg-[#E4FF30]/5 p-6">
                <MarkdownRenderer content={data.recommendation} variant="full" />
              </div>
            </div>
          )}

          {/* Question review */}
          <div className="mb-10">
            <h2 className="mb-5 text-lg font-bold text-neutral-100">
              Question Review
            </h2>
            <div className="space-y-2">
              {data.reviewItems.map((item) => {
                const isExpanded = expandedQuestion === item.id;
                return (
                  <div
                    key={item.id}
                    className={cn(
                      "rounded-xl border transition-colors",
                      item.isCorrect
                        ? "border-emerald-800/40 bg-emerald-950/20"
                        : "border-red-800/40 bg-red-950/20"
                    )}
                  >
                    <button
                      onClick={() =>
                        setExpandedQuestion(isExpanded ? null : item.id)
                      }
                      className="flex w-full items-center gap-3 p-4 text-left"
                    >
                      {item.isCorrect ? (
                        <CheckCircle className="size-4 shrink-0 text-emerald-400" />
                      ) : (
                        <XCircle className="size-4 shrink-0 text-red-400" />
                      )}
                      <span className="text-xs font-medium text-neutral-500">
                        Q{item.id}
                      </span>
                      <span className="flex-1 truncate text-sm text-neutral-300">
                        {/* Plain text preview — strip markdown for one-liner */}
                        {item.question.replace(/\$[^$]*\$/g, "[math]").slice(0, 80)}
                        {item.question.length > 80 ? "…" : ""}
                      </span>
                      <span className="ml-auto flex shrink-0 items-center gap-2 text-xs text-neutral-500">
                        {!item.isCorrect && (
                          <span>
                            <span className="text-red-400">You: {item.userAnswer ?? "—"}</span>
                            {" · "}
                            <span className="text-emerald-400">Ans: {item.correctAnswer}</span>
                          </span>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="size-3.5" />
                        ) : (
                          <ChevronDown className="size-3.5" />
                        )}
                      </span>
                    </button>

                    {isExpanded && (
                      <div className="border-t border-neutral-800 px-4 pb-4 pt-4">
                        <MarkdownRenderer content={item.question} variant="full" />
                        <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                          {(["A", "B", "C", "D", "E"] as const).map((letter) => (
                            <div
                              key={letter}
                              className={cn(
                                "flex items-start gap-2 rounded-lg border px-3 py-2 text-sm",
                                letter === item.correctAnswer
                                  ? "border-emerald-600/50 bg-emerald-900/20 text-emerald-300"
                                  : letter === item.userAnswer && !item.isCorrect
                                  ? "border-red-600/50 bg-red-900/20 text-red-300"
                                  : "border-neutral-800 text-neutral-500"
                              )}
                            >
                              <span className="shrink-0 font-bold">{letter}.</span>
                              <MarkdownRenderer
                                content={item.options[letter]}
                                variant="compact"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 rounded-lg border border-neutral-800 bg-neutral-900/60 p-3">
                          <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                            Explanation
                          </p>
                          <MarkdownRenderer content={item.explanation} variant="compact" />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button
              onClick={() => router.push("/test")}
              className="flex-1 bg-[#E4FF30] font-semibold text-neutral-900 hover:bg-[#d4ef20]"
              size="lg"
            >
              <RotateCcw className="mr-2 size-4" />
              Take Another Test
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="flex-1 border-neutral-700 text-neutral-300 hover:border-neutral-500"
            >
              <Link href="/">
                <Home className="mr-2 size-4" />
                Go Home
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
