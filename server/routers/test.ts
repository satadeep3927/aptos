import { z } from "zod";
import { generateText, Output } from "ai";
import { TRPCError } from "@trpc/server";
import { router, protectedProcedure } from "../trpc";
import { copilot } from "@/lib/providers/copilot";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface Question {
  id: number;
  category: "math" | "verbal" | "logic" | "pattern" | "spatial";
  difficulty: 1 | 2 | 3;
  question: string;
  options: { A: string; B: string; C: string; D: string; E: string };
  answer: "A" | "B" | "C" | "D" | "E";
  explanation: string;
}

export type QuestionForClient = Omit<Question, "answer" | "explanation">;

export interface CategoryBreakdown {
  category: string;
  correct: number;
  total: number;
}

// ---------------------------------------------------------------------------
// Zod schemas
// ---------------------------------------------------------------------------

const questionSchema = z.object({
  id: z.number(),
  category: z.enum(["math", "verbal", "logic", "pattern", "spatial"]),
  difficulty: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  question: z.string(),
  options: z.object({
    A: z.string(),
    B: z.string(),
    C: z.string(),
    D: z.string(),
    E: z.string(),
  }),
  answer: z.enum(["A", "B", "C", "D", "E"]),
  explanation: z.string(),
});

const questionsOutputSchema = z.object({
  questions: z.array(questionSchema),
});

// ---------------------------------------------------------------------------
// Batch generation config
// ---------------------------------------------------------------------------

const CATEGORY_BATCHES: Array<{
  category: Question["category"];
  count: number;
  idStart: number;
}> = [
  { category: "math",    count: 13, idStart: 1  },
  { category: "verbal",  count: 13, idStart: 14 },
  { category: "logic",   count: 12, idStart: 27 },
  { category: "pattern", count: 7,  idStart: 39 },
  { category: "spatial", count: 5,  idStart: 46 },
];

const CATEGORY_LABELS: Record<Question["category"], string> = {
  math:    "mathematical reasoning",
  verbal:  "verbal reasoning",
  logic:   "logical reasoning",
  pattern: "pattern recognition",
  spatial: "spatial reasoning",
};

// ---------------------------------------------------------------------------
// Prompts
// ---------------------------------------------------------------------------

function buildCategoryPrompt(
  testType: "ccat" | "wonderlic",
  category: Question["category"],
  count: number,
  idStart: number
): string {
  const testName =
    testType === "ccat"
      ? "Criteria Cognitive Aptitude Test (CCAT)"
      : "Wonderlic Personnel Test";
  const mathNote =
    category === "math"
      ? "\n- Use LaTeX inline math with single dollar signs: $...$ for formulas"
      : "";

  return `You are a psychometric test expert. Generate exactly ${count} ${CATEGORY_LABELS[category]} questions for the ${testName}.

Requirements:
- All questions must have category: "${category}"
- Assign IDs ${idStart} through ${idStart + count - 1} (inclusive, no gaps)
- Difficulty distribution: ~40% easy (1), ~40% medium (2), ~20% hard (3)${mathNote}
- Questions must be realistic and match the actual difficulty and style of the ${testName}
- Each question must have exactly 5 answer options (A through E)
- Vary question types within ${CATEGORY_LABELS[category]}`;
}

function buildRecommendationPrompt(
  testType: "ccat" | "wonderlic",
  score: number,
  timeTaken: number,
  breakdown: CategoryBreakdown[]
): string {
  const testName =
    testType === "ccat" ? "CCAT" : "Wonderlic";
  const timeLimit = testType === "ccat" ? 900 : 720;
  const pct = Math.round((score / 50) * 100);

  const breakdownText = breakdown
    .map((b) => `- ${b.category}: ${b.correct}/${b.total} correct`)
    .join("\n");

  return `You are an expert cognitive aptitude coach. A user just completed a ${testName} practice test.

Results:
- Score: ${score}/50 (${pct}%)
- Time used: ${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s out of ${Math.floor(timeLimit / 60)}m
- Category breakdown:
${breakdownText}

Write a detailed, personalized study recommendation in Markdown. Structure it with these sections:

## Score Interpretation
Explain what ${score}/50 means for the ${testName}, including percentile context.

## Time Management
Comment on their pacing (${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s used).

## Strengths
Highlight their best categories with encouragement.

## Areas to Improve
For each weak category (below 60%), provide:
- Why this category matters
- Specific techniques to improve
- For math concepts, include a worked example using LaTeX (inline: $...$, block: $$...$$)

## Study Plan
A concrete 2-week daily study plan with time estimates.

## Next Steps
Actionable immediate next steps.

Keep the tone encouraging but honest. Use LaTeX for any mathematical formulas or expressions.`;
}

// ---------------------------------------------------------------------------
// Router
// ---------------------------------------------------------------------------

/**
 * Run an array of async tasks with at most `limit` running concurrently.
 * Preserves result order.
 */
async function runConcurrent<T>(
  tasks: (() => Promise<T>)[],
  limit: number
): Promise<T[]> {
  const results: T[] = new Array(tasks.length);
  let next = 0;

  async function worker() {
    while (next < tasks.length) {
      const i = next++;
      results[i] = await tasks[i]();
    }
  }

  await Promise.all(
    Array.from({ length: Math.min(limit, tasks.length) }, () => worker())
  );
  return results;
}

export const testRouter = router({
  generate: protectedProcedure
    .input(z.object({ testType: z.enum(["ccat", "wonderlic"]) }))
    .mutation(async ({ ctx, input }) => {
      const dbUser = await ctx.db.user.findUnique({
        where: { auth0Id: ctx.user.sub },
      });
      if (!dbUser) throw new TRPCError({ code: "NOT_FOUND", message: "User not found" });

      // Generate category batches sequentially to avoid Copilot API rate-limiting
      const batches = await runConcurrent(
        CATEGORY_BATCHES.map(
          ({ category, count, idStart }) =>
            () =>
              generateText({
                model: copilot.languageModel("gpt-4.1"),
                output: Output.object({ schema: questionsOutputSchema }),
                prompt: buildCategoryPrompt(input.testType, category, count, idStart),
              }).then(({ output }) => output.questions)
        ),
        1
      );

      const questions: Question[] = batches.flat().sort((a, b) => a.id - b.id);

      const session = await ctx.db.testSession.create({
        data: {
          userId: dbUser.id,
          testType: input.testType,
          questions: questions as object[],
        },
      });

      return { sessionId: session.id };
    }),

  getSession: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const dbUser = await ctx.db.user.findUnique({
        where: { auth0Id: ctx.user.sub },
      });
      if (!dbUser) throw new TRPCError({ code: "NOT_FOUND" });

      const session = await ctx.db.testSession.findUnique({
        where: { id: input.sessionId },
      });

      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      if (session.userId !== dbUser.id) throw new TRPCError({ code: "FORBIDDEN" });

      const fullQuestions = session.questions as unknown as Question[];

      if (session.completed) {
        // For a completed session: return questions with correct answers + user's saved answers
        const savedAnswers = (session.answers ?? {}) as Record<string, "A" | "B" | "C" | "D" | "E">;
        const questions = fullQuestions.map(({ explanation: _e, ...q }) => q);
        return {
          sessionId: session.id,
          testType: session.testType as "ccat" | "wonderlic",
          questions,
          completed: true,
          createdAt: session.createdAt,
          savedAnswers,
          score: session.score ?? 0,
        };
      }

      // Active session: strip answers and explanations (anti-cheat)
      const questions = fullQuestions.map(
        ({ answer: _a, explanation: _e, ...q }): QuestionForClient => q
      );

      return {
        sessionId: session.id,
        testType: session.testType as "ccat" | "wonderlic",
        questions,
        completed: false,
        createdAt: session.createdAt,
        savedAnswers: undefined as undefined,
        score: undefined as undefined,
      };
    }),

  submit: protectedProcedure
    .input(
      z.object({
        sessionId: z.string(),
        answers: z.record(z.string(), z.enum(["A", "B", "C", "D", "E"])),
        timeTaken: z.number().int().min(0),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const dbUser = await ctx.db.user.findUnique({
        where: { auth0Id: ctx.user.sub },
      });
      if (!dbUser) throw new TRPCError({ code: "NOT_FOUND" });

      const session = await ctx.db.testSession.findUnique({
        where: { id: input.sessionId },
      });

      if (!session) throw new TRPCError({ code: "NOT_FOUND", message: "Session not found" });
      if (session.userId !== dbUser.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (session.completed) throw new TRPCError({ code: "BAD_REQUEST", message: "Session already submitted" });

      const questions = session.questions as unknown as Question[];

      // Score server-side
      let score = 0;
      const categoryMap: Record<string, { correct: number; total: number }> = {};

      for (const q of questions) {
        const cat = q.category;
        if (!categoryMap[cat]) categoryMap[cat] = { correct: 0, total: 0 };
        categoryMap[cat].total++;

        const userAnswer = input.answers[String(q.id)];
        if (userAnswer === q.answer) {
          score++;
          categoryMap[cat].correct++;
        }
      }

      const breakdown: CategoryBreakdown[] = Object.entries(categoryMap).map(
        ([category, stats]) => ({ category, ...stats })
      );

      // Generate recommendation
      const { text: recommendationMd } = await generateText({
        model: copilot.languageModel("gpt-4.1"),
        prompt: buildRecommendationPrompt(
          session.testType as "ccat" | "wonderlic",
          score,
          input.timeTaken,
          breakdown
        ),
      });

      // Persist
      await ctx.db.testSession.update({
        where: { id: session.id },
        data: {
          answers: input.answers,
          score,
          timeTaken: input.timeTaken,
          completed: true,
        },
      });

      const recommendation = await ctx.db.recommendation.create({
        data: {
          userId: dbUser.id,
          sessionId: session.id,
          content: recommendationMd,
          score,
          testType: session.testType,
        },
      });

      return {
        score,
        total: 50,
        categoryBreakdown: breakdown,
        recommendationId: recommendation.id,
      };
    }),

  getResults: protectedProcedure
    .input(z.object({ sessionId: z.string() }))
    .query(async ({ ctx, input }) => {
      const dbUser = await ctx.db.user.findUnique({
        where: { auth0Id: ctx.user.sub },
      });
      if (!dbUser) throw new TRPCError({ code: "NOT_FOUND" });

      const session = await ctx.db.testSession.findUnique({
        where: { id: input.sessionId },
        include: { recommendation: true },
      });

      if (!session) throw new TRPCError({ code: "NOT_FOUND" });
      if (session.userId !== dbUser.id) throw new TRPCError({ code: "FORBIDDEN" });
      if (!session.completed) throw new TRPCError({ code: "BAD_REQUEST", message: "Test not yet submitted" });

      const questions = session.questions as unknown as Question[];
      const answers = (session.answers ?? {}) as Record<string, string>;

      const reviewItems = questions.map((q) => ({
        id: q.id,
        category: q.category,
        question: q.question,
        options: q.options,
        correctAnswer: q.answer,
        userAnswer: answers[String(q.id)] ?? null,
        isCorrect: answers[String(q.id)] === q.answer,
        explanation: q.explanation,
      }));

      // Category breakdown
      const categoryMap: Record<string, { correct: number; total: number }> = {};
      for (const q of questions) {
        if (!categoryMap[q.category]) categoryMap[q.category] = { correct: 0, total: 0 };
        categoryMap[q.category].total++;
        if (answers[String(q.id)] === q.answer) categoryMap[q.category].correct++;
      }

      return {
        sessionId: session.id,
        testType: session.testType as "ccat" | "wonderlic",
        score: session.score ?? 0,
        total: 50,
        timeTaken: session.timeTaken ?? 0,
        categoryBreakdown: Object.entries(categoryMap).map(([category, stats]) => ({
          category,
          ...stats,
        })),
        reviewItems,
        recommendation: session.recommendation?.content ?? null,
      };
    }),

  getLatestRecommendation: protectedProcedure.query(async ({ ctx }) => {
    const dbUser = await ctx.db.user.findUnique({
      where: { auth0Id: ctx.user.sub },
    });
    if (!dbUser) throw new TRPCError({ code: "NOT_FOUND" });

    const rec = await ctx.db.recommendation.findFirst({
      where: { userId: dbUser.id },
      orderBy: { createdAt: "desc" },
    });

    return rec ?? null;
  }),
});
