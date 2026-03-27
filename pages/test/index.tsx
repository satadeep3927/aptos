import { useState } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";
import { ArrowRight, Brain, Clock, BarChart3, Loader2 } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Button } from "@/components/ui/button";
import { MarkdownRenderer } from "@/components/markdown-renderer";
import { trpc } from "@/lib/trpc";

const TEST_CONFIGS = {
  ccat: {
    name: "CCAT",
    fullName: "Criteria Cognitive Aptitude Test",
    questions: 50,
    minutes: 15,
    description:
      "Measures cognitive aptitude across mathematical, verbal, and spatial reasoning. Widely used by employers to assess learning potential.",
    color: "from-violet-500/20 to-purple-500/10",
    border: "border-violet-500/30 hover:border-violet-400/60",
    accent: "text-violet-400",
    badge: "bg-violet-500/10 text-violet-300",
  },
  wonderlic: {
    name: "Wonderlic",
    fullName: "Wonderlic Personnel Test",
    questions: 50,
    minutes: 12,
    description:
      "Evaluates general cognitive ability and problem-solving speed. Used across industries to predict job performance and training success.",
    color: "from-blue-500/20 to-cyan-500/10",
    border: "border-blue-500/30 hover:border-blue-400/60",
    accent: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-300",
  },
} as const;

export default function TestIndexPage() {
  const router = useRouter();
  const [generating, setGenerating] = useState<"ccat" | "wonderlic" | null>(null);

  const { data: latestRec } = trpc.test.getLatestRecommendation.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  const generate = trpc.test.generate.useMutation({
    onSuccess: ({ sessionId }) => {
      router.push(`/test/${sessionId}`);
    },
    onError: () => {
      setGenerating(null);
    },
  });

  const handleStart = (testType: "ccat" | "wonderlic") => {
    setGenerating(testType);
    generate.mutate({ testType });
  };

  return (
    <>
      <Head>
        <title>Practice Tests — Aptos</title>
      </Head>
      <div className="min-h-screen bg-[#0a0a0a] text-white">
        <Navbar />

        <main className="mx-auto max-w-5xl px-6 py-16">
          {/* Hero */}
          <div className="mb-14 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#E4FF30]/20 bg-[#E4FF30]/5 px-4 py-1.5 text-sm text-[#E4FF30]">
              <Brain className="size-3.5" />
              AI-Powered Practice
            </div>
            <h1 className="mb-4 text-4xl font-bold tracking-tight md:text-5xl">
              Ready to{" "}
              <span className="bg-gradient-to-r from-[#E4FF30] to-lime-400 bg-clip-text text-transparent">
                Practice?
              </span>
            </h1>
            <p className="mx-auto max-w-xl text-lg text-neutral-400">
              AI generates a unique set of 50 questions every session. Complete
              the test, get your score, and receive a personalised study plan.
            </p>
          </div>

          {/* Test cards */}
          <div className="grid gap-6 md:grid-cols-2">
            {(["ccat", "wonderlic"] as const).map((type) => {
              const cfg = TEST_CONFIGS[type];
              const isGenerating = generating === type;

              return (
                <div
                  key={type}
                  className={`relative overflow-hidden rounded-2xl border bg-gradient-to-br ${cfg.color} ${cfg.border} p-8 transition-all duration-200`}
                >
                  <div className="mb-6">
                    <span
                      className={`mb-3 inline-block rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider ${cfg.badge}`}
                    >
                      {cfg.name}
                    </span>
                    <h2 className="mb-2 text-2xl font-bold">{cfg.fullName}</h2>
                    <p className="text-sm leading-relaxed text-neutral-400">
                      {cfg.description}
                    </p>
                  </div>

                  <div className="mb-8 flex gap-6">
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <BarChart3 className={`size-4 ${cfg.accent}`} />
                      {cfg.questions} questions
                    </div>
                    <div className="flex items-center gap-2 text-sm text-neutral-300">
                      <Clock className={`size-4 ${cfg.accent}`} />
                      {cfg.minutes} minutes
                    </div>
                  </div>

                  <Button
                    onClick={() => handleStart(type)}
                    disabled={!!generating}
                    className="w-full bg-white/10 font-semibold text-white hover:bg-white/20 disabled:opacity-50"
                    size="lg"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 size-4 animate-spin" />
                        Generating questions…
                      </>
                    ) : (
                      <>
                        Start Test
                        <ArrowRight className="ml-2 size-4" />
                      </>
                    )}
                  </Button>
                </div>
              );
            })}
          </div>

          {/* Last recommendation */}
          {latestRec && (
            <div className="mt-14">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-bold text-neutral-100">
                  Your Last AI Recommendation
                </h2>
                <span className="rounded-full bg-[#E4FF30]/10 px-3 py-1 text-xs font-medium text-[#E4FF30]">
                  Score: {latestRec.score}/50 ·{" "}
                  {latestRec.testType.toUpperCase()}
                </span>
              </div>
              <div className="rounded-xl border border-neutral-800 bg-neutral-900/60 p-6">
                <MarkdownRenderer content={latestRec.content} variant="full" />
              </div>
              <div className="mt-4 text-right">
                <Link
                  href="/"
                  className="text-sm text-neutral-500 hover:text-neutral-300"
                >
                  Back to home
                </Link>
              </div>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
