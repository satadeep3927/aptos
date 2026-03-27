import { useEffect, useRef, useState, useCallback } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import { Clock, ChevronLeft, ChevronRight, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { trpc } from "@/lib/trpc";
import type { QuestionForClient } from "@/server/routers/test";
import { cn } from "@/lib/utils";

const TIME_LIMITS = { ccat: 15 * 60, wonderlic: 12 * 60 };

function formatTime(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export default function ActiveTestPage() {
  const router = useRouter();
  const sessionId = router.query.sessionId as string;

  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState<Record<number, "A" | "B" | "C" | "D" | "E">>({});
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [autoSubmitted, setAutoSubmitted] = useState(false);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const { data: session, isLoading, error } = trpc.test.getSession.useQuery(
    { sessionId },
    { enabled: !!sessionId, retry: false, refetchOnWindowFocus: false }
  );

  const submitMutation = trpc.test.submit.useMutation({
    onSuccess: () => {
      router.push(`/test/results/${sessionId}`);
    },
    onError: () => {
      setSubmitting(false);
    },
  });

  // Initialise timer once session loads
  useEffect(() => {
    if (!session) return;
    const limit = TIME_LIMITS[session.testType];
    setTimeLeft(limit);
    startTimeRef.current = Date.now();
  }, [session]);

  const handleSubmit = useCallback(
    (forced = false) => {
      if (submitting || !session) return;
      setSubmitting(true);
      if (forced) setAutoSubmitted(true);
      if (timerRef.current) clearInterval(timerRef.current);
      const timeTaken = Math.floor((Date.now() - startTimeRef.current) / 1000);
      submitMutation.mutate({
        sessionId,
        answers: Object.fromEntries(
          Object.entries(answers).map(([k, v]) => [k, v])
        ) as Record<string, "A" | "B" | "C" | "D" | "E">,
        timeTaken,
      });
    },
    [submitting, session, sessionId, answers, submitMutation]
  );

  // Countdown
  useEffect(() => {
    if (timeLeft === null) return;
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t === null || t <= 1) {
          clearInterval(timerRef.current!);
          handleSubmit(true);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeLeft !== null]);

  if (!sessionId || isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <Loader2 className="size-8 animate-spin text-[#E4FF30]" />
      </div>
    );
  }

  if (error || !session) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#0a0a0a] text-white">
        <AlertCircle className="size-10 text-red-400" />
        <p className="text-neutral-400">Session not found.</p>
        <Button onClick={() => router.push("/test")} variant="outline">
          Back to Tests
        </Button>
      </div>
    );
  }

  const questions: QuestionForClient[] = session.questions as QuestionForClient[];
  const q = questions[currentIdx];
  const answered = Object.keys(answers).length;
  const total = questions.length;
  const pct = Math.round((answered / total) * 100);
  const isUrgent = timeLeft !== null && timeLeft < 60;
  const canSubmit = answered > 0 && !submitting;

  return (
    <>
      <Head>
        <title>
          {session.testType.toUpperCase()} Practice — Aptos
        </title>
      </Head>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        {/* Top bar */}
        <div className="sticky top-0 z-40 border-b border-neutral-800/60 bg-[#0a0a0a]/95 backdrop-blur-xl">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
            <span className="text-sm font-medium text-neutral-400">
              {session.testType.toUpperCase()} — Q{currentIdx + 1}/{total}
            </span>

            {/* Progress bar */}
            <div className="mx-6 hidden h-1.5 flex-1 overflow-hidden rounded-full bg-neutral-800 md:block">
              <div
                className="h-full rounded-full bg-[#E4FF30] transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* Timer */}
            <div
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-mono font-bold tabular-nums",
                isUrgent
                  ? "bg-red-500/20 text-red-400 animate-pulse"
                  : "bg-neutral-800 text-neutral-200"
              )}
            >
              <Clock className="size-3.5" />
              {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-5xl gap-6 px-6 py-8 md:grid-cols-[1fr_200px]">
          {/* Main content */}
          <div>
            {/* Question */}
            <div className="mb-6 rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
              <div className="mb-4 flex items-center gap-3">
                <span className="rounded-full bg-[#E4FF30]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#E4FF30]">
                  {q.category}
                </span>
                <span className="text-xs text-neutral-500">
                  {"●".repeat(q.difficulty)}{"○".repeat(3 - q.difficulty)}
                </span>
              </div>
              <MarkdownRenderer content={q.question} variant="full" />
            </div>

            {/* Options */}
            <div className="space-y-3">
              {(["A", "B", "C", "D", "E"] as const).map((letter) => {
                const optionText = q.options[letter];
                const isSelected = answers[q.id] === letter;
                return (
                  <button
                    key={letter}
                    onClick={() =>
                      setAnswers((prev) => ({ ...prev, [q.id]: letter }))
                    }
                    className={cn(
                      "flex w-full items-start gap-4 rounded-xl border p-4 text-left transition-all duration-150",
                      isSelected
                        ? "border-[#E4FF30]/50 bg-[#E4FF30]/10 text-white"
                        : "border-neutral-800 bg-neutral-900/40 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800/60"
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-7 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                        isSelected
                          ? "bg-[#E4FF30] text-neutral-900"
                          : "bg-neutral-700 text-neutral-300"
                      )}
                    >
                      {letter}
                    </span>
                    <MarkdownRenderer content={optionText} variant="compact" />
                  </button>
                );
              })}
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center justify-between">
              <Button
                variant="outline"
                onClick={() => setCurrentIdx((i) => Math.max(0, i - 1))}
                disabled={currentIdx === 0}
                className="border-neutral-700 text-neutral-300 hover:border-neutral-500"
              >
                <ChevronLeft className="mr-1 size-4" />
                Previous
              </Button>

              {currentIdx < total - 1 ? (
                <Button
                  onClick={() => setCurrentIdx((i) => Math.min(total - 1, i + 1))}
                  className="bg-neutral-800 text-white hover:bg-neutral-700"
                >
                  Next
                  <ChevronRight className="ml-1 size-4" />
                </Button>
              ) : (
                <Button
                  onClick={() => handleSubmit(false)}
                  disabled={!canSubmit}
                  className="bg-[#E4FF30] font-semibold text-neutral-900 hover:bg-[#d4ef20] disabled:opacity-50"
                >
                  {submitting ? (
                    <><Loader2 className="mr-2 size-4 animate-spin" />Submitting…</>
                  ) : (
                    `Submit Test (${answered}/${total} answered)`
                  )}
                </Button>
              )}
            </div>

            {/* Can submit from any question */}
            {currentIdx < total - 1 && canSubmit && (
              <div className="mt-4 text-center">
                <button
                  onClick={() => handleSubmit(false)}
                  disabled={submitting}
                  className="text-sm text-neutral-500 underline-offset-2 hover:text-neutral-300 hover:underline"
                >
                  {submitting ? "Submitting…" : `Finish early (${answered}/${total} answered)`}
                </button>
              </div>
            )}

            {autoSubmitted && (
              <p className="mt-4 text-center text-sm text-red-400">
                Time&apos;s up! Your answers have been submitted automatically.
              </p>
            )}
          </div>

          {/* Question grid sidebar */}
          <div className="hidden md:block">
            <div className="sticky top-20 rounded-xl border border-neutral-800 bg-neutral-900/60 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-neutral-500">
                Questions
              </p>
              <div className="grid grid-cols-5 gap-1">
                {questions.map((question, i) => {
                  const isAnswered = !!answers[question.id];
                  const isCurrent = i === currentIdx;
                  return (
                    <button
                      key={question.id}
                      onClick={() => setCurrentIdx(i)}
                      className={cn(
                        "flex size-8 items-center justify-center rounded text-xs font-medium transition-all",
                        isCurrent
                          ? "bg-[#E4FF30] text-neutral-900"
                          : isAnswered
                          ? "bg-neutral-600 text-white"
                          : "bg-neutral-800 text-neutral-500 hover:bg-neutral-700"
                      )}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 space-y-1.5 text-xs text-neutral-500">
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-[#E4FF30]" /> Current
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-neutral-600" /> Answered
                </div>
                <div className="flex items-center gap-2">
                  <span className="size-3 rounded bg-neutral-800" /> Unanswered
                </div>
              </div>
              <div className="mt-4 border-t border-neutral-800 pt-4 text-center">
                <span className="text-sm font-bold text-[#E4FF30]">{answered}</span>
                <span className="text-xs text-neutral-500">/{total} answered</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
